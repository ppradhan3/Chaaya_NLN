from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import checkin, patterns, insights, actions, users

app = FastAPI(
    title="Chhaya API",
    description="Behavioral pattern awareness for college students",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(users.router,    prefix="/users",    tags=["users"])
app.include_router(checkin.router,  prefix="/checkin",  tags=["checkin"])
app.include_router(patterns.router, prefix="/patterns", tags=["patterns"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])
app.include_router(actions.router,  prefix="/actions",  tags=["actions"])

@app.get("/")
def root():
    return {
        "app":     "Chhaya छाया",
        "tagline": "Your shadow knows before you do",
        "status":  "running"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
