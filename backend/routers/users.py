from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from graph.queries import get_user, create_user

router = APIRouter()

class NewUser(BaseModel):
    id:             str
    name:           str
    university:     str
    semester_start: str # e.g., "2026-01-15"
    semester_end:   str # e.g., "2026-05-10"
    finals_start:   str # e.g., "2026-05-03"

@router.post("/")
def register_user(body: NewUser):
    # 1. Check if the user already exists to prevent overwriting baseline data
    existing = get_user(body.id)
    if existing:
        return {
            "status": "exists", 
            "message": "Welcome back", 
            "id": body.id
        }
    
    # 2. Create the user with their real academic calendar start date
    create_user(
        uid            = body.id,
        name           = body.name,
        university     = body.university,
        semester_start = body.semester_start
    )
    
    return {
        "status": "created",
        "id":     body.id,
        "name":   body.name,
        "context": "Onboarding complete. Chhaya is now observing."
    }