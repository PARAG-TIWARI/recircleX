from typing import List
from fastapi import APIRouter, Depends, status
from backend.app.core.security import get_current_user
from backend.app.models.user import User
from backend.app.schemas.common import APIResponse
from backend.app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from backend.app.services.address_service import address_service

router = APIRouter(prefix="/addresses", tags=["Addresses"])



@router.get("/reverse-geocode", response_model=APIResponse[dict])
async def reverse_geocode(lat: float, lon: float):
    """Resolve coordinates into a readable address using OSM Nominatim."""
    import httpx
    
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=18&addressdetails=1"
    headers = {"User-Agent": "RecycleX/1.0 (contact@recyclex.in)"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                address = data.get("address", {})
                
                # Format a readable street address
                road = address.get("road") or address.get("suburb") or address.get("neighbourhood") or ""
                suburb = address.get("suburb") or address.get("city_district") or ""
                street_parts = [p for p in [road, suburb] if p]
                street_address = ", ".join(street_parts) if street_parts else data.get("name", "Unknown Location")
                
                resolved = {
                    "street_address": street_address,
                    "city": address.get("city") or address.get("town") or address.get("village") or "Mumbai",
                    "state": address.get("state") or "Maharashtra",
                    "postal_code": address.get("postcode") or "400001",
                    "latitude": lat,
                    "longitude": lon
                }
                return APIResponse.respond(data=resolved)
            else:
                return APIResponse.respond(success=False, message="Reverse geocoding service returned an error", status_code=502)
    except Exception as e:
        return APIResponse.respond(success=False, message=f"Failed to reverse geocode: {str(e)}", status_code=500)


@router.post("", response_model=APIResponse[AddressResponse], status_code=status.HTTP_201_CREATED)
async def create_address(
    payload: AddressCreate,
    current_user: User = Depends(get_current_user),
):
    """Add a new address for the authenticated household."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    address = await address_service.create_address(user_id=user_id, data=payload)
    return APIResponse.respond(
        data=AddressResponse(**address.model_dump()),
        message="Address saved successfully",
    )


@router.get("", response_model=APIResponse[List[AddressResponse]])
async def get_my_addresses(
    current_user: User = Depends(get_current_user),
):
    """Get all saved addresses for the authenticated household."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    addresses = await address_service.get_user_addresses(user_id=user_id)
    return APIResponse.respond(
        data=[AddressResponse(**a.model_dump()) for a in addresses]
    )


@router.patch("/{address_id}", response_model=APIResponse[AddressResponse])
async def update_address(
    address_id: str,
    payload: AddressUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update an existing address."""
    user_id = current_user.clerk_user_id or str(current_user.id)
    updated = await address_service.update_address(address_id=address_id, user_id=user_id, data=payload)
    return APIResponse.respond(
        data=AddressResponse(**updated.model_dump()),
        message="Address updated",
    )
