import os
import json
from datetime import datetime
from typing import List, Dict, Any, Tuple
import pandas as pd
from sqlalchemy.orm import Session
from app.config import settings
from app.database import SessionLocal, engine, Base
from app.models import Message, AnalysisSnapshot, Feedback, ABExperiment
from app.ml.sentiment_model import sentiment_model

class DatasetManager:
    """
    Manages loading, synchronization, validation, and querying of Discord datasets.
    Initializes database with demo records on first boot.
    """

    def __init__(self):
        self.current_df: pd.DataFrame = pd.DataFrame()

    def initialize_data(self):
        """Loads demo CSV into database if database is empty."""
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            count = db.query(Message).count()
            if count == 0 and os.path.exists(settings.DEMO_CSV_PATH):
                print("Database is empty. Seeding with demo dataset...")
                df = pd.read_csv(settings.DEMO_CSV_PATH)
                records = []
                for _, row in df.iterrows():
                    ts = pd.to_datetime(row["timestamp"]) if pd.notnull(row["timestamp"]) else datetime.utcnow()
                    records.append(Message(
                        message_id=str(row["message_id"]),
                        timestamp=ts,
                        user_id=str(row["user_id"]),
                        channel=str(row["channel"]),
                        message=str(row["message"]),
                        reply_to=str(row["reply_to"]) if pd.notnull(row["reply_to"]) and str(row["reply_to"]).strip() else None,
                        game_title=str(row["game_title"]) if pd.notnull(row["game_title"]) and str(row["game_title"]).strip() else None,
                        sentiment_label=str(row["sentiment_label"]) if pd.notnull(row["sentiment_label"]) else "neutral",
                        sentiment_score=0.8 if row.get("sentiment_label") == "positive" else (0.2 if row.get("sentiment_label") == "negative" else 0.5),
                        source=str(row.get("source", "synthetic_demo"))
                    ))
                db.bulk_save_objects(records)
                db.commit()
                print(f"Seeded {len(records)} demo records into SQLite database.")

            # Load into working DataFrame
            self.refresh_dataframe(db)

            # Train baseline sentiment classifier if not trained
            if not sentiment_model.is_trained and os.path.exists(settings.DEMO_CSV_PATH):
                print("Training baseline sentiment model on dataset...")
                sentiment_model.train_and_evaluate(str(settings.DEMO_CSV_PATH))
                print(f"Sentiment model trained! Test Accuracy: {sentiment_model.evaluation_metrics.get('accuracy')}")

        finally:
            db.close()

    def refresh_dataframe(self, db: Session):
        """Pulls latest messages from SQLite into pandas DataFrame for vector calculations."""
        messages = db.query(Message).all()
        if messages:
            data = [
                {
                    "id": m.id,
                    "message_id": m.message_id,
                    "timestamp": m.timestamp.strftime("%Y-%m-%d %H:%M:%S") if m.timestamp else "",
                    "user_id": m.user_id,
                    "channel": m.channel,
                    "message": m.message,
                    "reply_to": m.reply_to or "",
                    "game_title": m.game_title or "",
                    "sentiment_label": m.sentiment_label,
                    "sentiment_score": m.sentiment_score,
                    "source": m.source
                }
                for m in messages
            ]
            self.current_df = pd.DataFrame(data)
        else:
            self.current_df = pd.DataFrame()

    def get_dataframe(self) -> pd.DataFrame:
        """Returns the current active in-memory DataFrame."""
        if self.current_df.empty:
            db = SessionLocal()
            try:
                self.refresh_dataframe(db)
            finally:
                db.close()
        return self.current_df

dataset_manager = DatasetManager()
