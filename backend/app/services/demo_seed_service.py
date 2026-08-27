from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.repositories.application_repository import ApplicationRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.user_repository import UserRepository
from app.services.application_service import build_empty_form_data
from sqlalchemy.ext.asyncio import AsyncSession

DEMO_USERS = [
    {
        "email": "applicant@example.com",
        "password": "password123",
        "full_name": "Husain Al-Mansoor",
    },
    {
        "email": "maya.traveler@example.com",
        "password": "demo2026!",
        "full_name": "Maya Sharma",
    },
]

SEEDED_DRAFT = {
    "visa_category": "tourist_standard",
    "status": "In Progress",
    "current_step": 3,
    "progress_percentage": 63,
    "form_data": {
        "personal": {
            "first_name": "Husain",
            "last_name": "Al-Mansoor",
            "date_of_birth": "1998-05-14",
            "nationality": "OMN",
            "gender": "male",
            "marital_status": "single",
            "occupation": "Product Designer",
        },
        "passport": {
            "passport_number": "A12345678",
            "issuing_country": "OMN",
            "issue_date": "2022-01-10",
            "expiry_date": "2032-01-09",
        },
        "travel": {
            "intended_arrival_date": "2026-11-01",
            "port_of_entry": "Mumbai",
            "stay_duration_days": "14",
            "accommodation_address": "",
        },
        "documents": {
            "passport_scan_ready": True,
            "applicant_photo_ready": False,
            "flight_itinerary_ready": False,
            "hotel_booking_ready": False,
        },
        "review": {
            "declaration_accepted": False,
        },
    },
}

SEEDED_PROFILE = {
    "first_name": "Husain",
    "last_name": "Al-Mansoor",
    "date_of_birth": "1998-05-14",
    "nationality": "OMN",
    "gender": "male",
    "marital_status": "single",
    "occupation": "Product Designer",
    "passport_number": "A12345678",
    "issuing_country": "OMN",
    "issue_date": "2022-01-10",
    "expiry_date": "2032-01-09",
}


async def seed_demo_users() -> None:
    user_repository = UserRepository()
    application_repository = ApplicationRepository()
    profile_repository = ProfileRepository()

    async with AsyncSessionLocal() as session:
        changed = False

        for demo_user in DEMO_USERS:
            existing_user = await user_repository.get_by_email(session, demo_user["email"])
            if existing_user is not None:
                continue

            await user_repository.create(
                session,
                email=demo_user["email"],
                password_hash=get_password_hash(demo_user["password"]),
                full_name=demo_user["full_name"],
            )
            changed = True

        if changed:
            await session.commit()

        await _seed_primary_user_draft(session, user_repository, application_repository)
        await _seed_primary_user_profile(session, user_repository, profile_repository)


async def _seed_primary_user_draft(
    session: AsyncSession,
    user_repository: UserRepository,
    application_repository: ApplicationRepository,
) -> None:
    primary_user = await user_repository.get_by_email(session, "applicant@example.com")
    if primary_user is None:
        return

    existing_applications = await application_repository.list_for_user(session, primary_user.id)
    if existing_applications:
        return

    await application_repository.create(
        session,
        user_id=primary_user.id,
        visa_category=SEEDED_DRAFT["visa_category"],
        status=SEEDED_DRAFT["status"],
        current_step=SEEDED_DRAFT["current_step"],
        progress_percentage=SEEDED_DRAFT["progress_percentage"],
        form_data=SEEDED_DRAFT["form_data"] or build_empty_form_data(),
    )
    await session.commit()


async def _seed_primary_user_profile(
    session: AsyncSession,
    user_repository: UserRepository,
    profile_repository: ProfileRepository,
) -> None:
    primary_user = await user_repository.get_by_email(session, "applicant@example.com")
    if primary_user is None:
        return

    existing_profile = await profile_repository.get_by_user_id(session, primary_user.id)
    if existing_profile is not None:
        return

    await profile_repository.upsert(session, primary_user.id, SEEDED_PROFILE)
    await session.commit()
