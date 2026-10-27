from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas import RecommendRequest
from app.data_manager import dataset_manager
from app.ml.recommender import recommender_engine

router = APIRouter(prefix="/recommend", tags=["Recommendation System"])

@router.post("")
def get_recommendations(req: RecommendRequest):
    """
    Generates personalized content-based game recommendations using TF-IDF cosine similarity,
    genre overlap boosting, and live Discord community sentiment signals.
    """
    df = dataset_manager.get_dataframe()
    # Build community sentiment map
    sentiment_map = {}
    if not df.empty:
        game_df = df[df["game_title"].str.strip() != ""]
        for game_name, group in game_df.groupby("game_title"):
            mode_sentiment = group["sentiment_label"].mode()
            if not mode_sentiment.empty:
                sentiment_map[game_name] = mode_sentiment.iloc[0]

    recs = recommender_engine.recommend(
        preferred_genres=req.preferred_genres,
        interests=req.interests,
        community_sentiment_map=sentiment_map,
        top_n=req.top_n
    )

    return {
        "user_query": {
            "preferred_genres": req.preferred_genres,
            "interests": req.interests
        },
        "recommendations": recs,
        "recommendation_engine_info": {
            "type": "Content-Based Filtering + Sentiment Augmented Ranking",
            "features_used": ["Game Genres", "Gameplay Tags", "Catalog Descriptions", "Discord Community Sentiment"],
            "similarity_metric": "Cosine Similarity on TF-IDF Vector Space",
            "dataset_label": "Curated Educational Game Catalog (20 Titles)"
        }
    }

@router.get("/genres")
def get_available_genres():
    """Returns unique game genres available across the catalog."""
    genres_set = set()
    for g in recommender_engine.catalog:
        for gen in g.get("genres", []):
            genres_set.add(gen)
    return {"genres": sorted(list(genres_set))}
