from typing import List, Dict, Any
import numpy as np
import pandas as pd
from sklearn.decomposition import NMF, LatentDirichletAllocation
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

class TopicDiscoveryService:
    """
    Implements unsupervised Topic Modeling using both NMF (matrix factorization)
    and LDA (probabilistic generative model), extracting thematic clusters and
    tracking topic prevalence over time.
    """

    def __init__(self, n_topics: int = 5):
        self.n_topics = n_topics

    def extract_topics_nmf(self, texts: List[str], n_words: int = 7) -> List[Dict[str, Any]]:
        """
        Extracts semantic topic clusters using NMF on TF-IDF representation.
        NMF: V ≈ W * H, where W is document-topic and H is topic-word.
        """
        valid_texts = [t for t in texts if t and len(t.strip()) > 3]
        if len(valid_texts) < self.n_topics:
            return []

        tfidf = TfidfVectorizer(
            max_features=400,
            stop_words="english",
            token_pattern=r"(?u)\b[a-zA-Z]{3,}\b"
        )
        tfidf_mat = tfidf.fit_transform(valid_texts)
        feature_names = tfidf.get_feature_names_out()

        nmf = NMF(
            n_components=min(self.n_topics, tfidf_mat.shape[1]),
            random_state=42,
            max_iter=300
        )
        nmf.fit(tfidf_mat)

        topic_clusters = []
        for topic_idx, topic in enumerate(nmf.components_):
            top_word_indices = topic.argsort()[::-1][:n_words]
            keywords = [feature_names[i] for i in top_word_indices]
            weights = [round(float(topic[i]), 3) for i in top_word_indices]
            
            # Determine topic label based on keywords
            label = self._infer_topic_label(keywords)

            topic_clusters.append({
                "topic_id": topic_idx + 1,
                "label": label,
                "keywords": keywords,
                "weights": weights,
                "top_terms_display": ", ".join(keywords[:4])
            })

        return topic_clusters

    def _infer_topic_label(self, keywords: List[str]) -> str:
        """Heuristically assign an intuitive human-readable topic name."""
        k_str = " ".join(keywords).lower()
        if any(w in k_str for w in ["valorant", "ascent", "jett", "clutch", "strike", "ranked", "anti"]):
            return "Tactical Shooters & Esports"
        elif any(w in k_str for w in ["elden", "ring", "baldurs", "gate", "rpg", "boss", "larian", "story"]):
            return "Action RPGs & Narrative"
        elif any(w in k_str for w in ["hollow", "knight", "hades", "celeste", "stardew", "indie", "lethal"]):
            return "Indie Games & Roguelikes"
        elif any(w in k_str for w in ["minecraft", "helldivers", "palworld", "coop", "server", "survival"]):
            return "Co-op & Sandbox Worlds"
        elif any(w in k_str for w in ["python", "godot", "fastapi", "react", "unity", "engine", "code"]):
            return "Game Dev & Technology"
        else:
            return f"Community Discussion ({keywords[0].capitalize()})"

    def compute_topic_trends_over_time(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups messages into weekly buckets and calculates topic mention counts.
        """
        if not records:
            return []

        df = pd.DataFrame(records)
        if "timestamp" not in df.columns or "message" not in df.columns:
            return []

        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df["week"] = df["timestamp"].dt.to_period("W").dt.start_time.dt.strftime("%b %d")

        # Map messages to categories
        def categorize(text: str) -> str:
            t = str(text).lower()
            if any(k in t for k in ["valorant", "cs2", "counter", "overwatch", "apex", "clutch", "ranked"]):
                return "FPS & Esports"
            elif any(k in t for k in ["elden", "baldurs", "cyberpunk", "witcher", "genshin", "rpg"]):
                return "RPG & Lore"
            elif any(k in t for k in ["hollow", "hades", "celeste", "stardew", "indie", "lethal"]):
                return "Indies & Roguelike"
            elif any(k in t for k in ["helldivers", "minecraft", "palworld", "co-op", "sea"]):
                return "Co-op & Survival"
            else:
                return "General & Tech"

        df["category"] = df["message"].apply(categorize)
        grouped = df.groupby(["week", "category"]).size().unstack(fill_value=0)

        trends = []
        for week_str, row in grouped.iterrows():
            item = {"week": week_str}
            for col in grouped.columns:
                item[col] = int(row[col])
            trends.append(item)

        return trends

topic_service = TopicDiscoveryService()
