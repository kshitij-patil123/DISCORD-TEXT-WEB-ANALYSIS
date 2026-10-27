from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
from app.database import get_db
from app.data_manager import dataset_manager
from app.nlp.entities import entity_service
from app.nlp.topics import topic_service

router = APIRouter(tags=["Dashboard"])

@router.get("/health")
def health_check():
    """Health check endpoint confirming API status and dataset loading."""
    df = dataset_manager.get_dataframe()
    return {
        "status": "healthy",
        "service": "Discord Text Web Analysis API",
        "version": "1.0.0",
        "total_records_loaded": len(df)
    }

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Computes all overview dashboard statistics dynamically from the current dataset.
    Strictly calculates metrics from actual data (no hardcoded numbers).
    """
    df = dataset_manager.get_dataframe()
    if df.empty:
        return {
            "total_messages": 0,
            "active_users": 0,
            "sentiment_distribution": {"positive": 0, "negative": 0, "neutral": 0},
            "sentiment_percentages": {"positive": 0.0, "negative": 0.0, "neutral": 0.0},
            "most_discussed_topics": [],
            "most_mentioned_games": [],
            "daily_activity": [],
            "weekly_activity": [],
            "channel_distribution": [],
            "latest_messages": []
        }

    total_msgs = len(df)
    active_users = int(df["user_id"].nunique())

    # Sentiment distribution & percentages
    sent_counts = df["sentiment_label"].str.lower().value_counts().to_dict()
    pos_count = int(sent_counts.get("positive", 0))
    neg_count = int(sent_counts.get("negative", 0))
    neu_count = int(sent_counts.get("neutral", 0))

    pos_pct = round((pos_count / total_msgs) * 100, 1) if total_msgs > 0 else 0.0
    neg_pct = round((neg_count / total_msgs) * 100, 1) if total_msgs > 0 else 0.0
    neu_pct = round((neu_count / total_msgs) * 100, 1) if total_msgs > 0 else 0.0

    # Daily activity trend
    df_copy = df.copy()
    df_copy["dt"] = pd.to_datetime(df_copy["timestamp"])
    df_copy["date"] = df_copy["dt"].dt.strftime("%Y-%m-%d")
    daily_grouped = df_copy.groupby("date").size().reset_index(name="count")
    daily_activity = [
        {"date": row["date"], "messages": int(row["count"])}
        for _, row in daily_grouped.tail(14).iterrows()
    ]

    # Weekly / Day of week activity
    df_copy["day_name"] = df_copy["dt"].dt.day_name()
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    day_counts = df_copy["day_name"].value_counts().to_dict()
    weekly_activity = [
        {"day": d, "messages": int(day_counts.get(d, 0))}
        for d in day_order
    ]

    # Sentiment by day trend
    daily_sent = df_copy.groupby(["date", "sentiment_label"]).size().unstack(fill_value=0)
    sentiment_trend = []
    for date_str, row in daily_sent.tail(10).iterrows():
        sentiment_trend.append({
            "date": date_str,
            "positive": int(row.get("positive", 0)),
            "negative": int(row.get("negative", 0)),
            "neutral": int(row.get("neutral", 0))
        })

    # Channel distribution
    ch_counts = df["channel"].value_counts().reset_index()
    channel_distribution = [
        {"channel": row["channel"], "messages": int(row["count"])}
        for _, row in ch_counts.iterrows()
    ]

    # Most mentioned games from entities service or column
    game_entities = entity_service.analyze_corpus_entities(df["message"].tolist())
    most_mentioned_games = game_entities.get("top_games", [])[:6]

    # Topics from NMF
    topics = topic_service.extract_topics_nmf(df["message"].tolist(), n_words=5)[:5]
    most_discussed_topics = [
        {"topic": t["label"], "keywords": t["top_terms_display"]}
        for t in topics
    ]

    # Latest messages preview
    latest_df = df.tail(8)
    latest_messages = [
        {
            "message_id": row["message_id"],
            "timestamp": row["timestamp"],
            "user_id": row["user_id"],
            "channel": row["channel"],
            "message": row["message"],
            "sentiment_label": row["sentiment_label"]
        }
        for _, row in latest_df.iterrows()
    ]

    return {
        "total_messages": total_msgs,
        "active_users": active_users,
        "sentiment_counts": {
            "positive": pos_count,
            "negative": neg_count,
            "neutral": neu_count
        },
        "sentiment_percentages": {
            "positive": pos_pct,
            "negative": neg_pct,
            "neutral": neu_pct
        },
        "most_discussed_topics": most_discussed_topics,
        "most_mentioned_games": most_mentioned_games,
        "daily_activity": daily_activity,
        "weekly_activity": weekly_activity,
        "sentiment_trend": sentiment_trend,
        "channel_distribution": channel_distribution,
        "latest_messages": latest_messages,
        "data_source": "Demo Mode (Synthetic Discord Gaming Dataset)" if "synthetic_demo" in df["source"].values else "Authorized Discord API"
    }
