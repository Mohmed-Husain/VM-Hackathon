from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.ocr import PassportOcrExtraction

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
    ocr_extraction: PassportOcrExtraction | None = None
    created_at: datetime
