import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blurple', badge, onClick }) {
  const colorMap = {
    blurple: 'border-l-[#5865F2] text-[#5865F2]',
    green: 'border-l-[#57F287] text-[#57F287]',
    red: 'border-l-[#ED4245] text-[#ED4245]',
    yellow: 'border-l-[#FEE75C] text-[#FEE75C]',
    fuchsia: 'border-l-[#EB459E] text-[#EB459E]',
  };

  const bgIconMap = {
    blurple: 'bg-[#5865F2]/10',
    green: 'bg-[#57F287]/10',
    red: 'bg-[#ED4245]/10',
    yellow: 'bg-[#FEE75C]/10',
    fuchsia: 'bg-[#EB459E]/10',
  };

  return (
    <div
      onClick={onClick}
      className={`discord-card p-5 border-l-4 ${colorMap[color] || colorMap.blurple} transition hover:-translate-y-0.5 hover:border-[#404249] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#949ba4]">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg ${bgIconMap[color] || bgIconMap.blurple}`}>
            <Icon size={18} className={colorMap[color] || colorMap.blurple} />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">
          {value}
        </span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e1f22] text-[#dbdee1] border border-[#35373c] font-medium">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[#949ba4] truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
