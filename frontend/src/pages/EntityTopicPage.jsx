import React, { useState, useEffect } from 'react';
import {
  Tag,
  ExternalLink,
  Flame,
  Gamepad,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const TOPIC_COLORS = ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245'];

export default function EntityTopicPage() {
  const [entitiesData, setEntitiesData] = useState(null);
  const [topicsData, setTopicsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [entRes, topRes] = await Promise.all([
        api.getEntities(),
        api.getTopics()
      ]);
      setEntitiesData(entRes);
      setTopicsData(topRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Extracting spaCy entities and computing NMF topic clusters..." />;

  const topEntities = entitiesData?.top_entities || [];
  const topGames = entitiesData?.top_games || [];
  const labelDist = entitiesData?.label_distribution || {};
  const topicClusters = topicsData?.topic_clusters || [];
  const trendsOverTime = topicsData?.trends_over_time || [];

  const labelChartData = Object.entries(labelDist).map(([label, count]) => ({
    label,
    count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Tag size={18} className="text-[#5865F2]" />
          Named Entity Recognition (NER) & Topic Discovery
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Identifies Gaming Titles, Organizations, and People using spaCy and Gazetteers with Wikidata Entity Linking, alongside unsupervised NMF topic clustering.
        </p>
      </div>

      {/* Row 1: Entity Frequency Chart & Label Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 discord-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gamepad size={16} className="text-[#57F287]" />
                Most Frequent Entities in Discord Conversations
              </h3>
              <p className="text-xs text-[#949ba4]">Detected video game titles, publishers, and gamer influencers</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#1e1f22] text-[#5865F2]">
              spaCy NER + Gazetteer
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEntities.slice(0, 10)}>
                <XAxis dataKey="text" stroke="#949ba4" fontSize={11} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#5865F2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entity Label Types */}
        <div className="discord-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-[#FEE75C]" />
              Entity Category Breakdown
            </h3>
            <p className="text-xs text-[#949ba4] mt-1">Classification across entity types</p>

            <div className="space-y-3 mt-4">
              {labelChartData.map((item) => (
                <div key={item.label} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{item.label}</span>
                    <span className="font-mono text-[#5865F2] font-semibold">{item.count} items</span>
                  </div>
                  <div className="w-full bg-[#2b2d31] h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-[#5865F2] h-full rounded-full"
                      style={{ width: `${Math.min(100, item.count * 4)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#35373c] text-[11px] text-[#949ba4]">
            Total entities recognized: <span className="font-bold text-white">{entitiesData?.total_entities_found || 0}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Wikidata Entity Linking Table */}
      <div className="discord-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ExternalLink size={16} className="text-[#5865F2]" />
              Public Knowledge Base Entity Linking (Wikidata KB)
            </h3>
            <p className="text-xs text-[#949ba4]">
              Resolves surface mentions to canonical knowledge graph entities to disambiguate games and developers
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-[#5865F2]/20 text-[#5865F2] font-bold">
            Wikidata QIDs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
              <tr>
                <th className="p-3">Mention</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Occurrences</th>
                <th className="p-3">Wikidata QID</th>
                <th className="p-3">Canonical Description</th>
                <th className="p-3">Knowledge Graph Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#35373c]">
              {topEntities.filter(e => e.wikidata).map((e, idx) => (
                <tr key={idx} className="hover:bg-[#35373c]/30">
                  <td className="p-3 font-bold text-white">{e.text}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#1e1f22] text-[#5865F2] font-mono text-[10px]">
                      {e.label}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[#57F287]">{e.count}</td>
                  <td className="p-3 font-mono text-[#FEE75C]">{e.wikidata.wikidata_id}</td>
                  <td className="p-3 text-[#dbdee1] max-w-xs truncate">{e.wikidata.description}</td>
                  <td className="p-3">
                    <a
                      href={e.wikidata.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#5865F2] hover:underline flex items-center gap-1"
                    >
                      <span>Wikidata</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Topic Clusters (NMF) & Temporal Topic Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Clusters */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-[#EB459E]" />
              Discovered Topic Clusters (NMF Decomposition)
            </h3>
            <p className="text-xs text-[#949ba4]">Non-negative matrix components representing latent discussion themes</p>
          </div>

          <div className="space-y-3">
            {topicClusters.map((cluster, idx) => (
              <div key={cluster.topic_id} className="p-4 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Theme #{cluster.topic_id}: {cluster.label}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: TOPIC_COLORS[idx % TOPIC_COLORS.length] }}
                  ></span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cluster.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#2b2d31] text-[#dbdee1] font-mono border border-[#35373c]"
                    >
                      {kw} <span className="text-[#949ba4] text-[9px]">({cluster.weights[i]})</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Trends Over Time */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-[#57F287]" />
              Temporal Topic Dynamics (Weekly Trend)
            </h3>
            <p className="text-xs text-[#949ba4]">Prevalence shifts of discussion topics over chronological weeks</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsOverTime}>
                <XAxis dataKey="week" stroke="#949ba4" fontSize={11} tickLine={false} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Legend
                  formatter={(val) => <span className="text-xs text-[#dbdee1]">{val}</span>}
                />
                <Area type="monotone" dataKey="FPS & Esports" stackId="1" stroke="#5865F2" fill="#5865F2" />
                <Area type="monotone" dataKey="RPG & Lore" stackId="1" stroke="#57F287" fill="#57F287" />
                <Area type="monotone" dataKey="Indies & Roguelike" stackId="1" stroke="#FEE75C" fill="#FEE75C" />
                <Area type="monotone" dataKey="Co-op & Survival" stackId="1" stroke="#EB459E" fill="#EB459E" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
