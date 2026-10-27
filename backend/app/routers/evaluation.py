from fastapi import APIRouter, Body
from typing import Dict, Any
from app.data_manager import dataset_manager
from app.ml.sentiment_model import sentiment_model
from app.ml.explainability import explainability_service
from app.config import settings

router = APIRouter(prefix="/model", tags=["Model Evaluation & XAI"])

@router.get("/metrics")
def get_model_evaluation_metrics():
    """
    Returns verified academic model metrics measured on the held-out test split (25%),
    including confusion matrix, classification report, global feature weights,
    and multi-slice demographic/channel bias diagnostics.
    """
    if not sentiment_model.is_trained:
        sentiment_model.train_and_evaluate(str(settings.DEMO_CSV_PATH))

    metrics = sentiment_model.evaluation_metrics
    global_importance = explainability_service.get_global_feature_importance(top_n=12)

    df = dataset_manager.get_dataframe()
    bias_eval = explainability_service.evaluate_bias_across_slices(df)

    return {
        "evaluation_summary": {
            "accuracy": metrics.get("accuracy", 0.0),
            "weighted_precision": metrics.get("weighted_precision", 0.0),
            "weighted_recall": metrics.get("weighted_recall", 0.0),
            "weighted_f1": metrics.get("weighted_f1", 0.0),
            "test_sample_size": metrics.get("test_sample_size", 0),
            "train_sample_size": metrics.get("train_sample_size", 0),
            "classes": metrics.get("classes", [])
        },
        "confusion_matrix": metrics.get("confusion_matrix", []),
        "raw_confusion_matrix": metrics.get("raw_confusion_matrix", []),
        "classification_report": metrics.get("classification_report", {}),
        "global_feature_importance": global_importance,
        "bias_diagnostics": bias_eval,
        "model_architecture": {
            "classifier": "Logistic Regression with L2 Regularization & Class Weight Balancing",
            "feature_extractor": "TF-IDF N-gram (1, 2) with Sublinear Scaling",
            "vocabulary_size": len(sentiment_model.vectorizer.get_feature_names_out()) if sentiment_model.is_trained else 0
        }
    }

@router.post("/explain")
def explain_single_prediction(payload: Dict[str, str] = Body(...)):
    """
    Computes local feature attribution (XAI) for an arbitrary input text.
    """
    text = payload.get("text", "")
    return explainability_service.explain_instance(text)
