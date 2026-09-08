import React from 'react';

const VARIANTS = {
  primary: 'bg-[#0a0a0a] hover:bg-[#222222] text-white shadow-none focus:ring-[#0a0a0a]',
  secondary: 'bg-[#fffaf0] hover:bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5] shadow-none focus:ring-[#0a0a0a]',
  'on-color': 'bg-white hover:bg-[#faf5e8] text-[#0a0a0a] shadow-none border border-white/20',
  navy: 'bg-[#1a3a3a] hover:bg-[#254d4d] text-white shadow-none focus:ring-[#1a3a3a]',
  teal: 'bg-[#1a3a3a] hover:bg-[#254d4d] text-white shadow-none focus:ring-[#1a3a3a]',
  pink: 'bg-[#ff4d8b] hover:bg-[#eb3d7a] text-white shadow-none focus:ring-[#ff4d8b]',
  peach: 'bg-[#ffb084] hover:bg-[#fca170] text-[#0a0a0a] shadow-none',
  lavender: 'bg-[#b8a4ed] hover:bg-[#a691e2] text-[#0a0a0a] shadow-none',
  danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-none focus:ring-red-500',
  ghost: 'bg-transparent hover:bg-[#f5f0e0] text-[#3a3a3a] hover:text-[#0a0a0a] focus:ring-gray-300',
  outline: 'bg-transparent border border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#f5f0e0]',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs min-h-[30px]',
  sm: 'px-3.5 py-1.5 text-xs min-h-[36px]',
  md: 'px-5 py-2.5 text-sm min-h-[44px] font-semibold',
  lg: 'px-6 py-3 text-base min-h-[48px] font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-[12px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={`h-4 w-4 ${children ? 'mr-2' : ''}`} />
      ) : null}
      {children}
    </button>
  );
}
