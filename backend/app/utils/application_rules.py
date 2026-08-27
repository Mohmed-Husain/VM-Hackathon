import calendar
import re
from dataclasses import dataclass
from datetime import date

from app.schemas.application import ApplicationFormData

PASSPORT_NUMBER_PATTERN = re.compile(r"^[A-Z0-9]{6,9}$")

REQUIRED_PERSONAL_FIELDS = [
    "first_name",
    "last_name",
    "date_of_birth",
    "nationality",
    "gender",
    "marital_status",
    "occupation",
]
REQUIRED_PASSPORT_FIELDS = [
    "passport_number",
    "issuing_country",
    "issue_date",
    "expiry_date",
]
REQUIRED_TRAVEL_FIELDS = [
    "intended_arrival_date",
    "port_of_entry",
    "stay_duration_days",
    "accommodation_address",
]
REQUIRED_DOCUMENT_FLAGS = [
    "passport_scan_ready",
    "applicant_photo_ready",
    "flight_itinerary_ready",
    "hotel_booking_ready",
]
STEP_WEIGHTS = {
    "personal": 20,
    "passport": 25,
    "travel": 15,
    "documents": 25,
    "review": 15,
}
STEP_FIELD_PATHS = {
    1: [f"personal.{field}" for field in REQUIRED_PERSONAL_FIELDS],
    2: [f"passport.{field}" for field in REQUIRED_PASSPORT_FIELDS],
    3: [f"travel.{field}" for field in REQUIRED_TRAVEL_FIELDS],
    4: [f"documents.{field}" for field in REQUIRED_DOCUMENT_FLAGS],
    5: ["review.declaration_accepted"],
}


@dataclass
class ValidationSummary:
    step_errors: dict[int, dict[str, list[str]]]
    step_completion: dict[int, bool]
    progress_percentage: int
    is_review_ready: bool


def parse_iso_date(value: str) -> date | None:
    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def add_months(source_date: date, months: int) -> date:
    month_index = source_date.month - 1 + months
    year = source_date.year + month_index // 12
    month = month_index % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def build_empty_errors() -> dict[int, dict[str, list[str]]]:
    return {step: {} for step in range(1, 6)}


def add_error(step_errors: dict[int, dict[str, list[str]]], step: int, field: str, message: str) -> None:
    field_errors = step_errors[step].setdefault(field, [])
    if message not in field_errors:
        field_errors.append(message)


def count_completed_fields(values: dict, keys: list[str]) -> int:
    completed = 0
    for key in keys:
        value = values.get(key)
        if isinstance(value, bool):
            completed += int(value)
        elif isinstance(value, str):
            completed += int(value.strip() != "")
        else:
            completed += int(value is not None)
    return completed


def calculate_progress(form_data: ApplicationFormData) -> int:
    payload = form_data.model_dump()
    progress = 0.0
    progress += (count_completed_fields(payload["personal"], REQUIRED_PERSONAL_FIELDS) / len(REQUIRED_PERSONAL_FIELDS)) * STEP_WEIGHTS["personal"]
    progress += (count_completed_fields(payload["passport"], REQUIRED_PASSPORT_FIELDS) / len(REQUIRED_PASSPORT_FIELDS)) * STEP_WEIGHTS["passport"]
    progress += (count_completed_fields(payload["travel"], REQUIRED_TRAVEL_FIELDS) / len(REQUIRED_TRAVEL_FIELDS)) * STEP_WEIGHTS["travel"]
    progress += (count_completed_fields(payload["documents"], REQUIRED_DOCUMENT_FLAGS) / len(REQUIRED_DOCUMENT_FLAGS)) * STEP_WEIGHTS["documents"]
    progress += (count_completed_fields(payload["review"], ["declaration_accepted"]) / 1) * STEP_WEIGHTS["review"]
    return int(progress + 0.5)


def build_validation_summary(form_data: ApplicationFormData) -> ValidationSummary:
    payload = form_data.model_dump()
    step_errors = build_empty_errors()

    for field in REQUIRED_PERSONAL_FIELDS:
        if not payload["personal"].get(field, "").strip():
            add_error(step_errors, 1, f"personal.{field}", "This field is required.")

    for field in ["passport_number", "issuing_country", "issue_date", "expiry_date"]:
        if not payload["passport"].get(field, "").strip():
            add_error(step_errors, 2, f"passport.{field}", "This field is required.")

    passport_number = payload["passport"].get("passport_number", "").strip().upper()
    if passport_number and not PASSPORT_NUMBER_PATTERN.fullmatch(passport_number):
        add_error(step_errors, 2, "passport.passport_number", "Passport number must be 6 to 9 uppercase letters or digits.")

    issue_date = parse_iso_date(payload["passport"].get("issue_date", ""))
    expiry_date = parse_iso_date(payload["passport"].get("expiry_date", ""))
    if payload["passport"].get("issue_date") and issue_date is None:
        add_error(step_errors, 2, "passport.issue_date", "Enter a valid issue date.")
    if payload["passport"].get("expiry_date") and expiry_date is None:
        add_error(step_errors, 2, "passport.expiry_date", "Enter a valid expiry date.")
    if issue_date and expiry_date and issue_date > expiry_date:
        add_error(step_errors, 2, "passport.expiry_date", "Passport expiry must be after the issue date.")

    for field in ["intended_arrival_date", "port_of_entry", "stay_duration_days", "accommodation_address"]:
        if not payload["travel"].get(field, "").strip():
            add_error(step_errors, 3, f"travel.{field}", "This field is required.")

    arrival_date = parse_iso_date(payload["travel"].get("intended_arrival_date", ""))
    if payload["travel"].get("intended_arrival_date") and arrival_date is None:
        add_error(step_errors, 3, "travel.intended_arrival_date", "Enter a valid intended arrival date.")

    stay_duration_value = payload["travel"].get("stay_duration_days", "").strip()
    if stay_duration_value:
        try:
            duration = int(stay_duration_value)
            if duration <= 0:
                raise ValueError
        except ValueError:
            add_error(step_errors, 3, "travel.stay_duration_days", "Stay duration must be a positive number of days.")

    if arrival_date and expiry_date and expiry_date < add_months(arrival_date, 6):
        add_error(
            step_errors,
            2,
            "passport.expiry_date",
            "Passport must remain valid for at least 6 months after the intended arrival date.",
        )

    for field in REQUIRED_DOCUMENT_FLAGS:
        if not payload["documents"].get(field, False):
            add_error(step_errors, 4, f"documents.{field}", "This document is required before review.")

    prior_steps_complete = all(not step_errors[step] for step in range(1, 5))
    if not payload["review"].get("declaration_accepted", False):
        add_error(step_errors, 5, "review.declaration_accepted", "You must accept the declaration before review is complete.")
    if not prior_steps_complete:
        add_error(step_errors, 5, "review.readiness", "Complete the earlier steps before the application is review ready.")

    step_completion = {step: not errors for step, errors in step_errors.items()}
    is_review_ready = all(step_completion[step] for step in range(1, 5))

    return ValidationSummary(
        step_errors=step_errors,
        step_completion=step_completion,
        progress_percentage=calculate_progress(form_data),
        is_review_ready=is_review_ready,
    )


def derive_status(validation_summary: ValidationSummary) -> str:
    if validation_summary.progress_percentage == 0:
        return "Draft"
    if validation_summary.is_review_ready:
        return "Review Ready"
    return "In Progress"
