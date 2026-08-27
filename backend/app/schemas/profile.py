from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ProfilePayload(BaseModel):
    first_name: str = ""
    last_name: str = ""
    date_of_birth: str = ""
    nationality: str = ""
    gender: str = ""
    marital_status: str = ""
    occupation: str = ""
    passport_number: str = ""
    issuing_country: str = ""
    issue_date: str = ""
    expiry_date: str = ""


class ProfileResponse(ProfilePayload):
    profile_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
