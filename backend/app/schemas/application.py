from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

VisaCategory = Literal["tourist_standard", "tourist_multi_entry", "business_expedited"]
ApplicationStatus = Literal["Draft", "In Progress", "Review Ready", "Payment Pending", "Submitted"]


class PersonalDetailsDraft(BaseModel):
    first_name: str = ""
    last_name: str = ""
    date_of_birth: str = ""
    nationality: str = ""
    gender: str = ""
    marital_status: str = ""
    occupation: str = ""


class PassportDraft(BaseModel):
    passport_number: str = ""
    issuing_country: str = ""
    issue_date: str = ""
    expiry_date: str = ""


class TravelDraft(BaseModel):
    intended_arrival_date: str = ""
    port_of_entry: str = ""
    stay_duration_days: str = ""
    accommodation_address: str = ""


class DocumentsDraft(BaseModel):
    passport_scan_ready: bool = False
    applicant_photo_ready: bool = False
    flight_itinerary_ready: bool = False
    hotel_booking_ready: bool = False


class ReviewDraft(BaseModel):
    declaration_accepted: bool = False


class ApplicationFormData(BaseModel):
    personal: PersonalDetailsDraft = Field(default_factory=PersonalDetailsDraft)
    passport: PassportDraft = Field(default_factory=PassportDraft)
    travel: TravelDraft = Field(default_factory=TravelDraft)
    documents: DocumentsDraft = Field(default_factory=DocumentsDraft)
    review: ReviewDraft = Field(default_factory=ReviewDraft)


class CreateApplicationRequest(BaseModel):
    user_id: UUID | None = None
    visa_category: VisaCategory


class SaveDraftRequest(BaseModel):
    current_step: int = Field(ge=1, le=5)
    form_data: ApplicationFormData


class ValidationIssueResponse(BaseModel):
    field: str
    messages: list[str]


class StepValidationResponse(BaseModel):
    step: int
    is_complete: bool
    issues: list[ValidationIssueResponse]


class ValidationSummaryResponse(BaseModel):
    is_review_ready: bool
    progress_percentage: int
    steps: list[StepValidationResponse]


class ApplicationSummaryResponse(BaseModel):
    application_id: UUID
    visa_category: VisaCategory
    status: ApplicationStatus
    current_step: int
    progress_percentage: int
    updated_at: datetime


class ApplicationDetailResponse(BaseModel):
    application_id: UUID
    user_id: UUID
    visa_category: VisaCategory
    status: ApplicationStatus
    current_step: int
    progress_percentage: int
    form_data: ApplicationFormData
    validation_summary: ValidationSummaryResponse
    created_at: datetime
    updated_at: datetime
