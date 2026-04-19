from fastapi import APIRouter

router = APIRouter()


@router.post("/compare")
def compare_tax(payload: dict | None = None) -> dict:
    return {
        "before": {"chargeable_income": 0, "tax_payable": 0},
        "after": {"chargeable_income": 0, "tax_payable": 0},
        "estimated_savings": 0,
    }
