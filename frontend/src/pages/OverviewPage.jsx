import React from 'react';
import {
  MessageSquare,
  Users,
  Smile,
  Frown,
  Meh,
  Flame,
  Gamepad,
  TrendingUp,
  Hash,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SENTIMENT_COLORS = {
  positive: '#57F287',
  neutral: '#5865F2',
  negative: '#ED4245',
};

export default function OverviewPage({ data, loading, onRefresh, onNavigate }) {
  if (loading || !data) {
    return <LoadingSpinner message="Calculating dataset statistics and live trends..." />;
  }

  const {
    total_messages = 0,
    active_users = 0,
    sentiment_counts = { positive: 0, negative: 0, neutral: 0 },
    sentiment_percentages = { positive: 0, negative: 0, neutral: 0 },
    most_discussed_topics = [],
    most_mentioned_games = [],
    daily_activity = [],
    weekly_activity = [],
    sentiment_trend = [],
    channel_distribution = [],
    latest_messages = [],
    data_source = 'Demo Mode (Synthetic Discord Dataset)'
  } = data;

  const sentimentPieData = [
    { name: 'Positive', value: sentiment_counts.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: sentiment_counts.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: sentiment_counts.negative, color: SENTIMENT_COLORS.negative },
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Academic Mode Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#2b2d31] via-[#26282c] to-[#1e1f22] border border-[#35373c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5865F2]">Operational Mode</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] font-semibold">
              {data_source}
            </span>
          </div>
          <p className="text-xs text-[#949ba4] mt-1">
            All analytics below are calculated dynamically from the active SQLite database using genuine NLP & statistical pipelines.
          </p>
        </div>
        <button
          onClick={() => onNavigate('text-analytics')}
          className="discord-btn-primary text-xs py-1.5 px-3 shrink-0"
        >
          Explore Text Pipeline →
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Messages"
          value={total_messages.toLocaleString()}
          subtitle="Processed & Stored in SQLite"
          icon={MessageSquare}
          color="blurple"
        />
        <StatCard
          title="Active Users"
          value={active_users.toLocaleString()}
          subtitle="Pseudonymized Profiles"
          icon={Users}
          color="blurple"
        />
        <StatCard
          title="Positive Sentiment"
          value={`${sentiment_percentages.positive}%`}
          subtitle={`${sentiment_counts.positive} community messages`}
          icon={Smile}
          color="green"
        />
        <StatCard
          title="Neutral Sentiment"
          value={`${sentiment_percentages.neutral}%`}
          subtitle={`${sentiment_counts.neutral} community messages`}
          icon={Meh}
          color="blurple"
        />
        <StatCard
          title="Negative Sentiment"
          value={`${sentiment_percentages.negative}%`}
          subtitle={`${sentiment_counts.negative} community messages`}
          icon={Frown}
          color="red"
        />
      </div>

      {/* Charts Row 1: Daily Activity Trend & Sentiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Community Activity */}
        <div className="lg:col-span-2 discord-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-[#5865F2]" />
                Daily Message Velocity & Trend
              </h3>
              <p className="text-xs text-[#949ba4]">Number of messages exchanged over the past 14 days</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#1e1f22] text-[#57F287]">
              Live Calculated
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily_activity}>
                <defs>
                  <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5865F2" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#5865F2" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#949ba4" fontSize={11} tickLine={false} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="messages" stroke="#5865F2" strokeWidth={2} fillOpacity={1} fill="url(#colorMsg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Pie Chart */}
        <div className="discord-card p-5 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smile size={16} className="text-[#57F287]" />
              Sentiment Proportions
            </h3>
            <p className="text-xs text-[#949ba4]">Aggregated classification balance across corpus</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Legend
                  formatter={(val) => <span className="text-xs text-[#dbdee1]">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#35373c] text-center">
            <div>
              <span className="text-[10px] text-[#949ba4] uppercase">Positive</span>
              <p className="text-sm font-bold text-[#57F287]">{sentiment_percentages.positive}%</p>
            </div>
            <div>
              <span className="text-[10px] text-[#949ba4] uppercase">Neutral</span>
              <p className="text-sm font-bold text-[#5865F2]">{sentiment_percentages.neutral}%</p>
            </div>
            <div>
              <span className="text-[10px] text-[#949ba4] uppercase">Negative</span>
              <p className="text-sm font-bold text-[#ED4245]">{sentiment_percentages.negative}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Day-of-Week Breakdown & Channel Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Day Activity */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-[#FEE75C]" />
              Day-of-Week Engagement Cycle
            </h3>
            <p className="text-xs text-[#949ba4]">Community chat volume aggregated by weekday</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly_activity}>
                <XAxis dataKey="day" stroke="#949ba4" fontSize={11} tickLine={false} />
                <YAxis stroke="#949ba4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Bar dataKey="messages" fill="#5865F2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="discord-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Hash size={16} className="text-[#EB459E]" />
              Channel Volume Distribution
            </h3>
            <p className="text-xs text-[#949ba4]">Distribution of messages across Discord channels</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channel_distribution} layout="vertical">
                <XAxis type="number" stroke="#949ba4" fontSize={11} tickLine={false} />
                <YAxis dataKey="channel" type="category" stroke="#949ba4" fontSize={11} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1f22', borderColor: '#35373c', borderRadius: '8px' }}
                />
                <Bar dataKey="messages" fill="#57F287" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Top Topics & Mentioned Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Discussed Topics */}
        <div className="discord-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-[#EB459E]" />
              Discovered Topic Themes (NMF)
            </h3>
            <button
              onClick={() => onNavigate('entities-topics')}
              className="text-xs text-[#5865F2] hover:underline"
            >
              View Clusters →
            </button>
          </div>
          <div className="space-y-2">
            {most_discussed_topics.map((t, idx) => (
              <div key={idx} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white">{t.topic}</span>
                  <p className="text-[11px] text-[#949ba4] font-mono mt-0.5">{t.keywords}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-[#2b2d31] text-[#dbdee1] font-medium">
                  Rank #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Frequently Mentioned Games */}
        <div className="discord-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gamepad size={16} className="text-[#5865F2]" />
              Most Mentioned Games (Entity NER)
            </h3>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs text-[#5865F2] hover:underline"
            >
              RecSys Engine →
            </button>
          </div>
          <div className="space-y-2">
            {most_mentioned_games.map((g, idx) => (
              <div key={idx} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{g.game}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] font-bold">
                  {g.mentions} mentions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Messages Stream */}
      <div className="discord-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Latest Analyzed Messages Stream</h3>
            <p className="text-xs text-[#949ba4]">Recent messages ingested, parsed, and sentiment-tagged</p>
          </div>
          <button
            onClick={() => onNavigate('data-mgmt')}
            className="text-xs text-[#5865F2] hover:underline"
          >
            Manage Data & Uploads →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Message</th>
                <th className="p-3">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#35373c]">
              {latest_messages.map((m) => (
                <tr key={m.message_id} className="hover:bg-[#35373c]/40 transition">
                  <td className="p-3 font-mono text-[#949ba4]">{m.message_id}</td>
                  <td className="p-3 text-[#949ba4] whitespace-nowrap">{m.timestamp}</td>
                  <td className="p-3 font-semibold text-[#5865F2]">{m.user_id}</td>
                  <td className="p-3 text-[#57F287] font-mono">{m.channel}</td>
                  <td className="p-3 text-[#dbdee1] max-w-md truncate">{m.message}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        m.sentiment_label === 'positive'
                          ? 'bg-[#57F287]/20 text-[#57F287]'
                          : m.sentiment_label === 'negative'
                          ? 'bg-[#ED4245]/20 text-[#ED4245]'
                          : 'bg-[#5865F2]/20 text-[#5865F2]'
                      }`}
                    >
                      {m.sentiment_label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
