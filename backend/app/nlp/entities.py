import re
from typing import List, Dict, Any, Tuple
from collections import Counter
import spacy

# Known gaming entities mapping with Wikidata IDs for Entity Linking
WIKIDATA_KNOWLEDGE_BASE = {
    "Valorant": {
        "wikidata_id": "Q85786049",
        "description": "2020 tactical first-person hero shooter video game by Riot Games",
        "genre": "First-Person Shooter",
        "developer": "Riot Games",
        "url": "https://www.wikidata.org/wiki/Q85786049"
    },
    "Elden Ring": {
        "wikidata_id": "Q64506306",
        "description": "2022 action role-playing game directed by Hidetaka Miyazaki",
        "genre": "Action RPG",
        "developer": "FromSoftware",
        "url": "https://www.wikidata.org/wiki/Q64506306"
    },
    "Cyberpunk 2077": {
        "wikidata_id": "Q47455599",
        "description": "2020 action role-playing video game by CD Projekt Red set in Night City",
        "genre": "Action RPG",
        "developer": "CD Projekt Red",
        "url": "https://www.wikidata.org/wiki/Q47455599"
    },
    "Baldurs Gate 3": {
        "wikidata_id": "Q64493013",
        "description": "2023 role-playing video game based on Dungeons & Dragons by Larian Studios",
        "genre": "CRPG",
        "developer": "Larian Studios",
        "url": "https://www.wikidata.org/wiki/Q64493013"
    },
    "Hades II": {
        "wikidata_id": "Q115641774",
        "description": "Roguelike action RPG sequel by Supergiant Games",
        "genre": "Roguelike Action",
        "developer": "Supergiant Games",
        "url": "https://www.wikidata.org/wiki/Q115641774"
    },
    "Hollow Knight": {
        "wikidata_id": "Q29000980",
        "description": "2017 Metroidvania action-adventure game developed by Team Cherry",
        "genre": "Metroidvania",
        "developer": "Team Cherry",
        "url": "https://www.wikidata.org/wiki/Q29000980"
    },
    "Minecraft": {
        "wikidata_id": "Q49740",
        "description": "Sandbox video game developed by Mojang Studios",
        "genre": "Sandbox",
        "developer": "Mojang Studios",
        "url": "https://www.wikidata.org/wiki/Q49740"
    },
    "Helldivers 2": {
        "wikidata_id": "Q118645511",
        "description": "2024 cooperative third-person shooter by Arrowhead Game Studios",
        "genre": "Third-Person Shooter",
        "developer": "Arrowhead Game Studios",
        "url": "https://www.wikidata.org/wiki/Q118645511"
    },
    "Counter-Strike 2": {
        "wikidata_id": "Q117285145",
        "description": "2023 tactical first-person shooter game developed by Valve",
        "genre": "Tactical FPS",
        "developer": "Valve",
        "url": "https://www.wikidata.org/wiki/Q117285145"
    },
    "Riot Games": {
        "wikidata_id": "Q1050808",
        "description": "American video game developer and esports tournament organizer",
        "genre": "Video Game Publisher",
        "developer": "Tencent (Parent)",
        "url": "https://www.wikidata.org/wiki/Q1050808"
    },
    "FromSoftware": {
        "wikidata_id": "Q901967",
        "description": "Japanese video game development company known for Souls series",
        "genre": "Video Game Developer",
        "developer": "Kadokawa Corporation",
        "url": "https://www.wikidata.org/wiki/Q901967"
    },
    "Larian Studios": {
        "wikidata_id": "Q2188439",
        "description": "Belgian video game developer known for Divinity and Baldur's Gate 3",
        "genre": "Video Game Developer",
        "developer": "Independent",
        "url": "https://www.wikidata.org/wiki/Q2188439"
    },
    "CD Projekt Red": {
        "wikidata_id": "Q1023153",
        "description": "Polish video game developer known for The Witcher and Cyberpunk",
        "genre": "Video Game Developer",
        "developer": "CD Projekt",
        "url": "https://www.wikidata.org/wiki/Q1023153"
    }
}

