from typing import List, Dict, Any
import numpy as np
import scipy.stats as stats

class WebAnalyticsService:
    """
    Demonstrates Web Analytics syllabus concepts:
    - HTML Structure & Metadata specifications
    - Digital data collection pipelines & event tracking
    - Statistical A/B Testing simulation with two-sample hypothesis testing
    """

    def get_html_metadata_guide(self) -> Dict[str, Any]:
        """Educational documentation for HTML structure, metadata, and web beacons."""
        return {
            "title": "HTML Tags & Web Analytics Metadata Foundations",
            "semantic_tags": [
                {
                    "tag": "<head>",
                    "purpose": "Contains machine-readable document metadata, resource links, and tracking scripts.",
                    "analytics_role": "Houses Google Tag Manager, Open Graph meta tags, and favicon links."
                },
                {
                    "tag": "<meta name='viewport'>",
                    "purpose": "Controls responsive layout scaling across mobile and desktop devices.",
                    "analytics_role": "Affects viewport dimension reporting in analytics suites."
                },
                {
                    "tag": "<meta property='og:*'>",
                    "purpose": "OpenGraph protocol metadata for social media scrapers (Discord, Twitter/X, Facebook).",
                    "analytics_role": "Drives rich embed card generation when Discord links are unfurled."
                },
                {
                    "tag": "<script async>",
                    "purpose": "Loads asynchronous client telemetry scripts without blocking DOM parsing.",
                    "analytics_role": "Captures first-party event listeners, mouse heatmaps, and pageviews."
                }
            ],
            "data_collection_pipeline": [
                {"stage": "1. Client Trigger", "detail": "User clicks, scrolls, or renders a component in the React SPA."},
                {"stage": "2. Beacon Dispatch", "detail": "Navigator.sendBeacon() or fetch() transmits JSON payload with UTM query parameters."},
                {"stage": "3. Ingestion & Validation", "detail": "FastAPI gateway validates schema, user agent, and timestamp."},
                {"stage": "4. Storage & Aggregation", "detail": "Session data is written to SQLite / Data Warehouse for cohort analysis."}
            ]
        }

    def simulate_ab_test(
        self,
        variant_a_name: str = "Dark Minimalist Theme",
        variant_b_name: str = "Discord Blurple Accent Theme",
        metric_name: str = "Card Interaction Rate",
        sample_size: int = 600,
        baseline_rate: float = 0.14,
        expected_lift: float = 0.05
    ) -> Dict[str, Any]:
        """
        Simulates an A/B test experiment comparing two UI variations.
        Applies a two-sample z-test for proportions, calculating:
        - Conversions & sample rates
        - Absolute & relative lift
        - Two-tailed Z-score and P-value
        - 95% Confidence Interval for the difference in proportions
        - Academic hypothesis interpretation (H0 vs H1)
        """
        np.random.seed(int(sample_size + baseline_rate * 100))

        # Generate binomial outcomes for Variant A and B
        n_a = sample_size
        n_b = sample_size
        p_a_true = baseline_rate
        p_b_true = min(0.95, baseline_rate + expected_lift)

        successes_a = int(np.random.binomial(n_a, p_a_true))
        successes_b = int(np.random.binomial(n_b, p_b_true))

        p_a_obs = successes_a / n_a
        p_b_obs = successes_b / n_b

        # Difference in proportions
        diff = p_b_obs - p_a_obs
        relative_lift = ((p_b_obs - p_a_obs) / p_a_obs) * 100 if p_a_obs > 0 else 0.0

        # Pooled proportion for hypothesis testing under H0 (p_a = p_b)
        p_pooled = (successes_a + successes_b) / (n_a + n_b)
        se_pooled = np.sqrt(p_pooled * (1 - p_pooled) * (1 / n_a + 1 / n_b))

        # Standard error for confidence interval (unpooled)
        se_diff = np.sqrt((p_a_obs * (1 - p_a_obs) / n_a) + (p_b_obs * (1 - p_b_obs) / n_b))

        z_score = diff / se_pooled if se_pooled > 0 else 0.0
        # Two-tailed p-value
        p_value = float(2 * (1 - stats.norm.cdf(abs(z_score))))

        # 95% Confidence Interval (Z_crit = 1.96)
        ci_margin = 1.96 * se_diff
        ci_lower = diff - ci_margin
        ci_upper = diff + ci_margin

        is_significant = p_value < 0.05

        interpretation = (
            f"Statistically Significant (p = {round(p_value, 4)} < 0.05). "
            f"We reject the null hypothesis H0. Variant '{variant_b_name}' showed a "
            f"{round(relative_lift, 1)}% relative lift over Variant '{variant_a_name}'."
            if is_significant
            else f"Not Statistically Significant (p = {round(p_value, 4)} >= 0.05). "
            f"We fail to reject the null hypothesis H0. The observed difference could be due to random variation."
        )

        return {
            "is_simulation": True,
            "simulation_notice": "This experiment is an algorithmic simulation demonstrating statistical hypothesis testing on UI variants.",
            "experiment_setup": {
                "variant_a_name": variant_a_name,
                "variant_b_name": variant_b_name,
                "metric_name": metric_name,
                "sample_size_per_variant": sample_size,
                "total_participants": n_a + n_b
            },
            "variant_a_results": {
                "name": variant_a_name,
                "sample_size": n_a,
                "conversions": successes_a,
                "conversion_rate": round(p_a_obs * 100, 2),
                "conversion_rate_decimal": round(p_a_obs, 4)
            },
            "variant_b_results": {
                "name": variant_b_name,
                "sample_size": n_b,
                "conversions": successes_b,
                "conversion_rate": round(p_b_obs * 100, 2),
                "conversion_rate_decimal": round(p_b_obs, 4)
            },
            "statistical_metrics": {
                "absolute_difference": round(diff * 100, 2),
                "relative_lift_percent": round(relative_lift, 2),
                "z_score": round(float(z_score), 4),
                "p_value": round(float(p_value), 4),
                "alpha_threshold": 0.05,
                "is_statistically_significant": is_significant,
                "confidence_interval_95": {
                    "lower_bound_percent": round(ci_lower * 100, 2),
                    "upper_bound_percent": round(ci_upper * 100, 2)
                }
            },
            "academic_interpretation": interpretation
        }

web_analytics_service = WebAnalyticsService()
