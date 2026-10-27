from fastapi import APIRouter, Depends, Body
from typing import Dict, Any, List
import pandas as pd
from app.schemas import SentimentPredictRequest, SentimentPredictResponse
from app.data_manager import dataset_manager
from app.ml.sentiment_model import sentiment_model

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"])

@router.post("/predict", response_model=SentimentPredictResponse)
def predict_sentiment(req: SentimentPredictRequest):
    """
    Predicts sentiment (Positive, Negative, Neutral) with confidence score,
    class probabilities, slang lexicon detection, and local term contributions.
    """
    result = sentiment_model.predict(req.text)
    return {
        "text": result["text"],
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "explanation": {
            "cleaned_text": result["cleaned_text"],
            "contributions": result["word_contributions"],
            "limitations": result["limitations"]
        },
        "slang_detected": result["slang_detected"]
    }

@router.get("/distribution")
def get_sentiment_breakdown():
    """
    Returns multidimensional sentiment distributions:
    - Sentiment by Date
    - Sentiment by Game Title
    - Sentiment by Channel
    """
    df = dataset_manager.get_dataframe()
    if df.empty:
        return {"by_game": [], "by_channel": [], "by_date": []}

    # By Game
    game_df = df[df["game_title"].str.strip() != ""]
    by_game_counts = game_df.groupby(["game_title", "sentiment_label"]).size().unstack(fill_value=0)
    by_game = []
    for game_name, row in by_game_counts.iterrows():
        total = int(row.sum())
        if total >= 3:
            by_game.append({
                "game": game_name,
                "positive": int(row.get("positive", 0)),
                "negative": int(row.get("negative", 0)),
                "neutral": int(row.get("neutral", 0)),
                "total": total
            })
    by_game.sort(key=lambda x: x["total"], reverse=True)

    # By Channel
    by_channel_counts = df.groupby(["channel", "sentiment_label"]).size().unstack(fill_value=0)
    by_channel = []
    for ch_name, row in by_channel_counts.iterrows():
        by_channel.append({
            "channel": ch_name,
            "positive": int(row.get("positive", 0)),
            "negative": int(row.get("negative", 0)),
            "neutral": int(row.get("neutral", 0)),
            "total": int(row.sum())
        })

    # By Date
    df_copy = df.copy()
    df_copy["date"] = pd.to_datetime(df_copy["timestamp"]).dt.strftime("%Y-%m-%d")
    by_date_counts = df_copy.groupby(["date", "sentiment_label"]).size().unstack(fill_value=0)
    by_date = []
    for dt_str, row in by_date_counts.tail(12).iterrows():
        by_date.append({
            "date": dt_str,
            "positive": int(row.get("positive", 0)),
            "negative": int(row.get("negative", 0)),
            "neutral": int(row.get("neutral", 0))
        })

    return {
        "by_game": by_game[:8],
        "by_channel": by_channel,
        "by_date": by_date
    }
