import React from 'react';
import { ShieldCheck, Database, RefreshCw, Radio } from 'lucide-react';

export default function Navbar({ activePageTitle, isBackendOnline, stats, onRefresh, onOpenEthics }) {
  return (
    <header className="h-16 bg-[#1e1f22] border-b border-[#2b2d31] px-6 flex items-center justify-between shrink-0">
      {/* Active Page Title & Hash icon */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-[#949ba4]">#</span>
        <h2 className="text-base font-bold text-white tracking-tight">
          {activePageTitle}
        </h2>
      </div>

      {/* Status Badges & Quick Action Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Online status */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#2b2d31] border border-[#35373c] text-xs">
          <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-[#57F287] shadow-sm shadow-[#57F287]' : 'bg-[#ED4245]'}`}></span>
          <span className="text-[#dbdee1] font-medium text-[11px]">
            {isBackendOnline ? 'API Connected (FastAPI)' : 'API Offline'}
          </span>
        </div>

        {/* Mode Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-xs text-[#5865F2] font-semibold">
          <Radio size={13} className="animate-pulse" />
          <span>Mode A: Demo Mode</span>
        </div>

        {/* Dataset Count Badge */}
        {stats?.total_messages > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2b2d31] border border-[#35373c] text-xs text-[#949ba4]">
            <Database size={13} />
            <span className="text-white font-medium">{stats.total_messages}</span> messages
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh Current Page Data"
          className="p-2 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] text-[#dbdee1] border border-[#35373c] transition"
        >
          <RefreshCw size={15} />
        </button>

        {/* Ethics & Syllabus Modal Trigger */}
        <button
          onClick={onOpenEthics}
          className="discord-btn-primary text-xs py-1.5 px-3"
        >
          <ShieldCheck size={14} />
          <span>Ethics & Syllabus</span>
        </button>
      </div>
    </header>
  );
}
