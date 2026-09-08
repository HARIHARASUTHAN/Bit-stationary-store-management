import React from 'react';

export default function Select({
  label,
  error,
  options = [],
  className = '',
  required = false,
  placeholder = 'Select an option',
  id,
  ...props
}) {
  const selectId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#0a0a0a] mb-1.5">
          {label} {required && <span className="text-[#ff4d8b]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full min-h-[44px] rounded-[12px] border bg-[#fffaf0] ${
          error
            ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]'
            : 'border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-[#0a0a0a]'
        } px-4 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:ring-1 transition-all ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
