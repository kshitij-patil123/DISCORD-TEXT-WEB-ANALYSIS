import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data_manager import dataset_manager

# Ensure tables and demo data are initialized
dataset_manager.initialize_data()

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_dashboard_endpoint():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "total_messages" in data
    assert "active_users" in data
    assert "sentiment_counts" in data
    assert data["total_messages"] > 0

def test_topics_endpoint():
    res = client.get("/api/topics")
    assert res.status_code == 200
    data = res.json()
    assert "topic_clusters" in data

def test_entities_endpoint():
    res = client.get("/api/entities")
    assert res.status_code == 200
    data = res.json()
    assert "top_entities" in data
    assert "top_games" in data

def test_network_endpoint():
    res = client.get("/api/network")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert "edges" in data

def test_recommend_endpoint():
    res = client.post("/api/recommend", json={
        "preferred_genres": ["Action RPG"],
        "interests": "dark fantasy open world",
        "top_n": 3
    })
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommendations"]) > 0

def test_model_metrics_endpoint():
    res = client.get("/api/model/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "evaluation_summary" in data
    assert "confusion_matrix" in data

def test_sentiment_predict_endpoint():
    res = client.post("/api/sentiment/predict", json={
        "text": "Valorant clutch with Jett was amazing gg!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "sentiment" in data
    assert "confidence" in data

def test_drift_endpoint():
    res = client.get("/api/drift")
    assert res.status_code == 200
    data = res.json()
    assert "psi_score" in data
