import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Terminal,
  Layers,
  Code,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TextAnalyticsPage() {
  const [termData, setTermData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Playground state
  const [sampleText, setSampleText] = useState(
    "Yo @user_pixel_fox are we 5-stacking Valorant competitive tonight? That clutch on Ascent was insane, Jett diff completely carried us gg wp! 🔥 Check https://discord.gg/clips"
  );
  const [processedResult, setProcessedResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
    handleProcess(sampleText);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getTermFrequencies();
      setTermData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleProcess(textToProcess) {
    if (!textToProcess.trim()) return;
    try {
      setProcessing(true);
      const res = await api.processText(textToProcess);
      setProcessedResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <LoadingSpinner message="Extracting TF-IDF terms and vocabulary frequencies..." />;

  const topTfidf = termData?.top_tfidf_terms || [];
  const wordFreq = termData?.word_frequencies?.slice(0, 15) || [];
  const embeddingComp = termData?.embedding_comparisons || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="discord-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-[#5865F2]" />
              NLP Preprocessing & Vectorization Pipeline
            </h2>
            <p className="text-xs text-[#949ba4] mt-1">
              Demonstrates Tokenization, Normalization, Lemmatization, Stemming, and TF-IDF feature weights.
            </p>
          </div>
          <a
            href={api.downloadCSVUrl}
            target="_blank"
            rel="noreferrer"
            className="discord-btn-primary text-xs py-1.5 px-3 shrink-0"
          >
            <Download size={14} />
            <span>Download Processed Dataset</span>
          </a>
        </div>
      </div>

      {/* Interactive NLP Pipeline Playground */}
      <div className="discord-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal size={16} className="text-[#57F287]" />
            Live Preprocessing Pipeline Inspector
          </h3>
          <span className="text-xs text-[#949ba4]">Type or paste any Discord gamer text to trace every pipeline stage</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Enter raw Discord message to run through the NLP pipeline..."
            className="discord-input flex-1 text-xs"
          />
          <button
            onClick={() => handleProcess(sampleText)}
            disabled={processing}
            className="discord-btn-primary text-xs py-1.5 px-4 shrink-0"
          >
            {processing ? 'Processing...' : 'Run Pipeline'}
          </button>
        </div>

        {processedResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Stage 1 */}
            <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#5865F2]">Stage 1: Normalization</span>
                <span className="text-[10px] text-[#949ba4]">Cleaned text</span>
              </div>
              <p className="text-xs font-mono text-[#dbdee1] bg-[#111214] p-2 rounded max-h-20 overflow-y-auto">
                {processedResult.cleaned_text || '—'}
              </p>
              <div className="text-[10px] text-[#949ba4] flex items-center gap-1">
                <span>Removed URLs, @mentions, #channels, emojis</span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#57F287]">Stage 2: Tokenization</span>
                <span className="text-[10px] text-[#57F287]">{processedResult.token_count} tokens</span>
              </div>
              <div className="flex flex-wrap gap-1 bg-[#111214] p-2 rounded max-h-20 overflow-y-auto">
                {processedResult.raw_tokens?.map((tok, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#2b2d31] text-[#dbdee1] font-mono">
                    {tok}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[#949ba4]">Splits clean text into discrete tokens</p>
            </div>

            {/* Stage 3 */}
            <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#FEE75C]">Stage 3: Lemmatization</span>
                <span className="text-[10px] text-[#FEE75C]">WordNet</span>
              </div>
              <div className="flex flex-wrap gap-1 bg-[#111214] p-2 rounded max-h-20 overflow-y-auto">
                {processedResult.lemmas?.map((lem, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEE75C]/10 text-[#FEE75C] font-mono">
                    {lem}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[#949ba4]">Reduced to canonical dictionary lemmas</p>
            </div>

            {/* Stage 4 */}
            <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#EB459E]">Stage 4: Slang & Jargon</span>
                <span className="text-[10px] text-[#EB459E]">{processedResult.detected_slang?.length || 0} slang</span>
              </div>
              <div className="space-y-1 bg-[#111214] p-2 rounded max-h-20 overflow-y-auto">
                {processedResult.detected_slang?.length > 0 ? (
                  processedResult.detected_slang.map((s, i) => (
                    <div key={i} className="text-[10px] flex items-center justify-between">
                      <span className="font-bold text-[#EB459E] font-mono">{s.slang}</span>
                      <span className="text-[#949ba4] truncate max-w-[110px]">{s.meaning}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-[#949ba4]">No gaming slang detected in query</span>
                )}
              </div>
              <p className="text-[10px] text-[#949ba4]">Mapped against Discord gaming lexicon</p>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Word Frequency Chart & TF-IDF Terms Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Word Frequencies Chart */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-[#5865F2]" />
              Corpus Word Frequency Distribution
            </h3>
            <p className="text-xs text-[#949ba4]">Top most frequent vocabulary terms across all Discord messages</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wordFreq}>
                <XAxis dataKey="word" stroke="#949ba4" fontSize={10} tickLine={false} interval={0} angle={-30} textAnchor="end" height={50} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Bar dataKey="frequency" fill="#5865F2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top TF-IDF Terms Table */}
        <div className="discord-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#57F287]" />
                TF-IDF Salient Term Weights
              </h3>
              <p className="text-xs text-[#949ba4]">Terms prioritized by Term Frequency × Inverse Document Frequency</p>
            </div>
            <span className="text-xs text-[#57F287] font-mono font-bold">TF × IDF</span>
          </div>

          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1e1f22] text-[#949ba4] sticky top-0 uppercase font-semibold">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Term</th>
                  <th className="p-2">TF-IDF Score</th>
                  <th className="p-2">Relative Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35373c]">
                {topTfidf.map((t, idx) => (
                  <tr key={idx} className="hover:bg-[#35373c]/30">
                    <td className="p-2 font-mono text-[#949ba4]">#{idx + 1}</td>
                    <td className="p-2 font-semibold text-white font-mono">{t.term}</td>
                    <td className="p-2 font-mono text-[#57F287]">{t.tfidf_score}</td>
                    <td className="p-2">
                      <div className="w-full bg-[#1e1f22] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#5865F2] h-full rounded-full"
                          style={{ width: `${Math.min(100, t.importance_percent * 8)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* College Syllabus: Embedding Comparisons */}
      <div className="discord-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen size={16} className="text-[#FEE75C]" />
          Theoretical Comparison: Text Vectorization Paradigms (Viva Reference)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {Object.entries(embeddingComp).map(([key, item]) => (
            <div key={key} className="p-4 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
              <span className="text-xs font-bold text-[#5865F2]">{item.name}</span>
              <p className="text-[11px] text-[#dbdee1] font-semibold">{item.type}</p>
              <div className="text-[11px] space-y-1 text-[#949ba4]">
                <p><span className="text-[#57F287] font-medium">Pros:</span> {item.strengths}</p>
                <p><span className="text-[#ED4245] font-medium">Cons:</span> {item.limitations}</p>
                {item.formula && (
                  <p className="font-mono text-[10px] text-[#FEE75C] pt-1">Formula: {item.formula}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
