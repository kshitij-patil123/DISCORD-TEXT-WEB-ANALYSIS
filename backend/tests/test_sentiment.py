import pytest
from app.ml.sentiment_model import sentiment_model
from app.config import settings

def test_model_training_and_metrics():
    metrics = sentiment_model.train_and_evaluate(str(settings.DEMO_CSV_PATH))
    assert sentiment_model.is_trained is True
    assert "accuracy" in metrics
    assert "confusion_matrix" in metrics
    assert 0.0 <= metrics["accuracy"] <= 1.0
    assert metrics["test_sample_size"] > 0

def test_sentiment_prediction():
    if not sentiment_model.is_trained:
        sentiment_model.train_and_evaluate(str(settings.DEMO_CSV_PATH))
    
    pos_res = sentiment_model.predict("This game is an absolute masterpiece, loving every second!")
    assert pos_res["sentiment"] in ["positive", "neutral", "negative"]
    assert 0.0 <= pos_res["confidence"] <= 1.0
    assert "positive" in pos_res["probabilities"]

    neg_res = sentiment_model.predict("Horrible update, servers lag constantly and ranked is unplayable")
    assert neg_res["sentiment"] in ["positive", "neutral", "negative"]
    assert len(neg_res["word_contributions"]) >= 0
