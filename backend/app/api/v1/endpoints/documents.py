"""Document ingestion endpoints (Firebase-authenticated)."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.deps import require_firebase_user

router = APIRouter()

DocumentCategory = Literal["medical", "education", "lifestyle", "income", "other"]
DocumentStatus = Literal["uploading", "processing", "processed", "error"]


def _doc_response(
    *,
    doc_id: str,
    name: str,
    size_kb: int,
    status: DocumentStatus,
    category: DocumentCategory | None,
) -> dict:
    return {
        "id": doc_id,
        "name": name,
        "sizeKb": size_kb,
        "uploadedAt": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "status": status,
        "category": category,
    }


class RegisterDocumentBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    document_id: str | None = Field(default=None, alias="documentId")
    storage_path: str = Field(alias="storagePath")
    original_filename: str = Field(alias="originalFilename")
    size_kb: int = Field(ge=0, alias="sizeKb")

    @field_validator("storage_path", "original_filename")
    @classmethod
    def non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("must not be empty")
        return v


@router.get("")
def list_documents(
    _user: dict = Depends(require_firebase_user),
) -> list[dict]:
    """Return the current user's documents (stub until persistence exists)."""
    return []


@router.get("/extractions")
def list_extractions(
    _user: dict = Depends(require_firebase_user),
) -> list[dict]:
    """AI extraction rows (stub)."""
    return []


@router.post("/register")
def register_document(
    body: RegisterDocumentBody,
    user: dict = Depends(require_firebase_user),
) -> dict:
    """Register a file already uploaded to Firebase Storage under the caller's UID."""
    uid = user.get("uid") or ""
    prefix = f"users/{uid}/"
    path = body.storage_path
    if ".." in path or not path.startswith(prefix):
        raise HTTPException(status_code=403, detail="storagePath must belong to the signed-in user")

    rid = body.document_id.strip() if body.document_id else ""
    doc_id = rid if rid else str(uuid.uuid4())
    return _doc_response(
        doc_id=doc_id,
        name=body.original_filename,
        size_kb=body.size_kb,
        status="processed",
        category="other",
    )


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: dict = Depends(require_firebase_user),
) -> dict:
    """Multipart upload fallback: accept a file for server-side handling (stub)."""
    _ = user  # reserved for future per-user storage paths
    raw = await file.read()
    size_kb = max(1, round(len(raw) / 1024))
    doc_id = str(uuid.uuid4())
    name = file.filename or "upload"
    return _doc_response(
        doc_id=doc_id,
        name=name,
        size_kb=size_kb,
        status="processed",
        category="other",
    )
