import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sparkles,
  Search,
  Filter,
  Smile,
  Frown,
  Meh,
  Tag,
  Star,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GameRecommenderPage() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(['Tactical Shooter', 'FPS']);
  const [interestText, setInterestText] = useState('competitive ranked multiplayer clutch gunplay');
  const [recommendations, setRecommendations] = useState([]);
  const [engineInfo, setEngineInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);

  useEffect(() => {
    loadGenres();
    fetchRecommendations(selectedGenres, interestText);
  }, []);

  async function loadGenres() {
    try {
      const res = await api.getAvailableGenres();
      setGenres(res.genres || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchRecommendations(selectedG, queryText) {
    try {
      setRecommending(true);
      const res = await api.getRecommendations(selectedG, queryText, 6);
      setRecommendations(res.recommendations || []);
      setEngineInfo(res.recommendation_engine_info || null);
    } catch (err) {
      console.error(err);
    } finally {
      setRecommending(false);
      setLoading(false);
    }
  }

  function toggleGenre(genre) {
    const updated = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    setSelectedGenres(updated);
    fetchRecommendations(updated, interestText);
  }

  if (loading) return <LoadingSpinner message="Calculating TF-IDF game profile embeddings and community sentiment boosts..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Gamepad2 size={18} className="text-[#5865F2]" />
          Personalized Game Recommendation Engine
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Hybrid Content-Based Filtering using TF-IDF cosine similarity across curated game catalogs, augmented with real-time Discord community sentiment signals.
        </p>
      </div>

      {/* User Preferences Form */}
      <div className="discord-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Filter size={16} className="text-[#57F287]" />
          Select Preferred Genres & Free-Text Gameplay Interests
        </h3>

        {/* Genre Chips */}
        <div>
          <label className="text-xs font-semibold text-[#949ba4] uppercase">Preferred Genres</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {genres.map((g) => {
              const isSelected = selectedGenres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    isSelected
                      ? 'bg-[#5865F2] text-white shadow-sm'
                      : 'bg-[#1e1f22] text-[#949ba4] hover:text-[#dbdee1] border border-[#35373c]'
                  }`}
                >
                  {g} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free-text input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#949ba4] uppercase">Gameplay Keywords & Narrative Tone</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={interestText}
              onChange={(e) => setInterestText(e.target.value)}
              placeholder="e.g. fast-paced roguelike with great soundtrack and challenging bosses..."
              className="discord-input flex-1 text-xs"
            />
            <button
              onClick={() => fetchRecommendations(selectedGenres, interestText)}
              disabled={recommending}
              className="discord-btn-primary text-xs py-2 px-4 shrink-0"
            >
              <Sparkles size={14} />
              <span>{recommending ? 'Ranking...' : 'Update Recommendations'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-[#FEE75C]" />
            Top Ranked Game Recommendations ({recommendations.length} results)
          </h3>
          <span className="text-xs text-[#949ba4]">
            Algorithm: <strong className="text-[#57F287]">Cosine Similarity + Sentiment Boost</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => {
            const pct = Math.round(rec.similarity_score * 100);
            return (
              <div
                key={rec.game_id}
                className="discord-card p-5 flex flex-col justify-between border-t-2 border-t-[#5865F2] hover:-translate-y-1 transition"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#5865F2] uppercase">Rank #{idx + 1}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{rec.title}</h4>
                      <p className="text-xs text-[#949ba4]">{rec.developer}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#FEE75C] bg-[#1e1f22] px-2 py-0.5 rounded border border-[#35373c]">
                      <Star size={12} fill="#FEE75C" />
                      {rec.rating}
                    </span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {rec.genres.map((g, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#1e1f22] text-[#dbdee1] border border-[#35373c]">
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#dbdee1] mt-3 leading-relaxed line-clamp-3">
                    {rec.description}
                  </p>
                </div>

                {/* Score & Sentiment Bar */}
                <div className="pt-4 mt-4 border-t border-[#35373c] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#949ba4]">Match Score:</span>
                    <span className="font-mono font-bold text-[#57F287]">{pct}% match</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#1e1f22] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#5865F2] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  {/* Community Sentiment Badge */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#949ba4] text-[11px]">Discord Sentiment:</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        rec.related_sentiment === 'positive'
                          ? 'bg-[#57F287]/20 text-[#57F287]'
                          : rec.related_sentiment === 'negative'
                          ? 'bg-[#ED4245]/20 text-[#ED4245]'
                          : 'bg-[#5865F2]/20 text-[#5865F2]'
                      }`}
                    >
                      {rec.related_sentiment}
                    </span>
                  </div>

                  {/* Explanation Rationale */}
                  <div className="p-2.5 bg-[#1e1f22] rounded-lg border border-[#35373c] text-[11px] text-[#dbdee1] space-y-1">
                    <span className="text-[10px] font-bold text-[#FEE75C] uppercase block">
                      Why Recommended:
                    </span>
                    <p className="leading-tight text-[#949ba4]">{rec.recommendation_reason}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* College Syllabus: Academic RecSys Notes */}
      <div className="discord-card p-5 space-y-2 text-xs text-[#949ba4]">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <HelpCircle size={15} className="text-[#5865F2]" />
          Methodology: Content-Based vs Collaborative Filtering (Syllabus Explanation)
        </h4>
        <p className="leading-relaxed">
          <strong>Content-Based Filtering:</strong> Recommends items by matching user preferences against item feature vectors (TF-IDF bag-of-words of descriptions and metadata). It avoids the cold-start problem for new items and does not require massive user-item interaction matrices.
        </p>
        <p className="leading-relaxed">
          <strong>Collaborative Filtering (Extension):</strong> Predicts user preference by analyzing consensus ratings across peer communities (e.g. matrix factorization, SVD). In the absence of real user purchase histories in chat data, content-based filtering guarantees authentic, non-fabricated recommendations.
        </p>
      </div>
    </div>
  );
}
