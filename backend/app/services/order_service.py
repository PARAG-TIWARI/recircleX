from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from backend.app.models.order import Order
from backend.app.models.notification import Notification
from backend.app.schemas.order import OrderResponse, OrderListResponse, OrderStatusUpdate
from backend.app.repositories.order_repository import order_repository
from backend.app.repositories.marketplace_repository import marketplace_repository
from backend.app.repositories.inventory_repository import inventory_repository
from backend.app.repositories.notification_repository import notification_repository
from backend.app.repositories.profile_repository import ProfileRepository
from backend.app.db.mongodb import get_database


class OrderService:
    def _get_profile_repo(self) -> ProfileRepository:
        return ProfileRepository(get_database())

    async def get_orders(
        self, user_id: str, as_seller: bool = False, status_filter: Optional[str] = None, limit: int = 50, skip: int = 0
    ) -> OrderListResponse:
        if as_seller:
            orders = await order_repository.get_by_seller(user_id, status_filter=status_filter, limit=limit, skip=skip)
            total = await order_repository.count_by_seller(user_id, status_filter=status_filter)
        else:
            orders = await order_repository.get_by_buyer(user_id, status_filter=status_filter, limit=limit, skip=skip)
            total = await order_repository.count_by_buyer(user_id, status_filter=status_filter)

        prof_repo = self._get_profile_repo()
        items: List[OrderResponse] = []

        for o in orders:
            buyer_prof = await prof_repo.get_by_user_id(o.buyer_id)
            seller_prof = await prof_repo.get_by_user_id(o.seller_id)

            items.append(
                OrderResponse(
                    id=o.id,
                    buyer_id=o.buyer_id,
                    seller_id=o.seller_id,
                    marketplace_listing_id=o.marketplace_listing_id,
                    material=o.material,
                    category=o.category,
                    quantity=o.quantity,
                    unit=o.unit,
                    unit_price=o.unit_price,
                    total_amount=o.total_amount,
                    quality=o.quality,
                    status=o.status,
                    delivery_address=o.delivery_address,
                    notes=o.notes,
                    timeline=o.timeline,
                    created_at=o.created_at,
                    updated_at=o.updated_at,
                    buyer_name=buyer_prof.company_name or buyer_prof.name if buyer_prof else "Recycler Buyer",
                    seller_name=seller_prof.name if seller_prof else "Collection Partner",
                    seller_service_area=seller_prof.service_area if seller_prof else "Metro Zone 1",
                )
            )

        return OrderListResponse(items=items, total=total)

    async def get_order_detail(self, order_id: str, user_id: str) -> OrderResponse:
        o = await order_repository.get_by_id(order_id)
        if not o:
            raise HTTPException(status_code=404, detail="Order not found")
        if o.buyer_id != user_id and o.seller_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this order")

        prof_repo = self._get_profile_repo()
        buyer_prof = await prof_repo.get_by_user_id(o.buyer_id)
        seller_prof = await prof_repo.get_by_user_id(o.seller_id)

        return OrderResponse(
            id=o.id,
            buyer_id=o.buyer_id,
            seller_id=o.seller_id,
            marketplace_listing_id=o.marketplace_listing_id,
            material=o.material,
            category=o.category,
            quantity=o.quantity,
            unit=o.unit,
            unit_price=o.unit_price,
            total_amount=o.total_amount,
            quality=o.quality,
            status=o.status,
            delivery_address=o.delivery_address,
            notes=o.notes,
            timeline=o.timeline,
            created_at=o.created_at,
            updated_at=o.updated_at,
            buyer_name=buyer_prof.company_name or buyer_prof.name if buyer_prof else "Recycler Buyer",
            seller_name=seller_prof.name if seller_prof else "Collection Partner",
            seller_service_area=seller_prof.service_area if seller_prof else "Metro Zone 1",
        )

    async def update_order_status(
        self, order_id: str, user_id: str, payload: OrderStatusUpdate
    ) -> OrderResponse:
        o = await order_repository.get_by_id(order_id)
        if not o:
            raise HTTPException(status_code=404, detail="Order not found")
        if o.buyer_id != user_id and o.seller_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this order")

        new_status = payload.status
        now = datetime.utcnow()
        timeline_entry = {
            "title": f"Status updated to {new_status}",
            "description": payload.notes or f"Order progressed to {new_status} state.",
            "timestamp": now,
            "status": new_status,
        }

        # 1. Update Order
        updated_timeline = list(o.timeline) + [timeline_entry]
        await order_repository.update(
            order_id,
            {
                "status": new_status,
                "timeline": updated_timeline,
            },
        )

        # 2. Sync Marketplace Listing & Collector Inventory if COMPLETED or CANCELLED
        listing = await marketplace_repository.get_by_id(o.marketplace_listing_id)
        if new_status == "COMPLETED":
            if listing:
                await marketplace_repository.update(listing.id, {"status": "SOLD"})
                if listing.inventory_id:
                    await inventory_repository.update(listing.inventory_id, {"status": "SOLD"})
        elif new_status == "CANCELLED":
            if listing:
                await marketplace_repository.update(listing.id, {"status": "ACTIVE"})
                if listing.inventory_id:
                    await inventory_repository.update(listing.inventory_id, {"status": "AVAILABLE"})

        # 3. Notify Counterparty
        notify_user = o.seller_id if user_id == o.buyer_id else o.buyer_id
        await notification_repository.create(
            Notification(
                user_id=notify_user,
                title=f"Order {new_status}",
                message=f"Order for {o.quantity} {o.unit} {o.material} has been updated to {new_status}.",
                type="ORDER",
                action_url=f"/business/recycler/orders/{order_id}",
            )
        )

        return await self.get_order_detail(order_id, user_id)


order_service = OrderService()
