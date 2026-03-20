'use client';

import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    date: string;
    categories: string[];
    tags: string[];
    priceRange: [number, number];
  };
  onFilterChange: (newFilters: any) => void;
  availableCategories: { id: string; name: string }[];
  availableTags: { id: string; name: string }[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  availableCategories,
  availableTags
}) => {
  const [expanded, setExpanded] = useState<string[]>(['date']);

  const toggleAccordion = (id: string) => {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(filters.date.includes(','));

  const handleDateChange = (dateType: string) => {
    onFilterChange({ ...filters, date: dateType });
    if (!dateType.includes(',')) {
        setIsCustomRangeOpen(false);
        setDateRange({ start: '', end: '' });
    }
  };

  const handleCustomToggle = () => {
    const newState = !isCustomRangeOpen;
    setIsCustomRangeOpen(newState);
    if (!newState) {
        onFilterChange({ ...filters, date: '' });
        setDateRange({ start: '', end: '' });
    }
  };

  const [dateRange, setDateRange] = useState({
    start: filters.date.includes(',') ? filters.date.split(',')[0] : '',
    end: filters.date.includes(',') ? filters.date.split(',')[1] : ''
  });

  const handleRangeChange = (key: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [key]: value };
    setDateRange(newRange);
    if (newRange.start || newRange.end) {
        onFilterChange({ ...filters, date: `${newRange.start},${newRange.end}` });
    } else {
        onFilterChange({ ...filters, date: '' });
    }
  };

  const toggleSelection = (listName: 'categories' | 'tags', value: string) => {
    const currentList = filters[listName];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    onFilterChange({ ...filters, [listName]: newList });
  };

  const handlePriceClick = (type: 'Free' | 'Paid') => {
    if (type === 'Free') {
        onFilterChange({ ...filters, priceRange: [0, 0] });
    } else {
        onFilterChange({ ...filters, priceRange: [1, 1000000] }); // Just a high number for "Paid"
    }
  };

  const clearFilter = (key: keyof typeof filters) => {
    if (key === 'date') {
        onFilterChange({ ...filters, date: '' });
        setDateRange({ start: '', end: '' });
        setIsCustomRangeOpen(false);
    }
    else if (key === 'categories' || key === 'tags') onFilterChange({ ...filters, [key]: [] });
    else if (key === 'priceRange') onFilterChange({ ...filters, priceRange: [0, 0] });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-foreground mb-6">Filters</h2>

      {/* Date Filter */}
      <FilterAccordion 
        title="Date" 
        isOpen={expanded.includes('date')} 
        onToggle={() => toggleAccordion('date')}
        onClear={() => clearFilter('date')}
        isDirty={!!filters.date}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['Today', 'Tomorrow', 'This Weekend'].map(d => (
              <button
                key={d}
                onClick={() => handleDateChange(d.toLowerCase().replace(' ', ''))}
                className={`px-4 py-1.5  border text-sm font-medium transition-all ${
                  filters.date === d.toLowerCase().replace(' ', '')
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-white text-surface-600 border-surface-100 hover:border-surface-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-surface-100">
            <label 
                onClick={handleCustomToggle}
                className="flex items-center gap-2 cursor-pointer group mb-3"
            >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isCustomRangeOpen ? 'bg-primary border-primary' : 'border-surface-300 group-hover:border-primary'}`}>
                    {isCustomRangeOpen && (
                        <Check size={10} strokeWidth={4} className="text-white" />
                    )}
                </div>
                <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Custom Range</span>
            </label>
            
            {isCustomRangeOpen && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="space-y-1">
                        <span className="text-[10px] text-surface-500 font-medium ml-1 uppercase tracking-tight">Start Date</span>
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => handleRangeChange('start', e.target.value)}
                            className="w-full px-4 py-2  border border-surface-200 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-surface-500 font-medium ml-1 uppercase tracking-tight">End Date</span>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => handleRangeChange('end', e.target.value)}
                            className="w-full px-4 py-2  border border-surface-200 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>
            )}
          </div>
        </div>
      </FilterAccordion>

      {/* Categories Filter */}
      <FilterAccordion 
        title="Categories" 
        isOpen={expanded.includes('categories')} 
        onToggle={() => toggleAccordion('categories')}
        onClear={() => clearFilter('categories')}
        isDirty={filters.categories.length > 0}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-2">
          {availableCategories.map(cat => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group py-1">
              <input 
                type="checkbox" 
                checked={filters.categories.includes(cat.id)}
                onChange={() => toggleSelection('categories', cat.id)}
                className="w-4 h-4 rounded border-surface-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-surface-700 group-hover:text-primary transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* Tags Filter */}
      <FilterAccordion 
        title="Tags" 
        isOpen={expanded.includes('tags')} 
        onToggle={() => toggleAccordion('tags')}
        onClear={() => clearFilter('tags')}
        isDirty={filters.tags.length > 0}
      >
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-2">
          {availableTags.map(tag => (
            <label key={tag.id} className="flex items-center gap-3 cursor-pointer group py-1">
              <input 
                type="checkbox" 
                checked={filters.tags.includes(tag.name)}
                onChange={() => toggleSelection('tags', tag.name)}
                className="w-4 h-4 rounded border-surface-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-surface-700 group-hover:text-primary transition-colors">{tag.name}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* Price Filter */}
      <FilterAccordion 
        title="Price" 
        isOpen={expanded.includes('price')} 
        onToggle={() => toggleAccordion('price')}
        onClear={() => clearFilter('priceRange')}
        isDirty={filters.priceRange[1] > 0}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            {['Free', 'Paid'].map(p => (
              <button
                key={p}
                onClick={() => handlePriceClick(p as 'Free' | 'Paid')}
                className={`flex-1 py-1.5  border text-sm font-medium transition-all ${
                  (p === 'Free' && filters.priceRange[0] === 0 && filters.priceRange[1] === 0 && filters.date !== '') || // This is tricky, let's use a simpler check
                  (p === 'Free' && filters.priceRange[0] === 0 && filters.priceRange[1] === 0 && expanded.includes('price') && filters.priceRange[1] === 0) ||
                  (p === 'Paid' && filters.priceRange[0] > 0)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-surface-600 border-surface-100 hover:border-surface-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </FilterAccordion>

    </div>
  );
};

const FilterAccordion: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    isOpen: boolean; 
    onToggle: () => void;
    onClear: () => void;
    isDirty: boolean;
}> = ({ title, children, isOpen, onToggle, onClear, isDirty }) => (
  <div className="bg-white  border border-surface-200 shadow-sm overflow-hidden transition-all duration-300">
    <button 
      onClick={onToggle}
      className="w-full px-5 py-4 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <ChevronDown 
            size={14} 
            strokeWidth={3} 
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
        <span className={`text-sm font-black transition-colors ${isOpen ? 'text-primary' : 'text-surface-700 group-hover:text-primary'}`}>
            {title}
        </span>
      </div>
      {isDirty && (
        <span 
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="text-[10px] font-bold uppercase tracking-wider text-surface-400 hover:text-primary transition-colors cursor-pointer"
        >
          Clear
        </span>
      )}
    </button>
    <div className={`px-5 transition-all duration-300 ${isOpen ? 'opacity-100 pb-5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
      {children}
    </div>
  </div>
);

export default FilterSidebar;

