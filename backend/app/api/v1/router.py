from fastapi import APIRouter

from app.api.v1.endpoints import chat, documents, filing, profile, reliefs, tax

api_router = APIRouter()
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(reliefs.router, prefix="/reliefs", tags=["reliefs"])
api_router.include_router(tax.router, prefix="/tax", tags=["tax"])
api_router.include_router(filing.router, prefix="/filing", tags=["filing"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
