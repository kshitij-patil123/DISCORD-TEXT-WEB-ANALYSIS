from fastapi import APIRouter
from app.schemas import ABTestRequest
from app.web_analytics.ab_testing import web_analytics_service
from app.data_manager import dataset_manager

router = APIRouter(prefix="/web-analytics", tags=["Web Analytics"])

@router.get("/overview")
def get_web_analytics_overview():
    """
    Returns syllabus reference material for HTML tags, document metadata,
    and client telemetry tracking pipelines.
    """
    df = dataset_manager.get_dataframe()
    guide = web_analytics_service.get_html_metadata_guide()

    # Engagement metrics computed from active dataset
    total_msgs = len(df)
    unique_users = int(df["user_id"].nunique()) if not df.empty else 1
    channels_count = int(df["channel"].nunique()) if not df.empty else 1

    engagement_metrics = {
        "dataset_total_events": total_msgs,
        "unique_active_profiles": unique_users,
        "events_per_user_average": round(total_msgs / max(1, unique_users), 2),
        "channel_distribution_entropy": round(total_msgs / max(1, channels_count), 2),
        "data_collection_type": "Event-Driven Log Ingestion via Web Application"
    }

    return {
        "html_and_metadata_syllabus": guide,
        "dataset_engagement_metrics": engagement_metrics
    }

@router.post("/ab-test")
def run_ab_test_simulation(req: ABTestRequest):
    """
    Executes a simulated A/B testing experiment comparing two UI variations.
    Performs rigorous two-sample statistical hypothesis testing with P-values
    and 95% confidence intervals.
    """
    return web_analytics_service.simulate_ab_test(
        variant_a_name=req.variant_a_name,
        variant_b_name=req.variant_b_name,
        metric_name=req.metric_name,
        sample_size=req.sample_size,
        baseline_rate=req.baseline_conversion,
        expected_lift=req.expected_lift
    )
