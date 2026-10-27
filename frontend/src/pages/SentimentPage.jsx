import React, { useState, useEffect } from 'react';
import {
  Smile,
  Frown,
  Meh,
  Send,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  BarChart2,
  PieChart as PieIcon,
  Gamepad,
  Hash,
  Calendar
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

export default function SentimentPage() {
  const [distData, setDistData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prediction Form State
  const [inputMessage, setInputMessage] = useState(
    "That last clutch on Ascent was insane! Jett diff completely carried us gg wp 🔥"
  );
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    fetchData();
    handlePredict(inputMessage);
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [distRes, metricsRes] = await Promise.all([
        api.getSentimentDistribution(),
        api.getModelMetrics()
      ]);
      setDistData(distRes);
      setModelMetrics(metricsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePredict(textToPredict) {
    if (!textToPredict.trim()) return;
    try {
      setPredicting(true);
      const res = await api.predictSentiment(textToPredict);
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading sentiment distributions and model evaluation metrics..." />;

  const byGame = distData?.by_game || [];
  const byChannel = distData?.by_channel || [];
  const byDate = distData?.by_date || [];
  const evalSummary = modelMetrics?.evaluation_summary || {};
  const cm = modelMetrics?.confusion_matrix || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Smile size={18} className="text-[#5865F2]" />
          Supervised Sentiment Analysis & Prediction Console
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Classifies community messages into Positive, Negative, or Neutral sentiment using TF-IDF and Logistic Regression with class-weight balancing.
        </p>
      </div>

      {/* Interactive Predictor Form */}
      <div className="discord-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Send size={16} className="text-[#57F287]" />
          Live Discord Message Sentiment Analyzer
        </h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type or paste a Discord message (including gamer slang, emojis, or game titles)..."
            className="discord-input flex-1 text-xs"
          />
          <button
            onClick={() => handlePredict(inputMessage)}
            disabled={predicting}
            className="discord-btn-primary text-xs py-2 px-4 shrink-0"
          >
            {predicting ? 'Classifying...' : 'Predict Sentiment'}
          </button>
        </div>

        {/* Prediction Result Display */}
        {prediction && (
          <div className="p-4 bg-[#1e1f22] rounded-xl border border-[#35373c] space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#35373c] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#949ba4]">Predicted Sentiment:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    prediction.sentiment === 'positive'
                      ? 'bg-[#57F287]/20 text-[#57F287] border border-[#57F287]/40'
                      : prediction.sentiment === 'negative'
                      ? 'bg-[#ED4245]/20 text-[#ED4245] border border-[#ED4245]/40'
                      : 'bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/40'
                  }`}
                >
                  {prediction.sentiment}
                </span>
                <span className="text-xs text-[#dbdee1]">
                  Confidence: <strong className="text-white">{Math.round(prediction.confidence * 100)}%</strong>
                </span>
              </div>

              {prediction.slang_detected?.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-[#EB459E]">
                  <span className="font-semibold">Gamer Slang Recognized:</span>
                  {prediction.slang_detected.map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-[#EB459E]/10 font-mono text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Probability Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(prediction.probabilities || {}).map(([label, prob]) => {
                const color = label === 'positive' ? '#57F287' : label === 'negative' ? '#ED4245' : '#5865F2';
                return (
                  <div key={label} className="p-2.5 bg-[#2b2d31] rounded-lg border border-[#35373c]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="capitalize font-medium text-white">{label}</span>
                      <span className="font-mono text-[#949ba4]">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#1e1f22] h-2 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${prob * 100}%`, backgroundColor: color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contributing Tokens / Local Explanation */}
            {prediction.explanation?.contributions?.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-[#949ba4]">Token Attribution Weights (Local Feature Contributions):</span>
                <div className="flex flex-wrap gap-2">
                  {prediction.explanation.contributions.map((c, i) => (
                    <span
                      key={i}
                      className={`text-[11px] px-2 py-0.5 rounded font-mono border ${
                        c.contribution > 0
                          ? 'bg-[#57F287]/10 text-[#57F287] border-[#57F287]/30'
                          : 'bg-[#ED4245]/10 text-[#ED4245] border-[#ED4245]/30'
                      }`}
                    >
                      {c.term}: {c.contribution > 0 ? `+${c.contribution}` : c.contribution}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Known Limitations Note */}
            <div className="p-3 bg-[#2b2d31] rounded-lg border border-[#35373c] text-xs text-[#949ba4] space-y-1">
              <span className="font-bold text-[#FEE75C] flex items-center gap-1.5">
                <AlertTriangle size={14} />
                Known Domain Limitations & Challenges
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                <li><strong>Sarcasm & Banter:</strong> Statements like "Oh wonderful, another 200 ping lobby!" contain positive tokens ('wonderful') but convey frustration.</li>
                <li><strong>Gamer Abbreviations:</strong> Expressions such as 'diff', 'inting', or 'smurf' require domain-specific training or lexicon mapping.</li>
                <li><strong>Short Messages:</strong> Messages under 3 words carry minimal context for linear bags-of-words.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Sentiment Breakdown by Game & by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment by Game */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gamepad size={16} className="text-[#5865F2]" />
              Sentiment Distribution Across Games
            </h3>
            <p className="text-xs text-[#949ba4]">Positive, neutral, and negative sentiment counts for top discussed titles</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byGame}>
                <XAxis dataKey="game" stroke="#949ba4" fontSize={10} tickLine={false} interval={0} angle={-25} textAnchor="end" height={45} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Legend formatter={(val) => <span className="text-xs text-[#dbdee1] capitalize">{val}</span>} />
                <Bar dataKey="positive" stackId="a" fill="#57F287" />
                <Bar dataKey="neutral" stackId="a" fill="#5865F2" />
                <Bar dataKey="negative" stackId="a" fill="#ED4245" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment by Channel */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Hash size={16} className="text-[#57F287]" />
              Sentiment Distribution Across Discord Channels
            </h3>
            <p className="text-xs text-[#949ba4]">Sentiment comparison between gaming, dev, and community channels</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byChannel}>
                <XAxis dataKey="channel" stroke="#949ba4" fontSize={10} tickLine={false} interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Legend formatter={(val) => <span className="text-xs text-[#dbdee1] capitalize">{val}</span>} />
                <Bar dataKey="positive" stackId="a" fill="#57F287" />
                <Bar dataKey="neutral" stackId="a" fill="#5865F2" />
                <Bar dataKey="negative" stackId="a" fill="#ED4245" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Evaluation Metrics on Held-Out Test Data */}
      <div className="discord-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#35373c] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle size={16} className="text-[#57F287]" />
              Model Performance on Held-Out Test Data (25% Split)
            </h3>
            <p className="text-xs text-[#949ba4]">
              Strictly measured on unobserved test samples (N = {evalSummary.test_sample_size || 50}). No training data leakage.
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-[#57F287]/20 text-[#57F287] font-bold">
            Verified Evaluation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Test Accuracy</span>
            <p className="text-xl font-bold text-[#57F287] mt-1">{((evalSummary.accuracy || 0) * 100).toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Weighted Precision</span>
            <p className="text-xl font-bold text-[#5865F2] mt-1">{((evalSummary.weighted_precision || 0) * 100).toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Weighted Recall</span>
            <p className="text-xl font-bold text-[#FEE75C] mt-1">{((evalSummary.weighted_recall || 0) * 100).toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Weighted F1-Score</span>
            <p className="text-xl font-bold text-[#EB459E] mt-1">{((evalSummary.weighted_f1 || 0) * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Confusion Matrix (Actual Rows vs Predicted Columns)
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-[#35373c] rounded-lg">
              <thead className="bg-[#1e1f22] text-[#949ba4] uppercase">
                <tr>
                  <th className="p-2 border-r border-[#35373c]">Actual \ Predicted</th>
                  <th className="p-2 text-[#ED4245]">Pred Negative</th>
                  <th className="p-2 text-[#5865F2]">Pred Neutral</th>
                  <th className="p-2 text-[#57F287]">Pred Positive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35373c]">
                {cm.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 bg-[#1e1f22] font-semibold text-white capitalize border-r border-[#35373c]">
                      Actual {row.actual}
                    </td>
                    <td className={`p-2 font-mono font-bold ${row.actual === 'negative' ? 'bg-[#57F287]/10 text-[#57F287]' : 'text-[#dbdee1]'}`}>
                      {row.pred_negative ?? 0}
                    </td>
                    <td className={`p-2 font-mono font-bold ${row.actual === 'neutral' ? 'bg-[#57F287]/10 text-[#57F287]' : 'text-[#dbdee1]'}`}>
                      {row.pred_neutral ?? 0}
                    </td>
                    <td className={`p-2 font-mono font-bold ${row.actual === 'positive' ? 'bg-[#57F287]/10 text-[#57F287]' : 'text-[#dbdee1]'}`}>
                      {row.pred_positive ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
