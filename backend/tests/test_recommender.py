import pytest
from app.ml.recommender import recommender_engine

def test_catalog_loaded():
    assert len(recommender_engine.catalog) >= 15

def test_game_recommendations():
    recs = recommender_engine.recommend(
        preferred_genres=["Tactical Shooter", "FPS"],
        interests="competitive ranked climb",
        top_n=5
    )
    assert len(recs) <= 5
    assert len(recs) > 0
    top_titles = [r["title"] for r in recs]
    # Expect tactical shooter like Valorant or Counter-Strike 2 to be in recommendations
    assert any(g in top_titles for g in ["Valorant", "Counter-Strike 2", "Apex Legends", "Overwatch 2"])
    assert "recommendation_reason" in recs[0]
    assert 0.0 <= recs[0]["similarity_score"] <= 1.0
