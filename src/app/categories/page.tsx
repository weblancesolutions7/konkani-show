'use client';

import React from 'react';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { LayoutGrid, FolderOpen } from 'lucide-react';

export default function CategoriesPage() {
    const { preferences, loading } = usePreferences();

    return (
        <main className="min-h-screen bg-surface-50 py-12 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-foreground mb-2">Explore Categories</h1>
                    <p className="text-surface-800/60 font-medium text-lg">
                        Find events by your favorite interests and show types.
                    </p>
                </header>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="aspect-square  bg-surface-200 animate-pulse" />
                        ))}
                    </div>
                ) : preferences?.categories && preferences.categories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {preferences.categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${encodeURIComponent(cat.name)}`}
                                className="group relative aspect-square  bg-white border border-surface-200 p-8 flex flex-col items-center justify-center text-center transition-all hover:shadow-premium hover:border-primary/30"
                            >
                                <div className="text-primary mb-4 transform transition-transform group-hover:scale-110">
                                    <LayoutGrid size={40} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-bold text-surface-900 mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                                <p className="text-sm font-bold text-surface-400 uppercase tracking-tighter">
                                    {cat.count || 0} Events
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white  border-2 border-dashed border-surface-200 shadow-sm">
                        <div className="text-surface-300 mb-4">
                            <FolderOpen size={64} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-surface-900 mb-2">No categories found</h3>
                        <p className="text-surface-600">Please check back later.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

