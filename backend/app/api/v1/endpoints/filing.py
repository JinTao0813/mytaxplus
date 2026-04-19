from fastapi import APIRouter

router = APIRouter()


@router.get("/summary")
def filing_summary() -> dict:
    return {
        "steps": [
            "Gather EA and receipts",
            "Confirm reliefs in MyTax+",
            "Submit via LHDN e-filing (simulation only)",
        ],
        "missing_fields": [],
        "prefilled": {},
    }
