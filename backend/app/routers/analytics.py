from fastapi import APIRouter, Depends, Body
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.database import get_db
from app.data_manager import dataset_manager
from app.nlp.preprocessor import preprocessor
from app.nlp.vectorizer import vectorizer_service
from app.nlp.entities import entity_service
from app.nlp.topics import topic_service

router = APIRouter(tags=["Analytics & NLP"])

@router.post("/nlp/process-text")
def process_single_text(payload: Dict[str, str] = Body(...)):
    """
    Demonstrates the complete step-by-step NLP Preprocessing pipeline
    (Tokenization, Normalization, Stopwords, Lemmatization, Stemming, Slang Extraction)
    on an arbitrary message.
    """
    text = payload.get("text", "")
    return preprocessor.process_pipeline(text)

@router.get("/nlp/term-frequencies")
def get_term_frequencies():
    """
    Returns word frequencies, top TF-IDF weighted terms, and
    an educational breakdown of embedding paradigms (TF-IDF vs Word2Vec vs Transformers).
    """
    df = dataset_manager.get_dataframe()
    texts = df["message"].tolist() if not df.empty else []

    top_tfidf = vectorizer_service.get_top_terms(texts, top_n=20)
    word_freq = vectorizer_service.get_word_frequencies(texts, top_n=25)
    embedding_info = vectorizer_service.explain_embedding_approaches()

    return {
        "top_tfidf_terms": top_tfidf,
        "word_frequencies": word_freq,
        "embedding_comparisons": embedding_info
    }

@router.get("/topics")
def get_topics():
    """
    Extracts unsupervised topic clusters using Non-negative Matrix Factorization (NMF)
    and tracks topic popularity trends across weeks.
    """
    df = dataset_manager.get_dataframe()
    texts = df["message"].tolist() if not df.empty else []
    records = df.to_dict(orient="records") if not df.empty else []

    clusters = topic_service.extract_topics_nmf(texts, n_words=6)
    trends = topic_service.compute_topic_trends_over_time(records)

    return {
        "algorithm": "Non-negative Matrix Factorization (NMF) on TF-IDF Vector Space",
        "topic_clusters": clusters,
        "trends_over_time": trends,
        "academic_explanation": (
            "Topic modeling decomposes the document-term matrix V into basis matrix W "
            "(documents to topics) and coefficient matrix H (topics to vocabulary terms). "
            "Unlike Latent Dirichlet Allocation (LDA) which relies on Dirichlet prior probabilities, "
            "NMF produces sparse, highly coherent, non-negative components ideal for short Discord posts."
        )
    }

@router.get("/entities")
def get_entities():
    """
    Performs Named Entity Recognition using spaCy supplemented with gaming gazetteers,
    linking recognized entities to public Wikidata knowledge bases.
    """
    df = dataset_manager.get_dataframe()
    texts = df["message"].tolist() if not df.empty else []

    results = entity_service.analyze_corpus_entities(texts)
    return results

@router.post("/analyze")
def trigger_full_analysis():
    """
    Executes the entire end-to-end NLP and ML analysis pipeline on the current dataset,
    refreshing in-memory matrices and caches.
    """
    df = dataset_manager.get_dataframe()
    if df.empty:
        return {"status": "error", "message": "Dataset is empty. Cannot run pipeline."}

    texts = df["message"].tolist()
    records = df.to_dict(orient="records")

    # Run subcomponents
    topics = topic_service.extract_topics_nmf(texts, n_words=5)
    entities = entity_service.analyze_corpus_entities(texts)
    tfidf_terms = vectorizer_service.get_top_terms(texts, top_n=10)

    return {
        "status": "success",
        "message": f"Pipeline successfully analyzed {len(df)} Discord messages.",
        "processed_records_count": len(df),
        "topics_discovered": len(topics),
        "entities_identified": entities.get("total_entities_found", 0),
        "top_keywords": [t["term"] for t in tfidf_terms]
    }
