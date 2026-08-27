from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

DocumentType = Literal["passport_scan", "applicant_photo", "flight_itinerary", "hotel_booking"]


class DocumentResponse(BaseModel):
    document_id: UUID
    application_id: UUID
    document_type: DocumentType
    file_name: str
    storage_path: str
    public_url: str
    content_type: str
    file_size_bytes: int
    created_at: datetime
