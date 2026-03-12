'use client';

import React from 'react';

interface CategoryPillsProps {
  categories: { id: string; name: string }[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-6 py-2  border text-sm font-medium transition-all whitespace-nowrap ${
            selectedCategory === cat.id
              ? 'bg-primary text-white border-primary shadow-premium'
              : 'bg-white text-surface-700 border-surface-200 hover:border-primary/50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;

