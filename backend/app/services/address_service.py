from typing import List, Optional
from fastapi import HTTPException
from backend.app.models.address import Address
from backend.app.schemas.address import AddressCreate, AddressUpdate
from backend.app.repositories.address_repository import address_repository


class AddressService:
    """Business logic for managing user addresses."""

    async def create_address(self, user_id: str, data: AddressCreate) -> Address:
        if data.is_default:
            await address_repository.unset_default(user_id)

        # If user has no addresses yet, make this default automatically
        existing = await address_repository.get_by_user(user_id)
        is_default = data.is_default or len(existing) == 0

        address = Address(
            user_id=user_id,
            label=data.label,
            street_address=data.street_address,
            city=data.city,
            state=data.state,
            postal_code=data.postal_code,
            landmark=data.landmark,
            contact_phone=data.contact_phone,
            latitude=data.latitude,
            longitude=data.longitude,
            is_default=is_default,
        )
        return await address_repository.create(address)

    async def get_user_addresses(self, user_id: str) -> List[Address]:
        return await address_repository.get_by_user(user_id)

    async def update_address(self, address_id: str, user_id: str, data: AddressUpdate) -> Address:
        addr = await address_repository.get_by_id(address_id)
        if not addr:
            raise HTTPException(status_code=404, detail="Address not found")
        if addr.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        if data.is_default:
            await address_repository.unset_default(user_id)

        update_dict = data.model_dump(exclude_unset=True)
        if update_dict:
            updated = await address_repository.update(address_id, update_dict)
            if updated:
                return updated
        return addr


address_service = AddressService()
