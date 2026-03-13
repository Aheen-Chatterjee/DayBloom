from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import health, journal, habits, completions, streaks, insights, wrapped, accountability

app = FastAPI(title="DayBloom API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(journal.router, prefix="/api/v1")
app.include_router(habits.router, prefix="/api/v1")
app.include_router(completions.router, prefix="/api/v1")
app.include_router(streaks.router, prefix="/api/v1")
app.include_router(insights.router, prefix="/api/v1")
app.include_router(wrapped.router, prefix="/api/v1")
app.include_router(accountability.router, prefix="/api/v1")
