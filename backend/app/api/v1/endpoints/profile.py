from fastapi import APIRouter

router = APIRouter()


@router.get("")
def get_profile() -> dict:
    return {
        "total_income": 0,
        "expenses_by_category": {"medical": 0, "education": 0, "lifestyle": 0},
        "marital_status": None,
    }


@router.put("")
def put_profile(body: dict) -> dict:
    return {"saved": True, "profile": body}
