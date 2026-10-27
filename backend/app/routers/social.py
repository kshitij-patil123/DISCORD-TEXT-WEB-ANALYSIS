from fastapi import APIRouter
from app.data_manager import dataset_manager
from app.social_network.network_analyzer import network_analyzer

router = APIRouter(prefix="/network", tags=["Social Network Analysis"])

@router.get("")
def get_social_network():
    """
    Constructs and returns the Discord community interaction graph.
    Computes degree centrality, betweenness centrality, community clusters,
    and 2D coordinates for interactive network graph rendering.
    """
    df = dataset_manager.get_dataframe()
    messages = df.to_dict(orient="records") if not df.empty else []
    return network_analyzer.analyze_network(messages)
