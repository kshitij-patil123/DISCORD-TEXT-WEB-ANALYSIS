from typing import List, Dict, Any
import numpy as np
import pandas as pd
from app.ml.sentiment_model import sentiment_model
from app.nlp.preprocessor import preprocessor

class ExplainabilityService:
    """
    Explainable AI (XAI) and Bias Evaluation service.
    Provides global feature importance, local surrogate attribution,
    and demographic/channel slice bias diagnostics.
    """

    def get_global_feature_importance(self, top_n: int = 15) -> Dict[str, Any]:
        """
        Extracts top positive and negative vocabulary weights directly from
        the model's linear coefficient matrix (transparent glass-box explanation).
        """
        if not sentiment_model.is_trained:
            return {"positive_terms": [], "negative_terms": [], "neutral_terms": []}

        feature_names = sentiment_model.vectorizer.get_feature_names_out()
        classes = sentiment_model.classes_
        coefs = sentiment_model.model.coef_

        results = {}
        for idx, cls_name in enumerate(classes):
            cls_coefs = coefs[idx]
            top_positive_idx = cls_coefs.argsort()[::-1][:top_n]
            results[f"top_{cls_name}_terms"] = [
                {
                    "term": feature_names[i],
                    "weight": round(float(cls_coefs[i]), 4),
                    "impact": "strong positive correlation" if cls_coefs[i] > 0 else "negative"
                }
                for i in top_positive_idx if cls_coefs[i] > 0
            ]

        return {
            "feature_weights_by_class": results,
            "methodology": "Linear Model Coefficients (Global Feature Importance / Surrogate)",
            "interpretation": (
                "Terms with high positive coefficients heavily influence the model "
                "to predict the corresponding sentiment class when present in the message."
            )
        }

    def explain_instance(self, text: str) -> Dict[str, Any]:
        """
        Generates local explanation for an individual prediction,
        showing which words contributed towards or against the predicted outcome.
        """
        pred_res = sentiment_model.predict(text)
        return {
            "text": text,
            "prediction": pred_res["sentiment"],
            "confidence": pred_res["confidence"],
            "contributing_features": pred_res.get("word_contributions", []),
            "slang_detected": pred_res.get("slang_detected", []),
            "xai_type": "Local Interpretable Feature Attribution",
            "explanation_summary": (
                f"The message was classified as '{pred_res['sentiment']}' with "
                f"{round(pred_res['confidence'] * 100, 1)}% confidence."
            )
        }

    def evaluate_bias_across_slices(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Conducts slice-based evaluation to identify performance disparities:
        1. Across Channels (#valorant-lfg vs #rpg-tavern vs #game-dev)
        2. Across Message Length (Short < 10 words vs Medium 10-25 vs Long > 25)
        3. Across Slang Usage (Messages containing gamer slang vs standard English)
        """
        if not sentiment_model.is_trained or df.empty:
            return {"channel_slices": [], "length_slices": [], "slang_slices": []}

        # Predict sentiment for each record
        preds = []
        for text in df["message"]:
            p = sentiment_model.predict(str(text))
            preds.append(p["sentiment"])
        df = df.copy()
        df["predicted_sentiment"] = preds
        df["is_correct"] = (df["predicted_sentiment"] == df["sentiment_label"].str.lower()).astype(int)
        df["word_count"] = df["message"].apply(lambda m: len(str(m).split()))
        df["has_slang"] = df["message"].apply(lambda m: len(preprocessor.detect_slang(str(m))) > 0)

        # 1. Channel slices
        channel_slices = []
        for ch, group in df.groupby("channel"):
            if len(group) >= 5:
                acc = group["is_correct"].mean()
                channel_slices.append({
                    "slice_name": ch,
                    "sample_size": len(group),
                    "accuracy": round(float(acc), 4),
                    "pos_pred_rate": round(float((group["predicted_sentiment"] == "positive").mean()), 4),
                    "neg_pred_rate": round(float((group["predicted_sentiment"] == "negative").mean()), 4)
                })

        # 2. Length slices
        df["length_group"] = pd.cut(
            df["word_count"],
            bins=[0, 10, 25, 100],
            labels=["Short (<10 words)", "Medium (10-25 words)", "Long (>25 words)"]
        )
        length_slices = []
        for lg, group in df.groupby("length_group", observed=False):
            if len(group) > 0:
                length_slices.append({
                    "slice_name": str(lg),
                    "sample_size": len(group),
                    "accuracy": round(float(group["is_correct"].mean()), 4),
                    "pos_pred_rate": round(float((group["predicted_sentiment"] == "positive").mean()), 4),
                    "neg_pred_rate": round(float((group["predicted_sentiment"] == "negative").mean()), 4)
                })

        # 3. Slang slices
        slang_slices = []
        for has_s, group in df.groupby("has_slang"):
            name = "Contains Gaming Slang" if has_s else "Standard Vocabulary"
            slang_slices.append({
                "slice_name": name,
                "sample_size": len(group),
                "accuracy": round(float(group["is_correct"].mean()), 4),
                "pos_pred_rate": round(float((group["predicted_sentiment"] == "positive").mean()), 4),
                "neg_pred_rate": round(float((group["predicted_sentiment"] == "negative").mean()), 4)
            })

        return {
            "channel_slices": channel_slices,
            "length_slices": length_slices,
            "slang_slices": slang_slices,
            "critical_disclaimer": (
                "IMPORTANT: Performing a bias evaluation does NOT imply the model is free from bias. "
                "Disparities in accuracy across channels or message lengths reflect representation gaps, "
                "unbalanced slang tokens, and contextual nuances that require ongoing auditing."
            )
        }

explainability_service = ExplainabilityService()
