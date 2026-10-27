import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Send,
  TrendingDown,
  TrendingUp,
  HelpCircle,
  Clock,
  Flame,
  Archive
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DriftMonitoringPage() {
  const [driftData, setDriftData] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback Submission Form State
  const [feedbackText, setFeedbackText] = useState('Iso shield is so broken it makes ranked unplayable');
  const [predictedSentiment, setPredictedSentiment] = useState('negative');
  const [correctedSentiment, setCorrectedSentiment] = useState('negative');
  const [feedbackNotes, setFeedbackNotes] = useState('Gamer complaint about agent balancing; correctly identified negative.');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [driftRes, fbRes] = await Promise.all([
        api.getDrift(),
        api.getFeedbackList()
      ]);
      setDriftData(driftRes);
      setFeedbackList(fbRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    try {
      setSubmittingFeedback(true);
      const res = await api.submitFeedback({
        message_text: feedbackText,
        predicted_sentiment: predictedSentiment,
        user_corrected_sentiment: correctedSentiment,
        feedback_notes: feedbackNotes,
      });
      setSubmissionStatus(res.message);
      // Refresh feedback list
      const updated = await api.getFeedbackList();
      setFeedbackList(updated || []);
      // Reset form
      setFeedbackNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  }

  if (loading) return <LoadingSpinner message="Calculating Population Stability Index (PSI) and temporal drift..." />;

  const comparison = driftData?.sentiment_distribution_comparison || [];
  const emergingTerms = driftData?.emerging_terms || [];
  const definitions = driftData?.definitions || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-[#5865F2]" />
          Data Drift, Concept Drift & Continuous Feedback Loop
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Tracks longitudinal distribution shifts using Population Stability Index (PSI) and captures human-in-the-loop prediction corrections into SQLite.
        </p>
      </div>

      {/* Drift Severity Alert Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        driftData?.drift_flagged
          ? 'bg-[#FEE75C]/10 border-[#FEE75C]/40 text-[#FEE75C]'
          : 'bg-[#57F287]/10 border-[#57F287]/40 text-[#57F287]'
      }`}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                Drift Status: {driftData?.drift_severity}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1e1f22]">
                PSI = {driftData?.psi_score}
              </span>
            </div>
            <p className="text-xs text-[#dbdee1] mt-1">
              Baseline Window: <strong>{driftData?.baseline_period}</strong> (N = {driftData?.baseline_sample_size}) vs Recent Window: <strong>{driftData?.recent_period}</strong> (N = {driftData?.recent_sample_size})
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1e1f22] text-[#dbdee1] border border-[#35373c] shrink-0">
          {driftData?.drift_flagged ? 'Moderate Covariate Shift' : 'Stable Distribution'}
        </span>
      </div>

      {/* Row 1: Sentiment Shift Comparison Chart & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baseline vs Recent Sentiment Comparison Chart */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#5865F2]" />
              Sentiment Proportions: Baseline vs Recent Window
            </h3>
            <p className="text-xs text-[#949ba4]">Detects shift in positive/neutral/negative label frequencies</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison}>
                <XAxis dataKey="sentiment" stroke="#949ba4" fontSize={11} tickLine={false} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Legend formatter={(val) => <span className="text-xs text-[#dbdee1] capitalize">{val.replace('_', ' ')}</span>} />
                <Bar dataKey="baseline_percent" name="Baseline Period" fill="#5865F2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recent_percent" name="Recent Period" fill="#57F287" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emerging Vocabulary Terms (Data Drift) */}
        <div className="discord-card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-[#EB459E]" />
              Emerging Vocabulary Terms (Input Data Drift)
            </h3>
            <p className="text-xs text-[#949ba4]">Words whose frequency spiked dramatically in recent weeks</p>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {emergingTerms.length > 0 ? (
              emergingTerms.map((t, idx) => (
                <div key={idx} className="p-2.5 bg-[#1e1f22] rounded-lg border border-[#35373c] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-white">{t.term}</span>
                    <span className="text-[#949ba4] text-[10px] ml-2">
                      Recent: {t.recent_count} | Baseline: {t.baseline_count}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#EB459E] bg-[#EB459E]/10 px-2 py-0.5 rounded">
                    +{t.growth_ratio}x growth
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#949ba4] p-4 text-center">No extreme vocabulary divergence detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Human-in-the-Loop Feedback Submission Form */}
      <div className="discord-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#35373c] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-[#57F287]" />
              Human Feedback & Model Auditing Form
            </h3>
            <p className="text-xs text-[#949ba4]">
              Flag misclassified Discord messages to queue them for future model evaluation and retraining
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-[#1e1f22] text-[#949ba4]">
            SQLite Feedback Registry
          </span>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#949ba4] uppercase">Discord Message Content</label>
            <input
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              required
              className="discord-input w-full text-xs mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#949ba4] uppercase">Model Prediction</label>
              <select
                value={predictedSentiment}
                onChange={(e) => setPredictedSentiment(e.target.value)}
                className="discord-input w-full text-xs mt-1 bg-[#1e1f22]"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#949ba4] uppercase">User Corrected Ground Truth</label>
              <select
                value={correctedSentiment}
                onChange={(e) => setCorrectedSentiment(e.target.value)}
                className="discord-input w-full text-xs mt-1 bg-[#1e1f22]"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#949ba4] uppercase">Audit Notes / Rationale</label>
            <input
              type="text"
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. Sarcastic tone with gamer slang misinterpreted by classifier..."
              className="discord-input w-full text-xs mt-1"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {submissionStatus && (
              <span className="text-xs text-[#57F287] flex items-center gap-1">
                <CheckCircle size={14} />
                {submissionStatus}
              </span>
            )}
            <button
              type="submit"
              disabled={submittingFeedback}
              className="discord-btn-primary text-xs py-2 px-5 ml-auto"
            >
              <Send size={14} />
              <span>{submittingFeedback ? 'Persisting...' : 'Record Feedback in SQLite'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Row 3: Recorded Feedback Entries Table */}
      <div className="discord-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Archive size={16} className="text-[#5865F2]" />
            Persisted Feedback Registry ({feedbackList.length} records)
          </h3>
          <span className="text-xs text-[#949ba4]">Offline Retraining Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Message</th>
                <th className="p-3">Predicted</th>
                <th className="p-3">Corrected</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#35373c]">
              {feedbackList.length > 0 ? (
                feedbackList.map((f) => (
                  <tr key={f.id} className="hover:bg-[#35373c]/30">
                    <td className="p-3 font-mono text-[#949ba4]">#{f.id}</td>
                    <td className="p-3 font-medium text-white max-w-xs truncate">{f.message_text}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#ED4245]/20 text-[#ED4245] font-semibold uppercase text-[10px]">
                        {f.predicted_sentiment}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#57F287]/20 text-[#57F287] font-semibold uppercase text-[10px]">
                        {f.user_corrected_sentiment}
                      </span>
                    </td>
                    <td className="p-3 text-[#949ba4] max-w-xs truncate">{f.feedback_notes || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-[#949ba4]">
                    No feedback records yet. Use the form above to flag an incorrect prediction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Syllabus Theoretical Concepts */}
      <div className="discord-card p-5 space-y-2 text-xs text-[#949ba4]">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <HelpCircle size={15} className="text-[#FEE75C]" />
          Data Drift vs Concept Drift vs Model Degradation (Viva Reference)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="font-bold text-[#5865F2] block mb-1">1. Covariate / Data Drift</span>
            <p className="text-[11px] leading-relaxed">{definitions.data_drift}</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="font-bold text-[#EB459E] block mb-1">2. Concept Drift</span>
            <p className="text-[11px] leading-relaxed">{definitions.concept_drift}</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="font-bold text-[#57F287] block mb-1">3. Population Stability Index</span>
            <p className="text-[11px] leading-relaxed">{definitions.psi_formula}</p>
          </div>
        </div>
        <p className="text-[11px] italic text-[#949ba4] pt-2">
          Note: In accordance with academic integrity guidelines, user feedback is queued in SQLite for offline retraining evaluation; automatic blind model retraining is not executed automatically without review.
        </p>
      </div>
    </div>
  );
}
