from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean
from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message_id = Column(String(64), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String(64), index=True, nullable=False)
    channel = Column(String(64), index=True, nullable=False)
    message = Column(Text, nullable=False)
    reply_to = Column(String(64), nullable=True)
    game_title = Column(String(128), nullable=True, index=True)
    sentiment_label = Column(String(32), default="neutral")
    sentiment_score = Column(Float, default=0.5)
    source = Column(String(64), default="synthetic_demo")


class AnalysisSnapshot(Base):
    __tablename__ = "analysis_snapshots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    run_timestamp = Column(DateTime, default=datetime.utcnow)
    total_messages = Column(Integer, default=0)
    positive_pct = Column(Float, default=0.0)
    negative_pct = Column(Float, default=0.0)
    neutral_pct = Column(Float, default=0.0)
    topics_json = Column(Text, default="[]")
    entities_json = Column(Text, default="[]")
    games_json = Column(Text, default="[]")
    network_summary_json = Column(Text, default="{}")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message_id = Column(String(64), nullable=True)
    message_text = Column(Text, nullable=False)
    predicted_sentiment = Column(String(32), nullable=False)
    user_corrected_sentiment = Column(String(32), nullable=False)
    feedback_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ABExperiment(Base):
    __tablename__ = "ab_experiments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    variant_a_name = Column(String(64), nullable=False)
    variant_b_name = Column(String(64), nullable=False)
    metric_name = Column(String(64), nullable=False)
    sample_size_a = Column(Integer, default=0)
    sample_size_b = Column(Integer, default=0)
    mean_a = Column(Float, default=0.0)
    mean_b = Column(Float, default=0.0)
    p_value = Column(Float, default=0.0)
    stat_significant = Column(Boolean, default=False)
    ci_low = Column(Float, default=0.0)
    ci_high = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
