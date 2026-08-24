from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class ProfileBase(BaseModel):
    user_id: str
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[Dict[str, Any]] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[Dict[str, Any]] = None


class ProfileRead(ProfileBase):
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
