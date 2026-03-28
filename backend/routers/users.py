from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from graph.queries import get_user, create_user
from graph.connection import get_session

router = APIRouter()

class NewUser(BaseModel):
    id:             str
    name:           str
    university:     str
    semester_start: str

@router.post("/")
def register_user(body: NewUser):
    existing = get_user(body.id)
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    create_user(
        uid            = body.id,
        name           = body.name,
        university     = body.university,
        semester_start = body.semester_start
    )
    return {
        "status": "created",
        "id":     body.id,
        "name":   body.name
    }

@router.get("/{uid}")
def get_user_route(uid: str):
    user = get_user(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
