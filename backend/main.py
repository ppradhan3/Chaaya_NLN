from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    users, 
    checkin, 
    patterns, 
    insights, 
    actions,
    garden, 
    pulse, 
    focus, 
    email, 
    bio_validation
)

app = FastAPI(
    title       = "Chhaya API",
    description = "Behavioral pattern awareness for college students",
    version     = "1.1.0" # Incremented version for the dynamic update
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:3000"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"]
)

# ─── Core Infrastructure Routes ───────────────────────────────
app.include_router(users.router,           prefix="/users",          tags=["Users"])
app.include_router(checkin.router,         prefix="/checkin",        tags=["Data Entry"])

# ─── Analysis & Insight Routes ────────────────────────────────
app.include_router(patterns.router,        prefix="/patterns",       tags=["Analysis"])
app.include_router(insights.router,        prefix="/insights",       tags=["Analysis"])

# ─── Action & Support Routes ──────────────────────────────────
app.include_router(actions.router,         prefix="/actions",        tags=["Actions"])
app.include_router(email.router,           prefix="/email",          tags=["Actions"])
app.include_router(focus.router,           prefix="/focus",          tags=["Support"])

# ─── Visualization & Engagement Routes ────────────────────────
app.include_router(garden.router,          prefix="/garden",         tags=["UI/UX"])
app.include_router(pulse.router,           prefix="/pulse",          tags=["UI/UX"])
app.include_router(bio_validation.router,  prefix="/bio-validation", tags=["UI/UX"])

@app.get("/")
def root():
    return {
        "app":     "Chhaya छाया",
        "tagline": "Your shadow knows before you do",
        "status":  "running",
        "version": "1.1.0"
    }

@app.get("/health")
def health():
    return {"status": "ok"}


# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from routers import (checkin, patterns, insights,
#                      actions, users)
# from routers import (garden, pulse, focus,
#                      email, bio_validation, checkin_aasha)

# app = FastAPI(
#     title       = "Chhaya API",
#     description = "Behavioral pattern awareness for college students",
#     version     = "1.0.0"
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins     = ["http://localhost:3000"],
#     allow_credentials = True,
#     allow_methods     = ["*"],
#     allow_headers     = ["*"]
# )

# # Core routes
# app.include_router(users.router,           prefix="/users",          tags=["users"])
# app.include_router(checkin.router,         prefix="/checkin",        tags=["checkin"])
# app.include_router(patterns.router,        prefix="/patterns",       tags=["patterns"])
# app.include_router(insights.router,        prefix="/insights",       tags=["insights"])
# app.include_router(actions.router,         prefix="/actions",        tags=["actions"])

# # Chhaya UI routes
# app.include_router(checkin_aasha.router,   prefix="/checkin/aasha",  tags=["chhaya"])
# app.include_router(garden.router,          prefix="/garden",         tags=["chhaya"])
# app.include_router(pulse.router,           prefix="/pulse",          tags=["chhaya"])
# app.include_router(focus.router,           prefix="/focus",          tags=["chhaya"])
# app.include_router(email.router,           prefix="/email",          tags=["chhaya"])
# app.include_router(bio_validation.router,  prefix="/bio-validation", tags=["chhaya"])

# @app.get("/")
# def root():
#     return {
#         "app":     "Chhaya छाया",
#         "tagline": "Your shadow knows before you do",
#         "status":  "running"
#     }

# @app.get("/health")
# def health():
#     return {"status": "ok"}
