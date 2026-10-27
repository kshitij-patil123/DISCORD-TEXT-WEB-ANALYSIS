from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import Feedback
from app.schemas import FeedbackCreate, FeedbackOut
from app.data_manager import dataset_manager
from app.ml.drift_detector import drift_service

router = APIRouter(tags=["Drift Monitoring & Feedback"])

@router.get("/drift")
def get_drift_analysis():
    """
    Analyzes data and vocabulary distribution shift between earlier baseline
    and recent periods using Population Stability Index (PSI).
    """
    df = dataset_manager.get_dataframe()
    return drift_service.analyze_drift(df)

@router.post("/feedback")
def submit_prediction_feedback(req: FeedbackCreate, db: Session = Depends(get_db)):
    """
    Saves user-submitted feedback when a prediction is flagged as incorrect.
    Feedback is persisted in SQLite for future offline audits and retraining.
    """
    feedback_entry = Feedback(
        message_id=req.message_id,
        message_text=req.message_text,
        predicted_sentiment=req.predicted_sentiment,
        user_corrected_sentiment=req.user_corrected_sentiment,
        feedback_notes=req.feedback_notes
    )
    db.add(feedback_entry)
    db.commit()
    db.refresh(feedback_entry)

    return {
        "status": "success",
        "message": "Feedback successfully recorded in feedback registry.",
        "feedback_id": feedback_entry.id,
        "note": "Feedback is persisted in SQLite. Offline retraining can be scheduled when sufficient feedback accumulates."
    }

@router.get("/feedback/list", response_model=List[FeedbackOut])
def list_feedback_entries(db: Session = Depends(get_db)):
    """Retrieves all submitted user feedback records."""
    entries = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(50).all()
    return entries
