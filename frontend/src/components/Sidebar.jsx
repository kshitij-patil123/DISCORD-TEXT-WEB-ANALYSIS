import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Tag,
  Smile,
  Globe,
  Share2,
  Gamepad2,
  Gauge,
  Activity,
  Database,
  ShieldCheck,
  Hash,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, stats }) {
  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'text-analytics', label: 'Text Analytics & NLP', icon: FileText, category: 'Text Mining' },
    { id: 'entities-topics', label: 'Entities & Topics', icon: Tag, category: 'Text Mining' },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: Smile, category: 'Machine Learning' },
    { id: 'social-mining', label: 'Social Media Mining', icon: Share2, category: 'Social Mining' },
    { id: 'recommendations', label: 'Game Recommendations', icon: Gamepad2, category: 'Recommendation' },
    { id: 'web-analytics', label: 'Web Analytics & A/B Test', icon: Globe, category: 'Web Analytics' },
    { id: 'model-eval', label: 'Evaluation & XAI', icon: Gauge, category: 'MLOps & Ethics' },
    { id: 'drift-monitor', label: 'Drift & Feedback', icon: Activity, category: 'MLOps & Ethics' },
    { id: 'data-mgmt', label: 'Data Management', icon: Database, category: 'System' },
    { id: 'ethics', label: 'Ethics & Syllabus Mapping', icon: ShieldCheck, category: 'System' },
  ];

  const categories = ['Main', 'Text Mining', 'Machine Learning', 'Social Mining', 'Recommendation', 'Web Analytics', 'MLOps & Ethics', 'System'];

  return (
    <aside className="w-64 bg-[#1e1f22] border-r border-[#2b2d31] flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-[#2b2d31] bg-[#1a1b1e]">
        <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-md shadow-[#5865F2]/20">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            Discord Analytics
          </h1>
          <span className="text-[11px] font-medium text-[#57F287] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#57F287] animate-pulse"></span>
            Full-Stack AI Project
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((category) => {
          const items = navItems.filter((item) => item.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#949ba4]">
                {category}
              </span>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition group text-left ${
                      isActive
                        ? 'bg-[#5865F2] text-white shadow-sm'
                        : 'text-[#949ba4] hover:bg-[#2b2d31] hover:text-[#dbdee1]'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-[#949ba4] group-hover:text-[#dbdee1]'} />
                    <span className="truncate flex-1">{item.label}</span>
                    {item.id === 'overview' && stats?.total_messages > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-[#2b2d31] text-[#949ba4]'}`}>
                        {stats.total_messages}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Student Project Badge */}
      <div className="p-3 border-t border-[#2b2d31] bg-[#1a1b1e]">
        <div className="p-2.5 rounded-lg bg-[#2b2d31]/70 border border-[#35373c] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-white">
            <span>B.E. Final Year Project</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#5865F2]/20 text-[#5865F2]">v1.0</span>
          </div>
          <p className="text-[10px] text-[#949ba4] leading-tight">
            Computer Engineering Dept. • NLP, Web Mining & RecSys
          </p>
        </div>
      </div>
    </aside>
  );
}
