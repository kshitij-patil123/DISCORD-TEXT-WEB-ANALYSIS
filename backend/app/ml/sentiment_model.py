import os
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
from app.nlp.preprocessor import preprocessor, GAMING_SLANG_LEXICON

class SentimentClassifier:
    """
    Supervised Sentiment Analysis Classifier for gaming community text.
    Uses TF-IDF feature extraction with Logistic Regression and gaming lexicon priors.
    Evaluated with strict train-test splits for honest academic metrics.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=1200,
            sublinear_tf=True
        )
        self.model = LogisticRegression(
            C=1.5,
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        )
        self.is_trained = False
        self.classes_ = ["negative", "neutral", "positive"]
        self.evaluation_metrics: Dict[str, Any] = {}

    def train_and_evaluate(self, csv_path: str) -> Dict[str, Any]:
        """
        Trains model on labeled dataset, evaluates on held-out test set (25%),
        and calculates confusion matrix and classification report.
        """
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Dataset not found at {csv_path}")

        df = pd.read_csv(csv_path)
        if "message" not in df.columns or "sentiment_label" not in df.columns:
            raise ValueError("CSV must contain 'message' and 'sentiment_label' columns")

        # Clean texts using preprocessor
        cleaned_texts = [preprocessor.clean_text(str(m)) for m in df["message"]]
        labels = df["sentiment_label"].astype(str).str.lower().tolist()

        # Stratified train-test split (75% train, 25% test)
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            cleaned_texts, labels, test_size=0.25, random_state=42, stratify=labels
        )

        # Fit TF-IDF on training set only
        X_train = self.vectorizer.fit_transform(X_train_raw)
        X_test = self.vectorizer.transform(X_test_raw)

        # Fit Logistic Regression
        self.model.fit(X_train, y_train)
        self.is_trained = True
        self.classes_ = list(self.model.classes_)

        # Predictions on held-out test data
        y_pred = self.model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        precision, recall, f1, support = precision_recall_fscore_support(
            y_test, y_pred, average="weighted", zero_division=0
        )
        cm = confusion_matrix(y_test, y_pred, labels=self.classes_)
        clf_report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

        # Format confusion matrix for UI display
        cm_matrix = []
        for i, actual_cls in enumerate(self.classes_):
            row_data = {"actual": actual_cls}
            for j, pred_cls in enumerate(self.classes_):
                row_data[f"pred_{pred_cls}"] = int(cm[i][j])
            cm_matrix.append(row_data)

        self.evaluation_metrics = {
            "test_sample_size": len(y_test),
            "train_sample_size": len(y_train),
            "accuracy": round(float(acc), 4),
            "weighted_precision": round(float(precision), 4),
            "weighted_recall": round(float(recall), 4),
            "weighted_f1": round(float(f1), 4),
            "classes": self.classes_,
            "confusion_matrix": cm_matrix,
            "raw_confusion_matrix": cm.tolist(),
            "classification_report": clf_report,
            "validation_note": (
                "Metrics evaluated on held-out 25% test set using stratified sampling. "
                "No training data was leaked into evaluation."
            )
        }

        return self.evaluation_metrics

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predicts sentiment for an arbitrary input message with confidence scores,
        class probabilities, and gaming slang recognition.
        """
        if not self.is_trained:
            # Fallback heuristic if not yet trained
            return {
                "text": text,
                "sentiment": "neutral",
                "confidence": 0.5,
                "probabilities": {"positive": 0.33, "neutral": 0.34, "negative": 0.33},
                "slang_detected": []
            }

        cleaned = preprocessor.clean_text(text)
        vec = self.vectorizer.transform([cleaned])
        probs = self.model.predict_proba(vec)[0]
        
        prob_dict = {
            cls_name: round(float(probs[idx]), 4)
            for idx, cls_name in enumerate(self.classes_)
        }
        
        pred_idx = np.argmax(probs)
        pred_class = self.classes_[pred_idx]
        confidence = float(probs[pred_idx])

        # Check gaming slang indicators
        slang_items = preprocessor.detect_slang(text)

        # Feature explanation (top positive and negative contributing words)
        feature_names = self.vectorizer.get_feature_names_out()
        coefs = self.model.coef_
        non_zero_indices = vec.nonzero()[1]
        
        word_contributions = []
        for idx in non_zero_indices:
            term = feature_names[idx]
            weight = float(coefs[pred_idx][idx] * vec[0, idx])
            word_contributions.append({
                "term": term,
                "contribution": round(weight, 4)
            })
        word_contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)

        return {
            "text": text,
            "cleaned_text": cleaned,
            "sentiment": pred_class,
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
            "slang_detected": [s["slang"] for s in slang_items],
            "word_contributions": word_contributions[:6],
            "limitations": [
                "Gaming sarcasm (e.g. 'Oh nice ping!') may be misinterpreted as positive.",
                "Short messages ('k', '?', 'gg') carry limited semantic context.",
                "Evolving gamer slang may not be in baseline vocabulary."
            ]
        }

sentiment_model = SentimentClassifier()
