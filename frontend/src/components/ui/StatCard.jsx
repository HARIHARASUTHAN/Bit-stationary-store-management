import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'cream',
  onClick,
}) {
  const colorMap = {
    pink: 'bg-[#ff4d8b] text-white border-transparent',
    teal: 'bg-[#1a3a3a] text-white border-transparent',
    lavender: 'bg-[#b8a4ed] text-[#0a0a0a] border-transparent',
    peach: 'bg-[#ffb084] text-[#0a0a0a] border-transparent',
    ochre: 'bg-[#e8b94a] text-[#0a0a0a] border-transparent',
    cream: 'bg-[#f5f0e0] text-[#0a0a0a] border-[#e5e5e5]',
    amber: 'bg-[#ffb084]/30 text-[#0a0a0a] border-[#ffb084]/40',
    rose: 'bg-[#ff4d8b]/15 text-[#ff4d8b] border-[#ff4d8b]/30',
    navy: 'bg-[#1a3a3a] text-white border-transparent',
    green: 'bg-[#a4d4c5] text-[#0a0a0a] border-transparent',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#fffaf0] rounded-[16px] border border-[#e5e5e5] p-5 transition-all hover:border-[#0a0a0a] ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6a6a6a]">{title}</p>
          <h3 className="text-2xl font-medium tracking-[-1px] text-[#0a0a0a] mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-[12px] border ${colorMap[color] || colorMap.cream}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center text-xs text-[#6a6a6a] gap-1.5">
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-[#1a3a3a]' : 'text-[#ff4d8b]'}`}>
              {trend.positive ? '↑' : '↓'} {trend.text}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
