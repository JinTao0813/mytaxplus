from fastapi import APIRouter
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    context: dict | None = None


router = APIRouter()


@router.post("")
def chat(req: ChatRequest) -> dict:
    return {
        "reply": "Chat stub — connect Gemini + RAG here.",
        "grounded": False,
    }
