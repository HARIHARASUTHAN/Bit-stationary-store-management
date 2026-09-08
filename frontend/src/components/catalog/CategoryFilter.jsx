import React from 'react';

export default function CategoryFilter({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelectCategory('')}
        className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
          selectedCategory === ''
            ? 'bg-[#f5f0e0] text-[#0a0a0a] font-semibold border border-[#e5e5e5]'
            : 'bg-transparent text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#faf5e8]'
        }`}
      >
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedCategory === cat
              ? 'bg-[#f5f0e0] text-[#0a0a0a] font-semibold border border-[#e5e5e5]'
              : 'bg-transparent text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#faf5e8]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
