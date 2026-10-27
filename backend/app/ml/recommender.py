import json
import os
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config import settings

class GameRecommendationEngine:
    """
    Hybrid Content-Based Recommendation Engine.
    Combines TF-IDF cosine similarity across game metadata (genres, descriptions, tags)
    with Discord community sentiment signals and topic relevance weighting.
    """

    def __init__(self):
        self.catalog: List[Dict[str, Any]] = []
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.game_tfidf_matrix = None
        self.load_catalog()

    def load_catalog(self):
        """Loads curated game profiles from JSON catalog."""
        if os.path.exists(settings.GAMES_CATALOG_PATH):
            with open(settings.GAMES_CATALOG_PATH, "r", encoding="utf-8") as f:
                self.catalog = json.load(f)
            self._fit_catalog_features()

    def _fit_catalog_features(self):
        """Builds composite feature documents and computes TF-IDF representations."""
        if not self.catalog:
            return

        corpus = []
        for g in self.catalog:
            # Composite profile: genres + tags + description
            genres_str = " ".join(g.get("genres", []))
            tags_str = " ".join(g.get("tags", []))
            desc = g.get("description", "")
            composite = f"{g['title']} {genres_str} {tags_str} {desc}"
            corpus.append(composite)

        self.game_tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def recommend(
        self,
        preferred_genres: List[str] = None,
        interests: str = "",
        community_sentiment_map: Dict[str, str] = None,
        top_n: int = 6
    ) -> List[Dict[str, Any]]:
        """
        Calculates ranked game recommendations based on user preference vector
        and boosts items supported by positive Discord community sentiment.
        """
        if not self.catalog or self.game_tfidf_matrix is None:
            return []

        preferred_genres = preferred_genres or []
        interests = interests or ""
        community_sentiment_map = community_sentiment_map or {}

        # Construct query vector from user profile
        query_text = f"{' '.join(preferred_genres)} {interests}".strip()
        if not query_text:
            query_text = "multiplayer action rpg fps adventure"

        query_vec = self.vectorizer.transform([query_text])
        raw_similarities = cosine_similarity(query_vec, self.game_tfidf_matrix)[0]

        recommendations = []
        for idx, game in enumerate(self.catalog):
            base_sim = float(raw_similarities[idx])

            # Genre overlap bonus
            genre_overlap = set(preferred_genres).intersection(set(game.get("genres", [])))
            genre_bonus = 0.15 * len(genre_overlap) if preferred_genres else 0.0

            # Community sentiment signal boost
            comm_sent = community_sentiment_map.get(game["title"], "neutral")
            sentiment_bonus = 0.08 if comm_sent == "positive" else (-0.05 if comm_sent == "negative" else 0.0)

            final_score = min(1.0, max(0.05, base_sim + genre_bonus + sentiment_bonus))

            # Generate natural explanation
            reasons = []
            if genre_overlap:
                reasons.append(f"Matches preferred genres ({', '.join(genre_overlap)})")
            if base_sim > 0.2:
                reasons.append("High semantic alignment with your stated gameplay interests")
            if comm_sent == "positive":
                reasons.append("Highly praised by the Discord community in recent chats")
            elif comm_sent == "negative":
                reasons.append("Community has active balance critiques, but gameplay fits your taste")
            else:
                reasons.append("Strong overall genre and tag profile match")

            recommendation_reason = " • ".join(reasons)

            recommendations.append({
                "game_id": game["id"],
                "title": game["title"],
                "developer": game["developer"],
                "genres": game["genres"],
                "description": game["description"],
                "tags": game["tags"],
                "similarity_score": round(final_score, 4),
                "base_similarity": round(base_sim, 4),
                "related_sentiment": comm_sent,
                "matching_topics": list(genre_overlap) if genre_overlap else game["tags"][:3],
                "recommendation_reason": recommendation_reason,
                "rating": game.get("rating", 4.5)
            })

        # Rank by final similarity score
        recommendations.sort(key=lambda x: x["similarity_score"], reverse=True)
        return recommendations[:top_n]

recommender_engine = GameRecommendationEngine()
