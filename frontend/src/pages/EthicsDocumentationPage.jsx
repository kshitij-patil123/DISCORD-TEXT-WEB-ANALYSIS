import React from 'react';
import {
  ShieldCheck,
  BookOpen,
  Lock,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  HelpCircle,
  FileCode
} from 'lucide-react';

export default function EthicsDocumentationPage() {
  const syllabusMapping = [
    {
      unit: 'Text Analytics & NLP Preprocessing',
      syllabusTopic: 'Tokenization, Normalization, Stopwords, Stemming & Lemmatization, TF-IDF Vectorization',
      implementationFile: 'backend/app/nlp/preprocessor.py, vectorizer.py',
      features: 'Handles Discord gaming slang, emojis, URLs, Porter stemmer, WordNet lemmatizer, sublinear TF-IDF weights.',
      vivaTip: 'Explain why lemmatization (morphological root lookup) is preferred over stemming (heuristic truncation) in contextual search.'
    },
    {
      unit: 'Named Entity Recognition & Semantics',
      syllabusTopic: 'Information Extraction, spaCy NER, Knowledge Graph Linking, Gazetteers',
      implementationFile: 'backend/app/nlp/entities.py',
      features: 'Extracts PERSON, ORG, GPE, and custom GAME entities; disambiguates via public Wikidata QIDs (e.g. Q85786049 for Valorant).',
      vivaTip: 'Discuss out-of-vocabulary challenges for gaming titles and why hybrid Gazetteers + statistical NER outperform plain models.'
    },
    {
      unit: 'Topic Modeling & Latent Discovery',
      syllabusTopic: 'Unsupervised Topic Modeling, Matrix Factorization (NMF vs LDA)',
      implementationFile: 'backend/app/nlp/topics.py',
      features: 'NMF decomposition V ≈ W × H extracting coherent topic themes; temporal tracking across chronological weeks.',
      vivaTip: 'Explain why NMF provides sparse, non-negative, and highly interpretable clusters for short conversational documents compared to LDA.'
    },
    {
      unit: 'Sentiment Analysis & Classification',
      syllabusTopic: 'Supervised Learning, TF-IDF + Logistic Regression, Evaluation on Held-Out Test Data',
      implementationFile: 'backend/app/ml/sentiment_model.py',
      features: 'Stratified train-test split (75/25), confidence probabilities, confusion matrix, classification report (P, R, F1).',
      vivaTip: 'Emphasize that test metrics were calculated strictly on held-out samples to prevent data snooping and false claims of accuracy.'
    },
    {
      unit: 'Social Media Mining & Network Analysis',
      syllabusTopic: 'Graph Theory, NetworkX, Degree & Betweenness Centrality, Community Detection',
      implementationFile: 'backend/app/social_network/network_analyzer.py',
      features: 'Direct reply_to & mention graphs, Fruchterman-Reingold 2D spring layout, Greedy Modularity community clustering.',
      vivaTip: 'Explain the academic distinction between interaction frequency and true social influence (opinion leadership).'
    },
    {
      unit: 'Recommendation Systems',
      syllabusTopic: 'Content-Based Filtering, Cosine Similarity, Feature Augmentation',
      implementationFile: 'backend/app/ml/recommender.py',
      features: 'TF-IDF cosine similarity across game metadata boosted by Discord community sentiment signals and genre alignment.',
      vivaTip: 'Explain how content-based filtering circumvents the cold-start problem when user-item transaction history is sparse.'
    },
    {
      unit: 'Web Analytics & Statistical Testing',
      syllabusTopic: 'HTML Meta Tags, Telemetry Ingestion, A/B Testing & Two-Sample Z-Test',
      implementationFile: 'backend/app/web_analytics/ab_testing.py',
      features: 'HTML metadata guide, telemetry lifecycle, two-sample proportion Z-test with P-values and 95% Confidence Intervals.',
      vivaTip: 'Explain Type I (α) vs Type II (β) errors and how sample size impacts statistical power in digital experimentation.'
    },
    {
      unit: 'MLOps, Drift Monitoring & Feedback',
      syllabusTopic: 'Population Stability Index (PSI), Covariate vs Concept Drift, Retraining Loops',
      implementationFile: 'backend/app/ml/drift_detector.py, routers/drift.py',
      features: 'PSI score tracking between baseline and recent periods, emerging vocabulary detection, SQLite feedback persistence.',
      vivaTip: 'Distinguish data drift P(X) from concept drift P(Y|X) and explain why automatic retraining should not be done without validation.'
    },
    {
      unit: 'Explainable AI & Bias Auditing',
      syllabusTopic: 'Surrogate Feature Attribution, Multi-Slice Fairness Diagnostics',
      implementationFile: 'backend/app/ml/explainability.py',
      features: 'Global linear coefficients, local token attribution, demographic/channel/slang slice performance parity audits.',
      vivaTip: 'Clarify that auditing a model across slices identifies disparities but does not guarantee the model is unbiased.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#5865F2]" />
          Comprehensive Ethics, Responsible AI & Syllabus Architecture Guide
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Detailed technical reference mapping Computer Engineering university syllabus units to implemented backend algorithms, design choices, and viva explanations.
        </p>
      </div>

      {/* Ethics & Privacy Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#2b2d31] rounded-xl border border-[#35373c] space-y-2">
          <div className="flex items-center gap-2 text-[#57F287] font-bold text-xs uppercase">
            <Lock size={16} />
            <span>1. Authorized Collection</span>
          </div>
          <p className="text-xs text-[#949ba4] leading-relaxed">
            Operates in Demo Mode by default with zero external credentials. Mode B requires explicit server administrator authorization via official Discord Bot OAuth2 intents.
          </p>
        </div>

        <div className="p-4 bg-[#2b2d31] rounded-xl border border-[#35373c] space-y-2">
          <div className="flex items-center gap-2 text-[#5865F2] font-bold text-xs uppercase">
            <EyeOff size={16} />
            <span>2. Data Minimization</span>
          </div>
          <p className="text-xs text-[#949ba4] leading-relaxed">
            All user IDs are hashed into pseudonyms (<code className="text-[#FEE75C]">user_shadow_99</code>). Direct Messages (DMs) and private channels are strictly excluded from ingestion.
          </p>
        </div>

        <div className="p-4 bg-[#2b2d31] rounded-xl border border-[#35373c] space-y-2">
          <div className="flex items-center gap-2 text-[#FEE75C] font-bold text-xs uppercase">
            <AlertTriangle size={16} />
            <span>3. Fairness & Bias</span>
          </div>
          <p className="text-xs text-[#949ba4] leading-relaxed">
            Audits performance across channels, message lengths, and slang presence. Recognizes that audits highlight representational disparity but do not magically eliminate bias.
          </p>
        </div>

        <div className="p-4 bg-[#2b2d31] rounded-xl border border-[#35373c] space-y-2">
          <div className="flex items-center gap-2 text-[#EB459E] font-bold text-xs uppercase">
            <Cpu size={16} />
            <span>4. Model Transparency</span>
          </div>
          <p className="text-xs text-[#949ba4] leading-relaxed">
            Every classification exposes contributing token weights. The recommendation engine details matching topics, sentiment signals, and the exact rationale behind each suggestion.
          </p>
        </div>
      </div>

      {/* Complete Syllabus Mapping Table */}
      <div className="discord-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#35373c] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen size={16} className="text-[#5865F2]" />
              Engineering Syllabus to Project Implementation Mapping
            </h3>
            <p className="text-xs text-[#949ba4]">Direct traceability for project viva, external examiners, and academic defense</p>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#57F287]/20 text-[#57F287]">
            9 Full Syllabus Units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
              <tr>
                <th className="p-3">Syllabus Topic Area</th>
                <th className="p-3">Implemented Code File</th>
                <th className="p-3">Core Technical Features</th>
                <th className="p-3">Examiner Viva Tip & Defense Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#35373c]">
              {syllabusMapping.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#35373c]/30">
                  <td className="p-3">
                    <span className="font-bold text-white block">{item.unit}</span>
                    <span className="text-[#949ba4] text-[11px]">{item.syllabusTopic}</span>
                  </td>
                  <td className="p-3 font-mono text-[#5865F2]">{item.implementationFile}</td>
                  <td className="p-3 text-[#dbdee1] max-w-xs">{item.features}</td>
                  <td className="p-3 text-[#57F287] max-w-xs">{item.vivaTip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Viva FAQ & Defense Guide */}
      <div className="discord-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle size={16} className="text-[#FEE75C]" />
          Student Viva Q&A Guide (Anticipated Examiner Questions)
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
            <span className="font-bold text-[#5865F2]">Q1: Why did you choose TF-IDF + Logistic Regression over BERT/Transformers as the primary classifier?</span>
            <p className="text-[#dbdee1] leading-relaxed">
              <strong>Answer:</strong> For college-level deployment, TF-IDF with Logistic Regression provides microsecond inference latency, full glass-box interpretability (linear feature coefficients directly readable by humans), zero GPU dependency, and strong baseline accuracy on short gaming snippets without hallucination risks.
            </p>
          </div>

          <div className="p-3.5 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
            <span className="font-bold text-[#57F287]">Q2: How does the game recommendation engine leverage community sentiment?</span>
            <p className="text-[#dbdee1] leading-relaxed">
              <strong>Answer:</strong> It computes a composite score: Base Cosine Similarity on TF-IDF vectors + Genre Overlap Bonus (+0.15 per match) + Live Community Sentiment Bonus (+0.08 if positive, -0.05 if negative). This ensures titles being praised in recent chat rise in rank.
            </p>
          </div>

          <div className="p-3.5 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
            <span className="font-bold text-[#EB459E]">Q3: How do you measure Data Drift versus Concept Drift?</span>
            <p className="text-[#dbdee1] leading-relaxed">
              <strong>Answer:</strong> Data drift measures shifts in input feature distributions $P(X)$ over time (e.g. emerging slang tokens tracked via frequency ratios). Concept drift occurs when the probability distribution $P(Y|X)$ shifts (e.g. words changing semantic valence). We use Population Stability Index (PSI) to quantify distribution shift across time buckets.
            </p>
          </div>

          <div className="p-3.5 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
            <span className="font-bold text-[#FEE75C]">Q4: How does the network analysis distinguish interaction from true influence?</span>
            <p className="text-[#dbdee1] leading-relaxed">
              <strong>Answer:</strong> High degree centrality simply measures chat volume and replies (interaction). True social influence requires opinion leadership, sentiment sway, and high betweenness centrality (controlling the flow of information across distinct communities).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
