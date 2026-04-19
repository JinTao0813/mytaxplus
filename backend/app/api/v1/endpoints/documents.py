from fastapi import APIRouter, File, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload(files: list[UploadFile] = File(...)) -> dict:
    """Accept EA forms and receipts; extraction stub for MVP."""
    names = [f.filename for f in files]
    return {
        "message": "stub",
        "received_filenames": names,
        "extracted": {
            "income": {"salary": None, "pcb": None},
            "expenses": [],
        },
    }