class EntityRecognizerService:
    """
    Named Entity Recognition using spaCy with custom domain gaming rules
    and Wikidata Entity Linking.
    """

    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except Exception:
            self.nlp = spacy.blank("en")

        # Custom Gaming Entity Patterns
        self.game_patterns = [
            "Valorant", "Elden Ring", "Cyberpunk 2077", "Baldurs Gate 3",
            "Hades II", "Hades", "Hollow Knight", "Apex Legends", "Overwatch 2",
            "Minecraft", "Genshin Impact", "Helldivers 2", "Stardew Valley",
            "Counter-Strike 2", "CS2", "Lethal Company", "The Witcher 3",
            "Sea of Thieves", "Celeste", "Monster Hunter: World", "Rocket League",
            "Palworld", "Deadlock", "Godot"
        ]

        self.gaming_orgs = [
            "Riot Games", "FromSoftware", "CD Projekt Red", "Larian Studios",
            "Valve", "Blizzard", "Blizzard Entertainment", "Mojang", "Team Cherry",
            "Supergiant Games", "Arrowhead Game Studios", "ConcernedApe", "Capcom"
        ]

        self.gaming_persons = [
            "shroud", "tenz", "faker", "s1mple", "Miyazaki", "Gabe Newell",
            "George R.R. Martin", "Melinoe", "Zagreus", "Malenia", "Radahn"
        ]

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts entities using spaCy pipeline supplemented by gaming gazetteer.
        """
        if not text:
            return []

        doc = self.nlp(text)
        entities = []
        seen = set()

        # 1. Custom Gaming gazetteer search
        for game in self.game_patterns:
            pattern = re.compile(rf"\b{re.escape(game)}\b", re.IGNORECASE)
            for m in pattern.finditer(text):
                matched_text = m.group()
                if (matched_text.lower(), "GAME") not in seen:
                    seen.add((matched_text.lower(), "GAME"))
                    linked = WIKIDATA_KNOWLEDGE_BASE.get(game, None)
                    entities.append({
                        "text": matched_text,
                        "label": "GAME",
                        "start_char": m.start(),
                        "end_char": m.end(),
                        "kb_linked": linked is not None,
                        "wikidata": linked
                    })

        for org in self.gaming_orgs:
            pattern = re.compile(rf"\b{re.escape(org)}\b", re.IGNORECASE)
            for m in pattern.finditer(text):
                matched_text = m.group()
                if (matched_text.lower(), "ORG") not in seen:
                    seen.add((matched_text.lower(), "ORG"))
                    linked = WIKIDATA_KNOWLEDGE_BASE.get(org, None)
                    entities.append({
                        "text": matched_text,
                        "label": "ORG",
                        "start_char": m.start(),
                        "end_char": m.end(),
                        "kb_linked": linked is not None,
                        "wikidata": linked
                    })

        for person in self.gaming_persons:
            pattern = re.compile(rf"\b{re.escape(person)}\b", re.IGNORECASE)
            for m in pattern.finditer(text):
                matched_text = m.group()
                if (matched_text.lower(), "PERSON") not in seen:
                    seen.add((matched_text.lower(), "PERSON"))
                    entities.append({
                        "text": matched_text,
                        "label": "PERSON",
                        "start_char": m.start(),
                        "end_char": m.end(),
                        "kb_linked": False,
                        "wikidata": None
                    })

        # 2. Native spaCy NER
        for ent in doc.ents:
            # Map spaCy entity labels
            norm_label = ent.label_
            if (ent.text.lower(), norm_label) not in seen:
                # Discard low-value CARDINAL or ORDINAL numbers for cleaner view
                if norm_label in ["PERSON", "ORG", "GPE", "LOC", "PRODUCT", "EVENT"]:
                    seen.add((ent.text.lower(), norm_label))
                    linked = WIKIDATA_KNOWLEDGE_BASE.get(ent.text, None)
                    entities.append({
                        "text": ent.text,
                        "label": norm_label,
                        "start_char": ent.start_char,
                        "end_char": ent.end_char,
                        "kb_linked": linked is not None,
                        "wikidata": linked
                    })

        return entities

    def analyze_corpus_entities(self, texts: List[str]) -> Dict[str, Any]:
        """
        Aggregates entities across all Discord messages, computing counts,
        label breakdowns, and top gaming entities.
        """
        all_entities = []
        label_counter = Counter()
        entity_counter = Counter()
        game_counter = Counter()

        for text in texts:
            ents = self.extract_entities(text)
            for ent in ents:
                label_counter[ent["label"]] += 1
                entity_counter[(ent["text"], ent["label"])] += 1
                if ent["label"] == "GAME":
                    game_counter[ent["text"]] += 1
                all_entities.append(ent)

        top_entities = [
            {
                "text": text,
                "label": label,
                "count": count,
                "wikidata": WIKIDATA_KNOWLEDGE_BASE.get(text, None)
            }
            for (text, label), count in entity_counter.most_common(25)
        ]

        top_games = [
            {"game": game, "mentions": count}
            for game, count in game_counter.most_common(10)
        ]

        return {
            "total_entities_found": len(all_entities),
            "label_distribution": dict(label_counter),
            "top_entities": top_entities,
            "top_games": top_games,
            "explanation": (
                "Named Entity Recognition identifies mentions of People, Organizations, "
                "Locations (GPE), and Gaming Titles. Standard spaCy models may misclassify "
                "gaming jargon (e.g. tagging 'Riot Games' as PERSON or missing new titles). "
                "Our pipeline uses hybrid Gazetteers + spaCy NER with Wikidata entity linking."
            )
        }

entity_service = EntityRecognizerService()
