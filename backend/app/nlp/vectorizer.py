from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer

class VectorizerService:
    """
    Handles TF-IDF feature extraction, n-gram vectorization, and vocabulary scoring.
    Also provides simulated/dense embeddings and explains Word2Vec / Transformer concepts.
    """

    def __init__(self, max_features: int = 500, ngram_range: Tuple[int, int] = (1, 2)):
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.tfidf = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            stop_words="english",
            token_pattern=r"(?u)\b\w+\b"
        )
        self.count_vec = CountVectorizer(
            max_features=max_features,
            ngram_range=(1, 1),
            stop_words="english"
        )
        self.is_fitted = False

    def fit_transform(self, texts: List[str]):
        """Fits TF-IDF vectorizer on corpus and returns sparse matrix."""
        valid_texts = [t for t in texts if t and t.strip()]
        if not valid_texts:
            valid_texts = ["empty document"]
        matrix = self.tfidf.fit_transform(valid_texts)
        self.is_fitted = True
        return matrix

    def transform(self, texts: List[str]):
        """Transforms new text using fitted TF-IDF model."""
        if not self.is_fitted:
            self.fit_transform(texts)
        return self.tfidf.transform(texts)

    def get_top_terms(self, texts: List[str], top_n: int = 20) -> List[Dict[str, Any]]:
        """Calculates mean TF-IDF weights across the corpus and returns top keywords."""
        if not texts:
            return []
        
        matrix = self.fit_transform(texts)
        feature_names = self.tfidf.get_feature_names_out()
        mean_scores = np.asarray(matrix.mean(axis=0)).ravel()

        top_indices = mean_scores.argsort()[::-1][:top_n]
        results = []
        for idx in top_indices:
            score = float(mean_scores[idx])
            if score > 0:
                results.append({
                    "term": feature_names[idx],
                    "tfidf_score": round(score, 4),
                    "importance_percent": round(score * 100, 2)
                })
        return results

    def get_word_frequencies(self, texts: List[str], top_n: int = 25) -> List[Dict[str, Any]]:
        """Calculates raw word frequencies across the corpus."""
        valid_texts = [t for t in texts if t and t.strip()]
        if not valid_texts:
            return []
        
        counts = self.count_vec.fit_transform(valid_texts)
        feature_names = self.count_vec.get_feature_names_out()
        total_counts = np.asarray(counts.sum(axis=0)).ravel()

        top_indices = total_counts.argsort()[::-1][:top_n]
        return [
            {
                "word": feature_names[idx],
                "frequency": int(total_counts[idx])
            }
            for idx in top_indices if total_counts[idx] > 0
        ]

    def explain_embedding_approaches(self) -> Dict[str, Any]:
        """
        Theoretical comparison between TF-IDF, Word2Vec, and Transformers
        for viva and syllabus reference.
        """
        return {
            "tfidf": {
                "name": "TF-IDF (Term Frequency - Inverse Document Frequency)",
                "type": "Sparse Statistical Representation",
                "strengths": "Fast, interpretable, weights domain-specific keywords, no training required",
                "limitations": "Ignores word order, polysemy, semantics (synonyms treated as distinct)",
                "formula": "TF(t, d) * log(N / DF(t))"
            },
            "word2vec": {
                "name": "Word2Vec (Skip-gram & CBOW)",
                "type": "Dense Distributed Semantic Embeddings (e.g. 300-d)",
                "strengths": "Captures semantic analogies (King - Man + Woman = Queen), handles semantic closeness",
                "limitations": "Static embeddings: each word has a single vector regardless of context (apple the fruit vs Apple the company)"
            },
            "transformers": {
                "name": "Transformers (BERT / RoBERTa / DistilBERT)",
                "type": "Contextual Deep Attention Representations",
                "strengths": "Dynamic self-attention captures context, polysemy, bidirectional semantics",
                "limitations": "High computational cost, slower inference latency, requires GPU/memory"
            }
        }

vectorizer_service = VectorizerService()
