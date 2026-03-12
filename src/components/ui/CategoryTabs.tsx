
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
                    className={`px-6 py-2.5  whitespace-nowrap font-bold transition-all duration-300 border-2 ${activeCategory === category.name
                        ? 'bg-brand-gradient border-transparent text-white shadow-premium scale-105 ring-2 ring-primary/20'
                        : 'bg-white border-surface-200/80 text-surface-700 hover:border-primary/30 hover:bg-surface-50 shadow-sm'
                        }`}
                >
                    <span className="relative z-10">{category.name}</span>
                    {category.count !== undefined && (
                        <span className={`ml-2 text-[10px] font-black px-2 py-0.5  transition-colors duration-300 ${activeCategory === category.name 
                            ? 'bg-white/20 text-white' 
                            : 'bg-surface-100 text-surface-500 group-hover:bg-surface-200'
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

