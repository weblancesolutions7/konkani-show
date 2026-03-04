
import React from 'react';
import { Category } from '@/types';

interface CategoryTabsProps {
    categories: Category[];
    activeCategory?: string;
    onCategoryChange: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onCategoryChange }) => {
    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category, index) => (
                <button
                    key={category.id || category.name || index}
                    onClick={() => onCategoryChange(category.name)}
                    className={`px-6 py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-200 border-2 ${activeCategory === category.name
                        ? 'bg-primary border-primary text-white shadow-md scale-105'
                        : 'bg-white border-surface-200 text-surface-900 hover:border-primary/50 shadow-sm'
                        }`}
                >
                    {category.name}
                    {category.count !== undefined && (
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeCategory === category.name ? 'bg-white/20' : 'bg-surface-200'
                            }`}>
                            {category.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;
