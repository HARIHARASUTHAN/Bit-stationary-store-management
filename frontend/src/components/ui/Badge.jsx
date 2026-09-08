import React from 'react';

const VARIANTS = {
  success: 'bg-[#f5f0e0] text-[#1a3a3a] border-[#e5e5e5]',
  warning: 'bg-[#ffb084]/20 text-[#0a0a0a] border-[#ffb084]/50',
  danger: 'bg-[#ff4d8b]/15 text-[#ff4d8b] border-[#ff4d8b]/30',
  info: 'bg-[#b8a4ed]/25 text-[#0a0a0a] border-[#b8a4ed]/40',
  teal: 'bg-[#1a3a3a] text-white border-[#1a3a3a]',
  pink: 'bg-[#ff4d8b] text-white border-[#ff4d8b]',
  lavender: 'bg-[#b8a4ed] text-[#0a0a0a] border-[#b8a4ed]',
  peach: 'bg-[#ffb084] text-[#0a0a0a] border-[#ffb084]',
  ochre: 'bg-[#e8b94a] text-[#0a0a0a] border-[#e8b94a]',
  cream: 'bg-[#f5f0e0] text-[#0a0a0a] border-[#e5e5e5]',
  neutral: 'bg-[#faf5e8] text-[#3a3a3a] border-[#e5e5e5]',
};

const SIZES = {
  sm: 'text-[11px] px-2.5 py-0.5',
  md: 'text-xs px-3 py-1 font-medium',
  lg: 'text-xs px-3.5 py-1.5 font-semibold',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${VARIANTS[variant] || VARIANTS.neutral} ${SIZES[size] || SIZES.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            variant === 'danger'
              ? 'bg-[#ff4d8b]'
              : variant === 'warning'
              ? 'bg-[#e8b94a]'
              : variant === 'teal'
              ? 'bg-[#1a3a3a]'
              : 'bg-[#0a0a0a]'
          }`}
        />
      )}
      {children}
    </span>
  );
}
