import re
from typing import List, Dict, Any, Tuple
from collections import Counter
import networkx as nx
from networkx.algorithms import community

class SocialNetworkAnalyzer:
    """
    Constructs and analyzes community graphs using NetworkX from message replies
    and user mentions. Computes centralities, detects community clusters,
    and formats graph topologies for web rendering.
    """

    def analyze_network(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Builds a directed graph G=(V, E) where nodes are pseudonymous users
        and edges represent reply-to or @mention interactions.
        """
        if not messages:
            return {"nodes": [], "edges": [], "metrics": {}}

        # Create directed graph
        G = nx.DiGraph()
        user_msg_map = {m["message_id"]: m["user_id"] for m in messages if "message_id" in m and "user_id" in m}
        channel_counts = Counter()
        user_activity = Counter()

        # Add nodes and track activity
        for m in messages:
            u = m.get("user_id")
            ch = m.get("channel", "#general")
            if u:
                G.add_node(u)
                user_activity[u] += 1
                channel_counts[ch] += 1

        # Extract edges from reply_to
        for m in messages:
            src = m.get("user_id")
            rep_id = m.get("reply_to")
            if rep_id and rep_id in user_msg_map:
                target = user_msg_map[rep_id]
                if src and target and src != target:
                    if G.has_edge(src, target):
                        G[src][target]["weight"] += 1
                    else:
                        G.add_edge(src, target, weight=1, type="reply")

            # Extract edges from @mentions
            text = m.get("message", "")
            mentions = re.findall(r"@([a-zA-Z0-9_]+)", text)
            for target_mention in mentions:
                if target_mention in user_activity and target_mention != src:
                    if G.has_edge(src, target_mention):
                        G[src][target_mention]["weight"] += 1
                    else:
                        G.add_edge(src, target_mention, weight=1, type="mention")

        # Convert to undirected for community clustering and betweenness
        G_undirected = G.to_undirected()

        # Centrality metrics
        deg_centrality = nx.degree_centrality(G)
        betweenness = nx.betweenness_centrality(G_undirected)
        pagerank = nx.pagerank(G, weight="weight") if len(G) > 0 else {}

        # Community detection (Greedy Modularity)
        try:
            communities_gen = community.greedy_modularity_communities(G_undirected)
            community_map = {}
            for comm_id, members in enumerate(communities_gen):
                for member in members:
                    community_map[member] = comm_id
        except Exception:
            community_map = {n: 0 for n in G.nodes()}

        # 2D Layout coordinates for visualization (spring layout)
        layout = nx.spring_layout(G_undirected, seed=42, k=0.45) if len(G) > 0 else {}

        # Format nodes for frontend visualization
        nodes_out = []
        for node in G.nodes():
            pos = layout.get(node, [0.0, 0.0])
            nodes_out.append({
                "id": node,
                "label": node,
                "degree": G.degree(node),
                "in_degree": G.in_degree(node) if hasattr(G, "in_degree") else 0,
                "out_degree": G.out_degree(node) if hasattr(G, "out_degree") else 0,
                "degree_centrality": round(deg_centrality.get(node, 0.0), 4),
                "betweenness_centrality": round(betweenness.get(node, 0.0), 4),
                "pagerank": round(pagerank.get(node, 0.0), 4),
                "community": community_map.get(node, 0),
                "messages_sent": user_activity.get(node, 0),
                # Scale coordinates to 0 - 600 box for canvas/SVG
                "x": round((float(pos[0]) + 1.0) * 280 + 40, 1),
                "y": round((float(pos[1]) + 1.0) * 200 + 40, 1)
            })

        # Format edges
        edges_out = []
        for u, v, data in G.edges(data=True):
            edges_out.append({
                "source": u,
                "target": v,
                "weight": data.get("weight", 1),
                "type": data.get("type", "reply")
            })

        # Top influencers / participants
        top_connected = sorted(nodes_out, key=lambda n: n["degree"], reverse=True)[:8]
        top_brokers = sorted(nodes_out, key=lambda n: n["betweenness_centrality"], reverse=True)[:8]

        return {
            "network_stats": {
                "total_nodes": G.number_of_nodes(),
                "total_edges": G.number_of_edges(),
                "density": round(nx.density(G), 4),
                "number_of_communities": len(set(community_map.values())),
                "is_strongly_connected": nx.is_strongly_connected(G) if len(G) > 0 else False
            },
            "nodes": nodes_out,
            "edges": edges_out,
            "top_connected": top_connected,
            "top_brokers": top_brokers,
            "channel_activity": [{"channel": ch, "count": c} for ch, c in channel_counts.most_common()],
            "syllabus_concepts": {
                "degree_centrality": "Number of direct conversational links a user holds. High degree nodes are primary discussion drivers.",
                "betweenness_centrality": "Frequency with which a user falls on the shortest path between other participants. High betweenness users act as informational bridges or gatekeepers between different gaming cliques.",
                "homophily": "The tendency of individuals to associate and bond with similar others ('birds of a feather'). In Discord, evident in specialized game channels like #valorant-lfg.",
                "influence_vs_interaction": "A critical academic distinction: High message counts (interaction frequency) does not necessarily imply persuasion or opinion leadership (true social influence)."
            }
        }

network_analyzer = SocialNetworkAnalyzer()
