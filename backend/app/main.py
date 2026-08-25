from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.db.mongodb import connect_to_mongo, close_mongo_connection
from backend.app.middleware.request_id import RequestIdMiddleware
from backend.app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from backend.app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown."""
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode...")
    await connect_to_mongo()
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")
    await close_mongo_connection()


def create_application() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="RecycleX - Digital infrastructure for the circular recycling ecosystem",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # Register Middlewares
    app.add_middleware(RequestIdMiddleware)

    cors_origins = list(settings.CORS_ORIGINS) if isinstance(settings.CORS_ORIGINS, list) else ["*"]
    default_origins = [
        "https://frontend-mocha-nine-12.vercel.app",
        "https://recirclex.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    if "*" not in cors_origins:
        for origin in default_origins:
            if origin not in cors_origins:
                cors_origins.append(origin)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register Exception Handlers
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    # Include API Routers
    app.include_router(api_v1_router)

    from backend.app.api.v1.health import check_health

    @app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
    async def root_health(response: Response):
        return await check_health(response)

    @app.api_route("/", methods=["GET", "HEAD"], tags=["Root"])
    async def root():
        return {
            "name": settings.APP_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
