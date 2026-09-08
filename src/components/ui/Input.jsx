import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  endIcon: EndIcon,
  className = '',
  wrapperClassName = '',
  required = false,
  id,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#0a0a0a] mb-1.5">
          {label} {required && <span className="text-[#ff4d8b]">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a9a9a]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full min-h-[44px] rounded-[12px] border bg-[#fffaf0] ${
            error
              ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]'
              : 'border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-[#0a0a0a]'
          } ${Icon ? 'pl-10' : 'pl-4'} ${EndIcon ? 'pr-10' : 'pr-4'} py-2.5 text-sm text-[#0a0a0a] placeholder-[#9a9a9a] focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
        {EndIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9a9a9a]">
            <EndIcon className="h-4 w-4" />
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#ef4444]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6a6a6a]">{helperText}</p>
      ) : null}
    </div>
  );
}
