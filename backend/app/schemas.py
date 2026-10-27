from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# Message schemas
class MessageBase(BaseModel):
    message_id: str
    timestamp: str
    user_id: str
    channel: str
    message: str
    reply_to: Optional[str] = None
    game_title: Optional[str] = None
    sentiment_label: Optional[str] = "neutral"
    sentiment_score: Optional[float] = 0.5
    source: Optional[str] = "synthetic_demo"

class MessageOut(MessageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Single text sentiment predict
class SentimentPredictRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Message text to analyze")

class SentimentPredictResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float
    probabilities: Dict[str, float]
    explanation: Optional[Dict[str, Any]] = None
    slang_detected: List[str] = []

# Game recommend
class RecommendRequest(BaseModel):
    preferred_genres: List[str] = Field(default_factory=list)
    interests: Optional[str] = ""
    top_n: int = 6

class GameRecommendation(BaseModel):
    game_id: str
    title: str
    developer: str
    genres: List[str]
    description: str
    similarity_score: float
    related_sentiment: str
    matching_topics: List[str]
    recommendation_reason: str

# Feedback schema
class FeedbackCreate(BaseModel):
    message_id: Optional[str] = None
    message_text: str
    predicted_sentiment: str
    user_corrected_sentiment: str
    feedback_notes: Optional[str] = None

class FeedbackOut(FeedbackCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# A/B testing simulation
class ABTestRequest(BaseModel):
    variant_a_name: str = "Dark Minimalist"
    variant_b_name: str = "Discord Blurple"
    metric_name: str = "Click-Through Rate (%)"
    sample_size: int = 500
    baseline_conversion: float = 0.12
    expected_lift: float = 0.04
