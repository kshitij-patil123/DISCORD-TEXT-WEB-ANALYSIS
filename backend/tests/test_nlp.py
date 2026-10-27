import pytest
from app.nlp.preprocessor import preprocessor
from app.nlp.vectorizer import vectorizer_service

def test_text_cleaning():
    text = "Check out https://discord.gg/test and @user_shadow_99 in #general! GG WP 🔥"
    cleaned = preprocessor.clean_text(text)
    assert "https" not in cleaned
    assert "@user" not in cleaned
    assert "#general" not in cleaned
    assert "gg" in cleaned or "wp" in cleaned

def test_tokenization_and_lemmatization():
    text = "The gamers were playing competitive matches and climbing ranks"
    tokens = preprocessor.tokenize(text)
    assert "gamers" in tokens
    assert "playing" in tokens
    
    no_stop = preprocessor.remove_stopwords(tokens)
    lemmas = preprocessor.lemmatize_tokens(no_stop)
    assert len(lemmas) > 0

def test_gaming_slang_detection():
    text = "That clutch was absolute pog, Jett diff carried us gg"
    detected = preprocessor.detect_slang(text)
    slangs = [d["slang"] for d in detected]
    assert "clutch" in slangs
    assert "pog" in slangs
    assert "diff" in slangs
    assert "gg" in slangs

def test_tfidf_term_extraction():
    corpus = [
        "Valorant tactical shooter esports ranked climb",
        "Elden Ring dark fantasy souls RPG exploration",
        "Valorant competitive clutch Jett ace"
    ]
    top_terms = vectorizer_service.get_top_terms(corpus, top_n=5)
    assert len(top_terms) > 0
    terms = [t["term"] for t in top_terms]
    assert "valorant" in terms
