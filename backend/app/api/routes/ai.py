from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.ai import AiChatRequest, AiChatResponse
from app.services.ai_service import AiService

router = APIRouter()
service = AiService()


@router.post("/ai/chat", response_model=AiChatResponse)
async def chat(
    payload: AiChatRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> AiChatResponse:
    return await service.chat(session, current_user, payload)
