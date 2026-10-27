import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure app package is importable
app_dir = Path(__file__).resolve().parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

from app.config import settings
from app.database import engine, Base
from app.data_manager import dataset_manager

# Import API Routers
from app.routers.dashboard import router as dashboard_router
from app.routers.analytics import router as analytics_router
from app.routers.sentiment import router as sentiment_router
from app.routers.social import router as social_router
from app.routers.recommend import router as recommend_router
from app.routers.web_metrics import router as web_metrics_router
from app.routers.evaluation import router as evaluation_router
from app.routers.drift import router as drift_router
from app.routers.data_mgmt import router as data_mgmt_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    print("Initializing Discord Text Web Analysis database tables...")
    Base.metadata.create_all(bind=engine)
    print("Loading and preparing dataset...")
    dataset_manager.initialize_data()
    print("Backend ready to receive requests!")
    yield
    print("Shutting down backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI Project integrating Text Analytics, Web Analytics, Social Mining, Sentiment Analysis, and Recommendation Systems.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all localhost dev origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(dashboard_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(sentiment_router, prefix="/api")
app.include_router(social_router, prefix="/api")
app.include_router(recommend_router, prefix="/api")
app.include_router(web_metrics_router, prefix="/api")
app.include_router(evaluation_router, prefix="/api")
app.include_router(drift_router, prefix="/api")
app.include_router(data_mgmt_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Discord Text Web Analysis API is online",
        "docs_url": "/docs",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
