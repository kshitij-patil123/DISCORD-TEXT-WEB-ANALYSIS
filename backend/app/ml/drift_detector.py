from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer

class DriftMonitoringService:
    """
    Monitors Data Drift, Concept Drift, and Vocabulary Distribution shifts.
    Splits messages into a Baseline period (earlier half) and Recent period (later half)
    to compute Population Stability Index (PSI) and vocabulary jaccard overlap.
    """

    def analyze_drift(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Compares baseline messages vs recent messages to detect statistical shifts.
        """
        if df.empty or len(df) < 20:
            return {
                "has_sufficient_data": False,
                "message": "At least 20 records required for baseline vs recent drift comparison."
            }

        df = df.copy()
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp").reset_index(drop=True)

        # Split into baseline (first 50%) and recent (second 50%)
        split_idx = len(df) // 2
        baseline_df = df.iloc[:split_idx]
        recent_df = df.iloc[split_idx:]

        baseline_start = baseline_df["timestamp"].min().strftime("%Y-%m-%d")
        baseline_end = baseline_df["timestamp"].max().strftime("%Y-%m-%d")
        recent_start = recent_df["timestamp"].min().strftime("%Y-%m-%d")
        recent_end = recent_df["timestamp"].max().strftime("%Y-%m-%d")

        # 1. Sentiment Distribution Drift
        sent_labels = ["positive", "neutral", "negative"]
        baseline_dist = baseline_df["sentiment_label"].str.lower().value_counts(normalize=True).to_dict()
        recent_dist = recent_df["sentiment_label"].str.lower().value_counts(normalize=True).to_dict()

        dist_comparison = []
        psi_total = 0.0

        for label in sent_labels:
            b_pct = baseline_dist.get(label, 0.001)
            r_pct = recent_dist.get(label, 0.001)
            # Ensure non-zero for log
            b_pct_safe = max(b_pct, 0.001)
            r_pct_safe = max(r_pct, 0.001)
            
            # Population Stability Index (PSI) component
            psi_component = (r_pct_safe - b_pct_safe) * np.log(r_pct_safe / b_pct_safe)
            psi_total += psi_component

            dist_comparison.append({
                "sentiment": label,
                "baseline_percent": round(b_pct * 100, 1),
                "recent_percent": round(r_pct * 100, 1),
                "shift": round((r_pct - b_pct) * 100, 1)
            })

        # 2. Vocabulary Drift (Emerging terms in recent period)
        cv = CountVectorizer(stop_words="english", max_features=100)
        cv.fit(df["message"].astype(str))

        b_counts = Counter()
        for msg in baseline_df["message"]:
            words = [w.lower() for w in str(msg).split() if len(w) > 3]
            b_counts.update(words)

        r_counts = Counter()
        for msg in recent_df["message"]:
            words = [w.lower() for w in str(msg).split() if len(w) > 3]
            r_counts.update(words)

        # Emerging terms in recent window
        emerging_terms = []
        for term, r_c in r_counts.most_common(50):
            b_c = b_counts.get(term, 0)
            if r_c > 3 and (b_c == 0 or r_c / (b_c + 1) >= 2.0):
                emerging_terms.append({
                    "term": term,
                    "recent_count": r_c,
                    "baseline_count": b_c,
                    "growth_ratio": round(r_c / max(1, b_c), 2)
                })

        # PSI severity classification
        drift_severity = "Minor" if psi_total < 0.1 else ("Moderate" if psi_total < 0.25 else "Significant Drift")
        flagged = bool(psi_total >= 0.1)

        return {
            "has_sufficient_data": True,
            "baseline_period": f"{baseline_start} to {baseline_end}",
            "recent_period": f"{recent_start} to {recent_end}",
            "baseline_sample_size": len(baseline_df),
            "recent_sample_size": len(recent_df),
            "psi_score": round(float(psi_total), 4),
            "drift_severity": drift_severity,
            "drift_flagged": flagged,
            "sentiment_distribution_comparison": dist_comparison,
            "emerging_terms": emerging_terms[:8],
            "definitions": {
                "data_drift": "Change in input data distribution P(X) over time (e.g. new slang, topic shifts, game patches).",
                "concept_drift": "Change in the relationship between input features and target labels P(Y|X) (e.g. 'sick' shifting from illness to praise).",
                "psi_formula": "PSI = Σ (Actual % - Expected %) * ln(Actual % / Expected %). Values > 0.25 indicate significant shift requiring model audit."
            }
        }

drift_service = DriftMonitoringService()
