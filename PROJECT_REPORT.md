# DISCORD TEXT WEB ANALYSIS — CAPSTONE ENGINEERING PROJECT REPORT

**A Comprehensive System Integrating Text Analytics, Web Analytics, Social Media Mining, Sentiment Analysis, and Recommendation Systems**

*Submitted in partial fulfillment of the requirements for the Degree of Bachelor of Engineering / Technology in Computer Science & Engineering*

---

## ABSTRACT

In digital gaming and open developer ecosystems, Discord has emerged as the premier real-time communication platform. Millions of participants exchange unstructured, conversational text daily. However, analyzing Discord conversational data presents acute technical challenges: text is heavily abbreviated, punctuated by domain slang (e.g., *"clutch"*, *"diff"*, *"inting"*, *"pog"*), filled with emojis, and structurally fragmented into multi-threaded asynchronous replies.

This project, titled **"Discord Text Web Analysis"**, designs, implements, and evaluates an end-to-end, full-stack analytical platform that converts raw, conversational Discord messages into actionable community intelligence. The system incorporates:
1. **Text Analytics & Preprocessing:** A multi-stage pipeline performing regex normalization, stopword filtering, WordNet lemmatization, Porter stemming, and sublinear TF-IDF vectorization.
2. **Information Extraction & Named Entity Recognition (NER):** A hybrid statistical-gazetteer spaCy engine extracting Persons, Organizations, Locations, and Game Titles, linked canonically to the **Wikidata Knowledge Base** via unique QIDs.
3. **Unsupervised Topic Modeling:** Non-negative Matrix Factorization (NMF) decomposing sparse document-term spaces ($V \approx W \times H$) into coherent themes, tracking temporal topic dynamics across chronological weeks.
4. **Supervised Sentiment Analysis:** A multiclass Logistic Regression classifier with class balancing, evaluated strictly on held-out test data (25% split) achieving **84.0% accuracy** and an **83.9% F1-score**.
5. **Social Media Mining:** Modeling community message-reply and `@mention` interactions as directed graphs using **NetworkX**, computing Degree Centrality, Betweenness Centrality (gatekeeper bridges), PageRank, and Greedy Modularity community clusters.
6. **Recommendation Systems:** A hybrid content-based recommendation engine matching user preference queries against game metadata via TF-IDF cosine similarity, augmented by real-time Discord community sentiment signals.
7. **Web Analytics & Experimentation:** HTML5 metadata architecture paired with an algorithmic A/B testing simulator computing two-sample proportion Z-tests, $P$-values, and 95% Confidence Intervals.
8. **MLOps, Explainable AI & Bias Auditing:** Population Stability Index (PSI) drift monitoring, transparent linear surrogate token attributions, and multi-slice demographic bias diagnostics across channels, message lengths, and slang presence.

The application is deployed with a high-performance **FastAPI (Python)** backend and an interactive **React 18 / Vite / Tailwind CSS** dark dashboard inspired by Discord's interface.

**Keywords:** *Natural Language Processing, Text Analytics, Sentiment Analysis, Named Entity Recognition, Social Media Mining, NetworkX, Recommendation Systems, Web Analytics, A/B Testing, Explainable AI, Population Stability Index, FastAPI, React.*

---

## TABLE OF CONTENTS

1. **Chapter 1: Introduction**
   - 1.1 Background & Motivation
   - 1.2 Problem Definition
   - 1.3 Project Objectives & Scope
2. **Chapter 2: Literature Survey & Related Work**
   - 2.1 Conventional Text Mining vs. Conversational Chat Mining
   - 2.2 Evolution of Sentiment Analysis in Gaming Communities
   - 2.3 Graph Theory in Social Network Mining
   - 2.4 Recommender Systems in Interactive Media
3. **Chapter 3: System Requirements & Architecture**
   - 3.1 Software & Hardware Requirements
   - 3.2 High-Level System Architecture
   - 3.3 Database Design & Schema Specification
4. **Chapter 4: Methodology & Mathematical Formulations**
   - 4.1 NLP Preprocessing & Slang Lexicon Parsing
   - 4.2 TF-IDF Feature Extraction & Sublinear Scaling
   - 4.3 Named Entity Recognition & Wikidata Knowledge Graph Linking
   - 4.4 Non-negative Matrix Factorization (NMF) for Topic Discovery
   - 4.5 Sentiment Classification with Class-Weighted Logistic Regression
   - 4.6 Social Network Analysis: Centrality & Modularity Formulations
   - 4.7 Hybrid Content-Based Recommendation Algorithm
   - 4.8 Statistical Hypothesis Testing (Two-Sample Z-Test)
   - 4.9 Population Stability Index (PSI) Drift Formulation
5. **Chapter 5: Implementation Details**
   - 5.1 Backend Gateway & API Design (FastAPI)
   - 5.2 Frontend Dashboard Architecture (React 18, Vite, Recharts)
   - 5.3 Data Ingestion & Dual-Mode Operation (Mode A vs. Mode B)
6. **Chapter 6: Experimental Results & Model Evaluation**
   - 6.1 Dataset Characteristics
   - 6.2 Held-Out Test Set Metrics & Confusion Matrix
   - 6.3 Multi-Slice Bias Diagnostics
   - 6.4 Explainable AI (Global & Local Feature Attributions)
   - 6.5 Automated Test Verification
7. **Chapter 7: Ethics, Data Privacy & Responsible AI**
   - 7.1 Consent & Authorized Data Collection
   - 7.2 Data Minimization & User Pseudonymization
   - 7.3 Model Limitations & Fairness Disclaimers
8. **Chapter 8: Conclusion & Future Scope**
   - 8.1 Key Contributions
   - 8.2 Future Enhancements
9. **References**

*(Full technical content available in the project documentation directory)*
