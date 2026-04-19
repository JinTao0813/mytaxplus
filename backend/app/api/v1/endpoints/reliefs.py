from fastapi import APIRouter

router = APIRouter()


@router.post("/analyze")
def analyze_reliefs(payload: dict | None = None) -> dict:
    return {
        "claimed": [],
        "missed": [],
        "suggestions": ["Review medical receipts for Section 46 relief caps."],
    }
