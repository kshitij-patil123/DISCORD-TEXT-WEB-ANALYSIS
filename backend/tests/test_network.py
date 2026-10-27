import pytest
from app.social_network.network_analyzer import network_analyzer

def test_social_network_graph():
    sample_messages = [
        {"message_id": "M1", "user_id": "user_a", "channel": "#general", "message": "Hey @user_b how are you?"},
        {"message_id": "M2", "user_id": "user_b", "channel": "#general", "message": "Good! @user_c join us", "reply_to": "M1"},
        {"message_id": "M3", "user_id": "user_c", "channel": "#general", "message": "On my way!", "reply_to": "M2"}
    ]
    res = network_analyzer.analyze_network(sample_messages)
    assert "nodes" in res
    assert "edges" in res
    assert len(res["nodes"]) >= 3
    assert len(res["edges"]) >= 2
    assert "top_connected" in res
    assert "syllabus_concepts" in res
