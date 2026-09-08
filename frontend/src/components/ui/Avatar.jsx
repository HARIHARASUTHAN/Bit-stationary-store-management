import React from 'react';

export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-semibold rounded-full bg-teal-600 text-white shadow-sm flex-shrink-0 ${sizes[size] || sizes.md} ${className}`}
    >
      {initials}
    </div>
  );
}
