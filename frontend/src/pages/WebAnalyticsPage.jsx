import React, { useState, useEffect } from 'react';
import {
  Globe,
  Code,
  Activity,
  Layers,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  Sliders
} from 'lucide-react';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WebAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // A/B test parameters
  const [variantA, setVariantA] = useState('Dark Minimalist Layout');
  const [variantB, setVariantB] = useState('Discord Blurple Accent Layout');
  const [metricName, setMetricName] = useState('Click-Through Rate (CTR)');
  const [sampleSize, setSampleSize] = useState(600);
  const [baselineRate, setBaselineRate] = useState(0.14);
  const [expectedLift, setExpectedLift] = useState(0.04);
  const [abResult, setAbResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadOverview();
    runSimulation();
  }, []);

  async function loadOverview() {
    try {
      setLoading(true);
      const res = await api.getWebAnalyticsOverview();
      setOverview(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function runSimulation() {
    try {
      setSimulating(true);
      const res = await api.runABTest({
        variant_a_name: variantA,
        variant_b_name: variantB,
        metric_name: metricName,
        sample_size: Number(sampleSize),
        baseline_conversion: Number(baselineRate),
        expected_lift: Number(expectedLift)
      });
      setAbResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading Web Analytics syllabus and telemetry data..." />;

  const htmlGuide = overview?.html_and_metadata_syllabus || {};
  const datasetEngagement = overview?.dataset_engagement_metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Globe size={18} className="text-[#5865F2]" />
          Web Analytics & Statistical A/B Testing Simulator
        </h2>
        <p className="text-xs text-[#949ba4] mt-1">
          Demonstrates HTML metadata architectures, telemetry event pipelines, and rigorous two-sample hypothesis testing ($Z$-test & $P$-value analysis).
        </p>
      </div>

      {/* Row 1: Real Dataset Engagement Metrics (Actual Data) */}
      <div className="discord-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#35373c] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity size={16} className="text-[#57F287]" />
              Dataset Ingestion & Engagement Metrics
            </h3>
            <p className="text-xs text-[#949ba4]">Real telemetry indicators calculated directly from active SQLite database</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-[#57F287]/20 text-[#57F287] font-semibold">
            Actual Ingested Data
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center pt-1">
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Total Ingested Events</span>
            <p className="text-xl font-bold text-white mt-1">{datasetEngagement.dataset_total_events}</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Unique User Sessions</span>
            <p className="text-xl font-bold text-[#5865F2] mt-1">{datasetEngagement.unique_active_profiles}</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Average Events / User</span>
            <p className="text-xl font-bold text-[#57F287] mt-1">{datasetEngagement.events_per_user_average}</p>
          </div>
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c]">
            <span className="text-[10px] text-[#949ba4] uppercase font-bold">Channel Volume Density</span>
            <p className="text-xl font-bold text-[#FEE75C] mt-1">{datasetEngagement.channel_distribution_entropy}</p>
          </div>
        </div>
      </div>

      {/* Row 2: Simulated A/B Testing Section */}
      <div className="discord-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#35373c] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders size={16} className="text-[#EB459E]" />
              A/B Testing Hypothesis Testing Simulator
            </h3>
            <p className="text-xs text-[#949ba4]">
              Simulates two design variants to evaluate Null Hypothesis $H_0: p_A = p_B$ versus Alternative $H_1: p_A \neq p_B$
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EB459E]/20 text-[#EB459E] font-bold">
            Algorithmic Simulation
          </span>
        </div>

        {/* Experiment Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[#1e1f22] rounded-xl border border-[#35373c]">
          <div>
            <label className="text-[11px] font-semibold text-[#949ba4] uppercase">Variant A (Control)</label>
            <input
              type="text"
              value={variantA}
              onChange={(e) => setVariantA(e.target.value)}
              className="discord-input w-full text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#949ba4] uppercase">Variant B (Treatment)</label>
            <input
              type="text"
              value={variantB}
              onChange={(e) => setVariantB(e.target.value)}
              className="discord-input w-full text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#949ba4] uppercase">Sample Size per Variant (N)</label>
            <input
              type="number"
              value={sampleSize}
              min={50}
              max={5000}
              step={50}
              onChange={(e) => setSampleSize(e.target.value)}
              className="discord-input w-full text-xs mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#949ba4] uppercase">Baseline Conversion Rate</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="0.8"
              value={baselineRate}
              onChange={(e) => setBaselineRate(e.target.value)}
              className="discord-input w-full text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#949ba4] uppercase">Expected Lift (+Δ)</label>
            <input
              type="number"
              step="0.01"
              min="-0.1"
              max="0.3"
              value={expectedLift}
              onChange={(e) => setExpectedLift(e.target.value)}
              className="discord-input w-full text-xs mt-1"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="discord-btn-primary w-full text-xs py-2"
            >
              <Play size={14} />
              <span>{simulating ? 'Computing Z-test...' : 'Execute Hypothesis Test'}</span>
            </button>
          </div>
        </div>

        {/* Experiment Results */}
        {abResult && (
          <div className="space-y-4 pt-1 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Variant A Card */}
              <div className="p-4 bg-[#1e1f22] rounded-xl border border-[#35373c] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{abResult.variant_a_results.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#35373c] text-[#949ba4]">Control</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{abResult.variant_a_results.conversion_rate}%</span>
                  <span className="text-xs text-[#949ba4]">({abResult.variant_a_results.conversions} / {abResult.variant_a_results.sample_size})</span>
                </div>
              </div>

              {/* Variant B Card */}
              <div className="p-4 bg-[#1e1f22] rounded-xl border border-[#35373c] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{abResult.variant_b_results.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#5865F2]/20 text-[#5865F2] font-semibold">Treatment</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#57F287]">{abResult.variant_b_results.conversion_rate}%</span>
                  <span className="text-xs text-[#949ba4]">({abResult.variant_b_results.conversions} / {abResult.variant_b_results.sample_size})</span>
                </div>
              </div>
            </div>

            {/* Statistical Outputs */}
            <div className="p-4 bg-[#1e1f22] rounded-xl border border-[#35373c] space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-[#949ba4] uppercase font-bold">Relative Lift</span>
                  <p className="text-lg font-bold text-[#57F287] mt-0.5">
                    +{abResult.statistical_metrics.relative_lift_percent}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#949ba4] uppercase font-bold">Z-Score Statistic</span>
                  <p className="text-lg font-bold text-white mt-0.5 font-mono">
                    {abResult.statistical_metrics.z_score}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#949ba4] uppercase font-bold">P-Value</span>
                  <p className={`text-lg font-bold mt-0.5 font-mono ${abResult.statistical_metrics.is_statistically_significant ? 'text-[#57F287]' : 'text-[#ED4245]'}`}>
                    {abResult.statistical_metrics.p_value}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#949ba4] uppercase font-bold">95% Confidence Interval</span>
                  <p className="text-sm font-bold text-[#FEE75C] mt-1 font-mono">
                    [{abResult.statistical_metrics.confidence_interval_95.lower_bound_percent}%, {abResult.statistical_metrics.confidence_interval_95.upper_bound_percent}%]
                  </p>
                </div>
              </div>

              {/* Hypothesis Decision Statement */}
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                abResult.statistical_metrics.is_statistically_significant
                  ? 'bg-[#57F287]/10 border-[#57F287]/30 text-[#57F287]'
                  : 'bg-[#ED4245]/10 border-[#ED4245]/30 text-[#ED4245]'
              }`}>
                <strong>Hypothesis Test Conclusion (α = 0.05):</strong> {abResult.academic_interpretation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: HTML Tags & Telemetry Syllabus Reference */}
      <div className="discord-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code size={16} className="text-[#FEE75C]" />
          HTML Tags, Metadata & Telemetry Lifecycle (Syllabus Guide)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#949ba4] uppercase">Semantic HTML & Tracking Meta Tags</h4>
            {htmlGuide.semantic_tags?.map((t, i) => (
              <div key={i} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] text-xs space-y-1">
                <span className="font-mono font-bold text-[#5865F2]">{t.tag}</span>
                <p className="text-[#dbdee1] text-[11px]">{t.purpose}</p>
                <p className="text-[#949ba4] text-[10px] italic">Analytics role: {t.analytics_role}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#949ba4] uppercase">Data Collection & Ingestion Pipeline</h4>
            {htmlGuide.data_collection_pipeline?.map((st, i) => (
              <div key={i} className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] text-xs space-y-1">
                <span className="font-semibold text-[#57F287]">{st.stage}</span>
                <p className="text-[#dbdee1] text-[11px]">{st.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
