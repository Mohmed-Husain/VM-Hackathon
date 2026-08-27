from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class OcrExtractedFields(BaseModel):
    first_name: str = ""
    last_name: str = ""
    date_of_birth: str = ""
    nationality: str = ""
    passport_number: str = ""
    issuing_country: str = ""
    issue_date: str = ""
    expiry_date: str = ""


class PassportOcrRequest(BaseModel):
    application_id: UUID
    document_id: UUID | None = None


class PassportOcrExtraction(BaseModel):
    status: Literal["completed"] = "completed"
    source: Literal["simulated"] = "simulated"
    extracted_at: datetime
    confidence_score: float = Field(ge=0.0, le=1.0)
    extracted_fields: OcrExtractedFields
    advisory_notes: list[str] = Field(default_factory=list)


class PassportOcrResponse(PassportOcrExtraction):
    document_id: UUID
    application_id: UUID
