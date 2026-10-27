import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';

export default function EthicsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="discord-card w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#35373c] bg-[#1e1f22]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5865F2]/20 text-[#5865F2] rounded-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Data Ethics, Privacy & Responsible AI</h2>
              <p className="text-xs text-[#949ba4]">College Engineering Project Compliance & Syllabus Alignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#949ba4] hover:text-white rounded-lg hover:bg-[#35373c] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-[#dbdee1]">
          {/* Key Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
              <div className="flex items-center gap-2 text-[#57F287] font-semibold">
                <Lock size={16} />
                <span>Consent & Authorized Data Collection</span>
              </div>
              <p className="text-xs text-[#949ba4] leading-relaxed">
                Mode A functions entirely on synthetic, offline datasets without any Discord credentials. Mode B relies on explicit OAuth2/Bot permissions limited exclusively to permitted channels where server members consent to analytics.
              </p>
            </div>

            <div className="p-4 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
              <div className="flex items-center gap-2 text-[#5865F2] font-semibold">
                <EyeOff size={16} />
                <span>User Pseudonymization & Privacy</span>
              </div>
              <p className="text-xs text-[#949ba4] leading-relaxed">
                Raw Discord snowflake IDs and personal usernames are strictly pseudonymized into hashed identifiers (e.g. <code className="text-[#FEE75C]">user_shadow_99</code>) before processing, preventing PII leaks or social profiling.
              </p>
            </div>

            <div className="p-4 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
              <div className="flex items-center gap-2 text-[#FEE75C] font-semibold">
                <AlertTriangle size={16} />
                <span>Model Limitations & Bias Audits</span>
              </div>
              <p className="text-xs text-[#949ba4] leading-relaxed">
                Sentiment classifiers often struggle with sarcasm, gamer slang (e.g., 'sick play', 'that was filthy'), and short emotes. We explicitly quantify bias across channel and length slices, recognizing that audits alone do not make a model unbiased.
              </p>
            </div>

            <div className="p-4 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
              <div className="flex items-center gap-2 text-[#EB459E] font-semibold">
                <BookOpen size={16} />
                <span>Transparent Explainable AI (XAI)</span>
              </div>
              <p className="text-xs text-[#949ba4] leading-relaxed">
                Every prediction exposes contributing token weights. The recommendation system transparently discloses why each title was ranked, preventing black-box opacity.
              </p>
            </div>
          </div>

          {/* Syllabus Topic Mapping */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f2f3f5] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#57F287]" />
              Syllabus Topic to Project Implementation Mapping
            </h3>
            <div className="overflow-x-auto border border-[#35373c] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
                  <tr>
                    <th className="p-3">Syllabus Area</th>
                    <th className="p-3">Implemented Technology & Module</th>
                    <th className="p-3">Application Feature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35373c] bg-[#2b2d31]">
                  <tr>
                    <td className="p-3 font-semibold text-white">Text Analytics</td>
                    <td className="p-3 text-[#dbdee1]">NLTK Preprocessor, Porter Stemmer, WordNet Lemmatizer, TF-IDF</td>
                    <td className="p-3 text-[#949ba4]">Tokenization, normalization, vocabulary weighting, keyword ranking</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Named Entity Recognition & Topics</td>
                    <td className="p-3 text-[#dbdee1]">spaCy NER, Gaming Gazetteers, Wikidata Linking, NMF Clustering</td>
                    <td className="p-3 text-[#949ba4]">Entity frequency breakdown, knowledge base entity links, temporal topic trends</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Sentiment Analysis</td>
                    <td className="p-3 text-[#dbdee1]">Logistic Regression + TF-IDF with train-test evaluation</td>
                    <td className="p-3 text-[#949ba4]">Positive/Negative/Neutral classification, confidence scores, confusion matrix</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Social Media Mining</td>
                    <td className="p-3 text-[#dbdee1]">NetworkX, Degree & Betweenness Centrality, Modularity Communities</td>
                    <td className="p-3 text-[#949ba4]">Interactive user interaction graph, bridge gatekeeper analysis, homophily</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Recommendation Systems</td>
                    <td className="p-3 text-[#dbdee1]">Content-Based Filtering, TF-IDF Cosine Similarity, Sentiment Boosting</td>
                    <td className="p-3 text-[#949ba4]">Personalized game recommendation cards with explanation rationale</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Web Analytics</td>
                    <td className="p-3 text-[#dbdee1]">Telemetry event pipelines, two-sample Z-test hypothesis testing</td>
                    <td className="p-3 text-[#949ba4]">HTML metadata guide, A/B testing simulation with P-values and 95% CI</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">MLOps & Drift Monitoring</td>
                    <td className="p-3 text-[#dbdee1]">Population Stability Index (PSI), Vocabulary drift, SQLite Feedback</td>
                    <td className="p-3 text-[#949ba4]">Baseline vs recent distribution shift, user prediction correction logging</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#35373c] bg-[#1e1f22] flex justify-end">
          <button onClick={onClose} className="discord-btn-primary text-xs py-1.5 px-4">
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
}
