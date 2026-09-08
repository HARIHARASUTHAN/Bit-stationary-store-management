import React from 'react';

export default function Textarea({
  label,
  error,
  rows = 3,
  className = '',
  required = false,
  id,
  ...props
}) {
  const textareaId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-[#0a0a0a] mb-1.5">
          {label} {required && <span className="text-[#ff4d8b]">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`block w-full rounded-[12px] border bg-[#fffaf0] ${
          error
            ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]'
            : 'border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-[#0a0a0a]'
        } p-3.5 text-sm text-[#0a0a0a] placeholder-[#9a9a9a] focus:outline-none focus:ring-1 transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
