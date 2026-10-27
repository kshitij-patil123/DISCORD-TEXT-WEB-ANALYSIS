import re
import string
from typing import List, Dict, Any, Tuple
import nltk
from nltk.stem import WordNetLemmatizer, PorterStemmer

# Safe initialization of NLTK tools
try:
    from nltk.corpus import stopwords
    STOP_WORDS = set(stopwords.words("english"))
except Exception:
    # Comprehensive fallback stopwords list in case of missing corpus
    STOP_WORDS = {
        "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
        "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
        "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
        "theirs", "themselves", "what", "which", "who", "whom", "this", "that",
        "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
        "the", "and", "but", "if", "or", "because", "as", "until", "while", "of",
        "at", "by", "for", "with", "about", "against", "between", "into", "through",
        "during", "before", "after", "above", "below", "to", "from", "up", "down",
        "in", "out", "on", "off", "over", "under", "again", "further", "then",
        "once", "here", "there", "when", "where", "why", "how", "all", "any",
        "both", "each", "few", "more", "most", "other", "some", "such", "no",
        "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s",
        "t", "can", "will", "just", "don", "should", "now"
    }

# Known gaming slang mapping and detection
GAMING_SLANG_LEXICON: Dict[str, str] = {
    "gg": "good game",
    "wp": "well played",
    "ggwp": "good game well played",
    "ez": "easy",
    "clutch": "critical win under pressure",
    "pog": "play of the game / awesome",
    "poggers": "awesome",
    "nerf": "weaken game balance",
    "buff": "strengthen game balance",
    "op": "overpowered",
    "diff": "skill difference",
    "carry": "lead team to victory",
    "inting": "intentional feeding / dying",
    "tilt": "frustrated emotional state",
    "smurf": "high-ranked player on new account",
    "ff": "forfeit",
    "afk": "away from keyboard",
    "lfg": "looking for group",
    "brb": "be right back",
    "dps": "damage per second",
    "meta": "most effective tactic available",
    "noob": "new player",
    "lag": "network latency",
    "ping": "network delay ms",
    "kdr": "kill death ratio",
    "rn": "right now",
    "tbh": "to be honest",
    "smh": "shaking my head",
    "imo": "in my opinion"
}

# Regex patterns
URL_PATTERN = re.compile(r"https?://\S+|www\.\S+")
MENTION_PATTERN = re.compile(r"@[a-zA-Z0-9_]+")
CHANNEL_PATTERN = re.compile(r"#[a-zA-Z0-9_-]+")
EMOJI_PATTERN = re.compile(r"[\U00010000-\U0010ffff]|:[a-zA-Z0-9_]+:", flags=re.UNICODE)
PUNCTUATION_PATTERN = re.compile(f"[{re.escape(string.punctuation)}]")

lemmatizer = WordNetLemmatizer()
stemmer = PorterStemmer()

class TextPreprocessor:
    """
    Comprehensive NLP preprocessing pipeline for Discord conversational text.
    Handles tokenization, normalization, regex-based entity/mention cleaning,
    slang recognition, stopword filtering, lemmatization, and stemming.
    """

    def __init__(self):
        self.stop_words = STOP_WORDS
        self.lemmatizer = lemmatizer
        self.stemmer = stemmer

    def clean_text(self, text: str, preserve_slang: bool = True) -> str:
        """
        Step 1: Normalization
        - Strips URLs
        - Standardizes mentions and channels
        - Lowercases
        - Removes punctuation and extra whitespace
        """
        if not text or not isinstance(text, str):
            return ""

        # Remove URLs
        cleaned = URL_PATTERN.sub(" ", text)

        # Remove mentions and channels
        cleaned = MENTION_PATTERN.sub(" ", cleaned)
        cleaned = CHANNEL_PATTERN.sub(" ", cleaned)

        # Remove emojis
        cleaned = EMOJI_PATTERN.sub(" ", cleaned)

        # Lowercase
        cleaned = cleaned.lower()

        # Remove punctuation
        cleaned = PUNCTUATION_PATTERN.sub(" ", cleaned)

        # Collapse whitespace
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        return cleaned

    def tokenize(self, text: str) -> List[str]:
        """
        Step 2: Tokenization
        Splits normalized text into individual word tokens.
        """
        cleaned = self.clean_text(text)
        return cleaned.split() if cleaned else []

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """
        Step 3: Stopword Filtering
        Filters out common English stopwords while preserving meaningful terms.
        """
        return [w for w in tokens if w not in self.stop_words and len(w) > 1]

    def lemmatize_tokens(self, tokens: List[str]) -> List[str]:
        """
        Step 4: Lemmatization
        Reduces tokens to their dictionary base lemma.
        """
        result = []
        for t in tokens:
            try:
                result.append(self.lemmatizer.lemmatize(t))
            except Exception:
                result.append(t)
        return result

    def stem_tokens(self, tokens: List[str]) -> List[str]:
        """
        Step 5: Stemming
        Reduces tokens using the Porter Stemmer heuristic algorithm.
        """
        return [self.stemmer.stem(t) for t in tokens]

    def detect_slang(self, text: str) -> List[Dict[str, str]]:
        """
        Identifies gaming slang terms present in the message and provides definitions.
        """
        words = re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())
        detected = []
        seen = set()
        for w in words:
            if w in GAMING_SLANG_LEXICON and w not in seen:
                seen.add(w)
                detected.append({
                    "slang": w,
                    "meaning": GAMING_SLANG_LEXICON[w]
                })
        return detected

    def process_pipeline(self, text: str) -> Dict[str, Any]:
        """
        Runs the complete NLP pipeline and returns artifacts for each stage
        for student inspection and viva demonstration.
        """
        cleaned = self.clean_text(text)
        tokens = self.tokenize(text)
        no_stopwords = self.remove_stopwords(tokens)
        lemmas = self.lemmatize_tokens(no_stopwords)
        stems = self.stem_tokens(no_stopwords)
        slang = self.detect_slang(text)

        # Extract mentions and channels from original text
        mentions = MENTION_PATTERN.findall(text)
        channels = CHANNEL_PATTERN.findall(text)

        return {
            "original_text": text,
            "cleaned_text": cleaned,
            "raw_tokens": tokens,
            "filtered_tokens": no_stopwords,
            "lemmas": lemmas,
            "stems": stems,
            "detected_slang": slang,
            "extracted_mentions": mentions,
            "extracted_channels": channels,
            "token_count": len(tokens),
            "filtered_count": len(no_stopwords)
        }

preprocessor = TextPreprocessor()
