from typing import Generic, Optional, TypeVar, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True)
    data: Optional[T] = Field(default=None)
    message: str = Field(default="Success")
    error: Optional[Any] = Field(default=None)

    @classmethod
    def respond(cls, data: Optional[T] = None, message: str = "Success") -> "APIResponse[T]":
        return cls(success=True, data=data, message=message, error=None)
