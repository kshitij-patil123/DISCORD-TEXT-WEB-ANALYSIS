import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Download,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Radio,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DataManagementPage({ onDatasetChanged }) {
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState(null);
  const [discordStatus, setDiscordStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 15;

  // Upload state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Analysis pipeline run state
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    loadAll(page);
  }, [page]);

  async function loadAll(currentPage) {
    try {
      setLoading(true);
      const [statsRes, prevRes, botRes] = await Promise.all([
        api.getDataStats(),
        api.getDataPreview(limit, currentPage * limit),
        api.getDiscordStatus()
      ]);
      setStats(statsRes);
      setPreview(prevRes);
      setDiscordStatus(botRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setUploadMsg(null);
      setUploadError(null);
      const res = await api.uploadCSV(file);
      setUploadMsg(res.message);
      setFile(null);
      // Reload stats & preview
      await loadAll(0);
      setPage(0);
      if (onDatasetChanged) onDatasetChanged();
    } catch (err) {
      setUploadError(err.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleResetDemo() {
    if (!window.confirm('Reset database to the original 200 synthetic demo Discord records?')) return;
    try {
      setLoading(true);
      await api.resetDemoData();
      await loadAll(0);
      setPage(0);
      if (onDatasetChanged) onDatasetChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunPipeline() {
    try {
      setRunningAnalysis(true);
      const res = await api.triggerAnalysis();
      setAnalysisResult(res);
      await loadAll(page);
      if (onDatasetChanged) onDatasetChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAnalysis(false);
    }
  }

  if (loading && !preview) return <LoadingSpinner message="Loading dataset statistics and schema validation..." />;

  const totalRecords = preview?.total_records || 0;
  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discord-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-[#5865F2]" />
              Data Management, Schema Validation & Ingestion
            </h2>
            <p className="text-xs text-[#949ba4] mt-1">
              Supports CSV dataset upload, schema validation, deduplication, pipeline execution, and official Discord integration configuration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunPipeline}
              disabled={runningAnalysis}
              className="discord-btn-primary text-xs py-1.5 px-3"
            >
              <Play size={14} />
              <span>{runningAnalysis ? 'Analyzing...' : 'Run Pipeline'}</span>
            </button>
            <a
              href={api.downloadCSVUrl}
              target="_blank"
              rel="noreferrer"
              className="discord-btn-secondary text-xs py-1.5 px-3"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </a>
            <button
              onClick={handleResetDemo}
              className="p-2 rounded-lg bg-[#ED4245]/10 hover:bg-[#ED4245]/20 text-[#ED4245] border border-[#ED4245]/30 transition"
              title="Reset to Original Demo Dataset"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Run Notification */}
      {analysisResult && (
        <div className="p-4 bg-[#57F287]/10 border border-[#57F287]/30 rounded-xl text-xs text-[#57F287] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{analysisResult.message} Discovered {analysisResult.topics_discovered} topics and {analysisResult.entities_identified} entities.</span>
          </div>
          <button onClick={() => setAnalysisResult(null)} className="text-[#949ba4] hover:text-white">✕</button>
        </div>
      )}

      {/* Dataset Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Total Records</span>
          <p className="text-2xl font-bold text-white mt-1">{stats?.total_records || 0}</p>
        </div>
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Unique Users</span>
          <p className="text-2xl font-bold text-[#5865F2] mt-1">{stats?.unique_users || 0}</p>
        </div>
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Active Channels</span>
          <p className="text-2xl font-bold text-[#57F287] mt-1">{stats?.unique_channels || 0}</p>
        </div>
        <div className="discord-card p-4">
          <span className="text-[10px] uppercase font-bold text-[#949ba4]">Duplicates Detected</span>
          <p className="text-2xl font-bold text-[#FEE75C] mt-1">{stats?.duplicate_messages || 0}</p>
        </div>
      </div>

      {/* Row 1: CSV Upload with Documented Schema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="discord-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload size={16} className="text-[#5865F2]" />
              Upload Custom Discord CSV Dataset
            </h3>
            <p className="text-xs text-[#949ba4]">Ingest community messages adhering to the project schema</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-3">
            <div className="border-2 border-dashed border-[#35373c] hover:border-[#5865F2] transition rounded-xl p-6 text-center bg-[#1e1f22]">
              <FileSpreadsheet className="w-8 h-8 text-[#949ba4] mx-auto mb-2" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-xs text-[#949ba4] file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#5865F2] file:text-white hover:file:bg-[#4752C4] cursor-pointer"
              />
              <span className="text-[11px] text-[#949ba4] mt-2 block">
                {file ? file.name : 'Upload standard CSV with UTF-8 encoding'}
              </span>
            </div>

            {uploadMsg && (
              <p className="text-xs text-[#57F287] flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                {uploadMsg}
              </p>
            )}

            {uploadError && (
              <p className="text-xs text-[#ED4245] flex items-center gap-1.5">
                <AlertTriangle size={14} />
                {uploadError}
              </p>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="discord-btn-primary w-full text-xs py-2 disabled:opacity-50"
            >
              {uploading ? 'Validating & Ingesting...' : 'Validate & Import Records'}
            </button>
          </form>
        </div>

        {/* Documented Schema Reference */}
        <div className="discord-card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-[#57F287]" />
              Documented Schema Specification
            </h3>
            <p className="text-xs text-[#949ba4]">Mandatory and optional columns expected by the ingestion parser</p>
          </div>

          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2 text-xs">
            <span className="font-bold text-[#FEE75C] text-[11px] uppercase">Required Columns:</span>
            <code className="text-[#57F287] block font-mono text-[11px] bg-[#111214] p-2 rounded">
              message_id, timestamp, user_id, channel, message, reply_to
            </code>

            <span className="font-bold text-[#949ba4] text-[11px] uppercase pt-1 block">Optional Augmented Columns:</span>
            <code className="text-[#5865F2] block font-mono text-[11px] bg-[#111214] p-2 rounded">
              game_title, sentiment_label, source
            </code>

            <p className="text-[11px] text-[#949ba4] leading-relaxed pt-1">
              • <strong>reply_to:</strong> Used by NetworkX to reconstruct conversational threads and graph edges.<br />
              • <strong>user_id:</strong> Always pseudonymized in storage to protect member privacy.<br />
              • <strong>sentiment_label:</strong> Used for model evaluation if provided; inferred dynamically if omitted.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Discord Integration Status (Mode A vs Mode B) */}
      <div className="discord-card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#35373c] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio size={16} className="text-[#5865F2]" />
              Official Discord Bot Integration Status (Mode A vs Mode B)
            </h3>
            <p className="text-xs text-[#949ba4]">
              Complies with Discord Developer Terms of Service and data minimization principles
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] font-bold">
            {discordStatus?.mode || 'Demo Mode (Mode A)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#dbdee1]">
          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
            <span className="font-bold text-white uppercase text-[11px]">Developer Compliance Checklist</span>
            <ul className="space-y-1 text-[11px] text-[#949ba4]">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#57F287]" />
                Authorized servers only (explicit server admin invitation)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#57F287]" />
                Explicit "Read Message History" intent requested
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#57F287]" />
                User pseudonymization enforced prior to persistence
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#57F287]" />
                Direct Messages (DMs) strictly excluded from scraping
              </li>
            </ul>
          </div>

          <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] space-y-2">
            <span className="font-bold text-white uppercase text-[11px]">Configuration Instructions (Mode B)</span>
            <p className="text-[11px] text-[#949ba4] leading-relaxed">
              {discordStatus?.configuration_guide ||
                "Configure DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, and DISCORD_CHANNEL_IDS in backend/.env to pull messages from live authorized Discord channels. Defaults gracefully to Demo Mode when unconfigured."}
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Paginated Dataset Preview */}
      <div className="discord-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Ingested Dataset Records Preview</h3>
            <p className="text-xs text-[#949ba4]">
              Showing records {page * limit + 1} to {Math.min((page + 1) * limit, totalRecords)} of {totalRecords}
            </p>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded bg-[#1e1f22] hover:bg-[#35373c] disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-[#949ba4]">
              Page <strong className="text-white">{page + 1}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded bg-[#1e1f22] hover:bg-[#35373c] disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1e1f22] text-[#949ba4] uppercase font-semibold">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">User</th>
                <th className="p-2.5">Channel</th>
                <th className="p-2.5">Message Content</th>
                <th className="p-2.5">Reply To</th>
                <th className="p-2.5">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#35373c]">
              {(preview?.records || []).map((r) => (
                <tr key={r.message_id} className="hover:bg-[#35373c]/30">
                  <td className="p-2.5 font-mono text-[#949ba4]">{r.message_id}</td>
                  <td className="p-2.5 text-[#949ba4] whitespace-nowrap">{r.timestamp}</td>
                  <td className="p-2.5 font-semibold text-[#5865F2] font-mono">{r.user_id}</td>
                  <td className="p-2.5 text-[#57F287] font-mono">{r.channel}</td>
                  <td className="p-2.5 text-[#dbdee1] max-w-sm truncate">{r.message}</td>
                  <td className="p-2.5 font-mono text-[#FEE75C]">{r.reply_to || '—'}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#2b2d31] text-[#dbdee1]">
                      {r.sentiment_label}
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
