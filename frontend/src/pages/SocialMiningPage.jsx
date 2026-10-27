import React, { useState, useEffect } from 'react';
import {
  Share2,
  Users,
  GitBranch,
  ShieldAlert,
  Info,
  Award,
  BookOpen,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const COMMUNITY_COLORS = [
  '#5865F2', // Blurple
  '#57F287', // Green
  '#FEE75C', // Yellow
  '#EB459E', // Fuchsia
  '#ED4245', // Red
  '#9B59B6', // Purple
  '#1ABC9C'  // Teal
];

export default function SocialMiningPage() {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    fetchNetwork();
  }, []);

  async function fetchNetwork() {
    try {
      setLoading(true);
      const res = await api.getNetwork();
      setNetworkData(res);
      if (res?.nodes?.length > 0) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Building NetworkX graph topology and computing centrality metrics..." />;

  const nodes = networkData?.nodes || [];
  const edges = networkData?.edges || [];
  const stats = networkData?.network_stats || {};
  const topConnected = networkData?.top_connected || [];
  const topBrokers = networkData?.top_brokers || [];
  const concepts = networkData?.syllabus_concepts || {};

  // Build node lookup map for quick edge rendering
  const nodeMap = {};
  nodes.forEach((n) => {
    nodeMap[n.id] = n;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Share2 size={18} className="text-[#5865F2]" />
          Social Media Mining & Community Network Analysis (NetworkX)
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Discovers participant relationships, conversational hubs, informational bridges, and community clusters from message replies and mentions. All user IDs are strictly pseudonymized.
        </p>
      </div>

      {/* Network Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Total Network Participants (Nodes)</span>
          <p className="text-2xl font-bold text-white mt-1">{stats.total_nodes || nodes.length}</p>
        </div>
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Interaction Links (Edges)</span>
          <p className="text-2xl font-bold text-[#5865F2] mt-1">{stats.total_edges || edges.length}</p>
        </div>
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Graph Density</span>
          <p className="text-2xl font-bold text-[#57F287] mt-1">{stats.density || 0}</p>
        </div>
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Modularity Communities</span>
          <p className="text-2xl font-bold text-[#EB459E] mt-1">{stats.number_of_communities || 1}</p>
        </div>
      </div>

      {/* Interactive Network Graph Visualization */}
      <div className="discord-card p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch size={16} className="text-[#5865F2]" />
              Interactive Community Interaction Graph
            </h3>
            <p className="text-xs text-[#949ba4]">
              Layout computed via NetworkX Fruchterman-Reingold spring algorithm. Click any node to inspect profile.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#949ba4]">Clusters:</span>
            {COMMUNITY_COLORS.slice(0, stats.number_of_communities || 3).map((c, i) => (
              <span key={i} className="flex items-center gap-1 text-[11px] text-[#dbdee1]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }}></span>
                Group {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* SVG Graph Container */}
        <div className="w-full bg-[#1e1f22] rounded-xl border border-[#35373c] p-2 overflow-hidden flex items-center justify-center relative">
          <svg viewBox="0 0 680 500" className="w-full max-h-[480px] select-none">
            {/* Edges */}
            <g stroke="#35373c" strokeWidth="1.5" strokeOpacity="0.6">
              {edges.map((edge, idx) => {
                const src = nodeMap[edge.source];
                const tgt = nodeMap[edge.target];
                if (!src || !tgt) return null;
                const isHighlighted =
                  selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

                return (
                  <line
                    key={idx}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isHighlighted ? '#5865F2' : '#35373c'}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeOpacity={isHighlighted ? 0.9 : 0.4}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;
                const color = COMMUNITY_COLORS[node.community % COMMUNITY_COLORS.length];
                const radius = Math.max(12, Math.min(26, 12 + node.degree * 1.5));

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer transition-transform"
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Pulsing ring on selected */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 6}
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={color}
                      stroke={isSelected ? '#ffffff' : '#1e1f22'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="hover:opacity-90 transition"
                    />

                    {/* Label */}
                    <text
                      cx={node.x}
                      cy={node.y + radius + 12}
                      textAnchor="middle"
                      fill="#dbdee1"
                      fontSize="9"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Node Detail Floating Card */}
          {selectedNode && (
            <div className="absolute bottom-4 right-4 p-4 bg-[#2b2d31]/95 backdrop-blur-md rounded-xl border border-[#35373c] shadow-2xl max-w-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#35373c] pb-2">
                <span className="font-bold text-white font-mono">{selectedNode.id}</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: COMMUNITY_COLORS[selectedNode.community % COMMUNITY_COLORS.length] }}
                >
                  Cluster #{selectedNode.community + 1}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#949ba4]">Degree:</span>
                  <p className="font-bold text-white">{selectedNode.degree} links</p>
                </div>
                <div>
                  <span className="text-[#949ba4]">Messages:</span>
                  <p className="font-bold text-white">{selectedNode.messages_sent}</p>
                </div>
                <div>
                  <span className="text-[#949ba4]">Degree Centrality:</span>
                  <p className="font-bold text-[#57F287] font-mono">{selectedNode.degree_centrality}</p>
                </div>
                <div>
                  <span className="text-[#949ba4]">Betweenness:</span>
                  <p className="font-bold text-[#FEE75C] font-mono">{selectedNode.betweenness_centrality}</p>
                </div>
              </div>
              <p className="text-[10px] text-[#949ba4] italic pt-1 border-t border-[#35373c]">
                Click another participant to inspect their network position.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Centrality Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Connected Users (Degree Centrality) */}
        <div className="discord-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users size={16} className="text-[#5865F2]" />
                Primary Discussion Hubs (Degree Centrality)
              </h3>
              <p className="text-xs text-[#949ba4]">Participants with the highest number of direct conversational ties</p>
            </div>
          </div>

          <div className="space-y-2">
            {topConnected.map((user, idx) => (
              <div
                key={user.id}
                onClick={() => setSelectedNode(user)}
                className={`p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] flex items-center justify-between cursor-pointer hover:border-[#5865F2] transition ${selectedNode?.id === user.id ? 'border-[#5865F2]' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-[#949ba4]">#{idx + 1}</span>
                  <span className="text-xs font-bold font-mono text-white">{user.id}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#949ba4]">{user.degree} connections</span>
                  <span className="font-mono text-[#5865F2] font-semibold">{user.degree_centrality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informational Gatekeepers (Betweenness Centrality) */}
        <div className="discord-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award size={16} className="text-[#FEE75C]" />
                Information Bridges (Betweenness Centrality)
              </h3>
              <p className="text-xs text-[#949ba4]">Participants bridging disparate conversational cliques and channels</p>
            </div>
          </div>

          <div className="space-y-2">
            {topBrokers.map((user, idx) => (
              <div
                key={user.id}
                onClick={() => setSelectedNode(user)}
                className={`p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] flex items-center justify-between cursor-pointer hover:border-[#FEE75C] transition ${selectedNode?.id === user.id ? 'border-[#FEE75C]' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-[#949ba4]">#{idx + 1}</span>
                  <span className="text-xs font-bold font-mono text-white">{user.id}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#949ba4]">Cluster #{user.community + 1}</span>
                  <span className="font-mono text-[#FEE75C] font-semibold">{user.betweenness_centrality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: College Syllabus Academic Concepts */}
      <div className="discord-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen size={16} className="text-[#EB459E]" />
          Social Media Mining Theoretical Concepts (Viva Reference)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {Object.entries(concepts).map(([key, desc]) => (
            <div key={key} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] text-xs space-y-1">
              <span className="font-bold text-[#57F287] capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <p className="text-[#dbdee1] text-[11px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
