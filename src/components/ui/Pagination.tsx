
'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage
}) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisiblePages - 1);
            
            if (end === totalPages) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }
            
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 px-2">
            <div className="text-sm font-medium text-surface-500">
                Showing <span className="font-bold text-surface-900">{startItem}</span> to <span className="font-bold text-surface-900">{endItem}</span> of <span className="font-bold text-surface-900">{totalItems}</span> results
            </div>

            <nav className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-surface-200 shadow-sm">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl text-surface-600 hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map(num => (
                        <button
                            key={num}
                            onClick={() => onPageChange(num)}
                            className={`min-w-[40px] h-10 rounded-xl text-sm font-black transition-all ${
                                currentPage === num
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-surface-600 hover:bg-surface-50'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl text-surface-600 hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    aria-label="Next page"
                >
                    <ChevronRight size={20} />
                </button>
            </nav>
        </div>
    );
};

export default Pagination;
