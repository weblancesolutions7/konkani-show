
'use client';

import React, { useState } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import TagChip from '@/components/ui/TagChip';

export default function PreferencesPage() {
    const { preferences, loading } = usePreferences();
    const [activeManager, setActiveManager] = useState<'TAGS' | 'CATEGORIES' | 'FEATURED'>('TAGS');

    if (loading) return <div className="p-20 text-center animate-pulse font-bold">Loading Managers...</div>;

    return (
        <main className="min-h-screen bg-surface-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black mb-2">Preferences Management</h1>
                    <p className="text-surface-800/60 font-medium">Control the metadata and layout of the platform.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <nav className="space-y-2">
                        {(['TAGS', 'CATEGORIES', 'FEATURED'] as const).map(manager => (
                            <button
                                key={manager}
                                onClick={() => setActiveManager(manager)}
                                className={`w-full text-left px-5 py-3 rounded-xl font-bold transition-all ${activeManager === manager
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-surface-50 border border-surface-200 text-surface-800/60 hover:border-primary/50'
                                    }`}
                            >
                                {manager.charAt(0) + manager.slice(1).toLowerCase()} Manager
                            </button>
                        ))}
                    </nav>

                    <div className="md:col-span-3">
                        <section className="bg-surface-50 p-8 rounded-3xl border border-surface-200 shadow-premium">
                            {activeManager === 'TAGS' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black">Platform Tags</h2>
                                        <button className="text-primary font-bold text-sm">+ Add New Tag</button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {preferences?.tags.map(tag => (
                                            <div key={tag.id} className="group relative">
                                                <TagChip label={tag.name} />
                                                <button className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] hidden group-hover:flex items-center justify-center shadow-lg">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeManager === 'CATEGORIES' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black">Categories</h2>
                                        <button className="text-primary font-bold text-sm">+ New Category</button>
                                    </div>
                                    <div className="space-y-3">
                                        {preferences?.categories.map(cat => (
                                            <div key={cat.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-100">
                                                <span className="font-bold">{cat.name}</span>
                                                <div className="flex gap-4 items-center">
                                                    <span className="text-xs font-bold text-surface-800/40 uppercase tracking-tighter">{cat.count || 0} Events</span>
                                                    <button className="text-surface-800/20 hover:text-rose-500 transition-colors">🗑️</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeManager === 'FEATURED' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black">Featured Categories (Hero)</h2>
                                    <p className="text-sm text-surface-800/50 mb-6">Drag and drop to reorder. The first item appears as the Hero Section.</p>

                                    <div className="space-y-4">
                                        {preferences?.featuredCategories.map((f, i) => (
                                            <div key={i} className="flex items-center gap-4 p-5 bg-surface-900 text-white rounded-2xl cursor-move border border-white/5 shadow-xl group">
                                                <div className="w-12 h-12 rounded-lg bg-surface-800 overflow-hidden flex-shrink-0">
                                                    <img src={f.featuredImage || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-lg">{f.category}</p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Priority: {i + 1}</p>
                                                </div>
                                                <div className="flex flex-col gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <span>⠿</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
