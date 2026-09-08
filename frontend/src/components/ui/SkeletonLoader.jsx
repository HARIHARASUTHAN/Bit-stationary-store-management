import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-3 p-4 bg-white rounded-xl border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        {items.map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {items.map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 animate-pulse space-y-3">
          <div className="h-40 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
