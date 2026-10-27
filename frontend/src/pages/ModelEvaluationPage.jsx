import React, { useState, useEffect } from 'react';
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sliders,
  Sparkles,
  Info,
  Terminal
} from 'lucide-react';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ModelEvaluationPage() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local instance explanation playground
  const [testMessage, setTestMessage] = useState("Iso shield is so broken it makes ranked unplayable");
  const [instanceExplanation, setInstanceExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    fetchMetrics();
    handleExplain(testMessage);
  }, []);

  async function fetchMetrics() {
    try {
      setLoading(true);
      const res = await api.getModelMetrics();
      setMetricsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExplain(msg) {
    if (!msg.trim()) return;
    try {
      setExplaining(true);
      const res = await api.explainPrediction(msg);
      setInstanceExplanation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setExplaining(false);
    }
  }

  if (loading) return <LoadingSpinner message="Evaluating held-out test metrics and computing slice bias diagnostics..." />;

  const summary = metricsData?.evaluation_summary || {};
  const cm = metricsData?.confusion_matrix || [];
  const clfReport = metricsData?.classification_report || {};
  const globalImportance = metricsData?.global_feature_importance?.feature_weights_by_class || {};
  const biasDiag = metricsData?.bias_diagnostics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Gauge size={18} className="text-[#5865F2]" />
          Model Evaluation, Explainable AI (XAI) & Bias Auditing
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Rigorous performance metrics evaluated on held-out test data (25% split), global & local feature attributions, and slice-based bias auditing across channels, message lengths, and gaming slang.
        </p>
      </div>

      {/* Top Academic Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="discord-card p-4 border-l-4 border-l-[#57F287]">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Accuracy (Held-Out Test)</span>
          <p className="text-2xl font-bold text-[#57F287] mt-1">{((summary.accuracy || 0) * 100).toFixed(1)}%</p>
          <span className="text-[10px] text-[#949ba4]">N = {summary.test_sample_size || 50} test samples</span>
        </div>
        <div className="discord-card p-4 border-l-4 border-l-[#5865F2]">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Weighted Precision</span>
          <p className="text-2xl font-bold text-[#5865F2] mt-1">{((summary.weighted_precision || 0) * 100).toFixed(1)}%</p>
          <span className="text-[10px] text-[#949ba4]">True Positives / Total Positives</span>
        </div>
        <div className="discord-card p-4 border-l-4 border-l-[#FEE75C]">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Weighted Recall</span>
          <p className="text-2xl font-bold text-[#FEE75C] mt-1">{((summary.weighted_recall || 0) * 100).toFixed(1)}%</p>
          <span className="text-[10px] text-[#949ba4]">True Positives / Ground Truth</span>
        </div>
        <div className="discord-card p-4 border-l-4 border-l-[#EB459E]">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Weighted F1-Score</span>
          <p className="text-2xl font-bold text-[#EB459E] mt-1">{((summary.weighted_f1 || 0) * 100).toFixed(1)}%</p>
          <span className="text-[10px] text-[#949ba4]">Harmonic Mean of P & R</span>
        </div>
      </div>

      {/* Row 2: Confusion Matrix & Detailed Classification Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Table */}
        <div className="discord-card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white">Confusion Matrix (Held-Out Test Set)</h3>
            <p className="text-xs text-[#949ba4]">Compares ground truth labels against model predictions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-[#35373c] rounded-lg">
              <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
                <tr>
                  <th className="p-3 border-r border-[#35373c]">Actual \ Predicted</th>
                  <th className="p-3 text-[#ED4245]">Pred Negative</th>
                  <th className="p-3 text-[#5865F2]">Pred Neutral</th>
                  <th className="p-3 text-[#57F287]">Pred Positive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35373c]">
                {cm.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-3 bg-[#1e1f22] font-semibold text-white capitalize border-r border-[#35373c]">
                      Actual {row.actual}
                    </td>
                    <td className={`p-3 font-mono font-bold ${row.actual === 'negative' ? 'bg-[#57F287]/15 text-[#57F287]' : 'text-[#dbdee1]'}`}>
                      {row.pred_negative ?? 0}
                    </td>
                    <td className={`p-3 font-mono font-bold ${row.actual === 'neutral' ? 'bg-[#57F287]/15 text-[#57F287]' : 'text-[#dbdee1]'}`}>
                      {row.pred_neutral ?? 0}
                    </td>
                    <td className={`p-3 font-mono font-bold ${row.actual === 'positive' ? 'bg-[#57F287]/15 text-[#57F287]' : 'text-[#dbdee1]'}`}>
                      {row.pred_positive ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Per-Class Classification Report */}
        <div className="discord-card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white">Detailed Classification Report</h3>
            <p className="text-xs text-[#949ba4]">Precision, recall, and F1-score broken down by class</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
                <tr>
                  <th className="p-3">Class</th>
                  <th className="p-3">Precision</th>
                  <th className="p-3">Recall</th>
                  <th className="p-3">F1-Score</th>
                  <th className="p-3">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35373c]">
                {['positive', 'neutral', 'negative'].map((clsName) => {
                  const rep = clfReport[clsName] || {};
                  return (
                    <tr key={clsName} className="hover:bg-[#35373c]/30">
                      <td className="p-3 font-semibold text-white capitalize">{clsName}</td>
                      <td className="p-3 font-mono text-[#5865F2]">{rep.precision ? (rep.precision * 100).toFixed(1) + '%' : '—'}</td>
                      <td className="p-3 font-mono text-[#57F287]">{rep.recall ? (rep.recall * 100).toFixed(1) + '%' : '—'}</td>
                      <td className="p-3 font-mono text-[#EB459E]">{rep['f1-score'] ? (rep['f1-score'] * 100).toFixed(1) + '%' : '—'}</td>
                      <td className="p-3 font-mono text-[#949ba4]">{rep.support || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Global Feature Importance (Top Positive vs Negative Terms) */}
      <div className="discord-card p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-[#FEE75C]" />
            Global Feature Importance (Linear Surrogate Coefficients)
          </h3>
          <p className="text-xs text-[#949ba4]">
            Model coefficients indicating which vocabulary terms most strongly influence sentiment classification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Positive Terms */}
          <div className="p-4 bg-[#1e1f22] rounded-xl border border-[#35373c] space-y-2">
            <span className="text-xs font-bold text-[#57F287] uppercase flex items-center gap-1.5">
              <span>●</span> Top Positive Predictors
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(globalImportance.top_positive_terms || []).slice(0, 8).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-mono text-white">{t.term}</span>
                  <span className="font-mono text-[#57F287] font-semibold">+{t.weight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Terms */}
          <div className="p-4 bg-[#1e1f22] rounded-xl border border-[#35373c] space-y-2">
            <span className="text-xs font-bold text-[#ED4245] uppercase flex items-center gap-1.5">
              <span>●</span> Top Negative Predictors
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(globalImportance.top_negative_terms || []).slice(0, 8).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-mono text-white">{t.term}</span>
                  <span className="font-mono text-[#ED4245] font-semibold">+{t.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Bias Evaluation Across Data Slices */}
      <div className="discord-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scale size={16} className="text-[#EB459E]" />
            Demographic & Data Slice Bias Evaluation
          </h3>
          <p className="text-xs text-[#949ba4]">
            Audits performance parity across channels, message length tiers, and presence of gamer slang
          </p>
        </div>

        {/* Channel Slice Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#949ba4] uppercase">1. Performance Across Discord Channels</span>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e1f22] text-[#949ba4] uppercase">
                <tr>
                  <th className="p-2.5">Channel Slice</th>
                  <th className="p-2.5">Sample Size</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Positive Prediction Rate</th>
                  <th className="p-2.5">Negative Prediction Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35373c]">
                {(biasDiag.channel_slices || []).map((s, idx) => (
                  <tr key={idx} className="hover:bg-[#35373c]/30">
                    <td className="p-2.5 font-mono text-[#5865F2]">{s.slice_name}</td>
                    <td className="p-2.5 font-mono text-[#949ba4]">{s.sample_size}</td>
                    <td className="p-2.5 font-mono font-bold text-[#57F287]">{(s.accuracy * 100).toFixed(1)}%</td>
                    <td className="p-2.5 font-mono text-[#dbdee1]">{(s.pos_pred_rate * 100).toFixed(1)}%</td>
                    <td className="p-2.5 font-mono text-[#dbdee1]">{(s.neg_pred_rate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Length & Slang Slices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Message Length */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#949ba4] uppercase">2. Message Length Slices</span>
            <div className="space-y-1.5">
              {(biasDiag.length_slices || []).map((s, idx) => (
                <div key={idx} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">{s.slice_name}</span>
                    <p className="text-[10px] text-[#949ba4]">{s.sample_size} records</p>
                  </div>
                  <span className="font-mono font-bold text-[#57F287]">{(s.accuracy * 100).toFixed(1)}% acc</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slang Presence */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#949ba4] uppercase">3. Gaming Slang Slices</span>
            <div className="space-y-1.5">
              {(biasDiag.slang_slices || []).map((s, idx) => (
                <div key={idx} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white">{s.slice_name}</span>
                    <p className="text-[10px] text-[#949ba4]">{s.sample_size} records</p>
                  </div>
                  <span className="font-mono font-bold text-[#5865F2]">{(s.accuracy * 100).toFixed(1)}% acc</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Academic Bias Disclaimer */}
        <div className="p-4 bg-[#ED4245]/10 border border-[#ED4245]/30 rounded-xl text-xs text-[#dbdee1] flex items-start gap-3">
          <AlertTriangle size={18} className="text-[#ED4245] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#ED4245] uppercase">Critical Academic Bias Notice (Viva Requirement)</span>
            <p className="leading-relaxed text-[11px] text-[#949ba4]">
              {biasDiag.critical_disclaimer ||
                "IMPORTANT: Performing a bias evaluation does NOT imply the model is free from bias. Disparities in accuracy across channels or message lengths reflect representation gaps, unbalanced slang tokens, and contextual nuances that require ongoing auditing."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
