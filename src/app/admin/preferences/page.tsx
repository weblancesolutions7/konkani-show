
'use client';

import React, { useState } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import TagChip from '@/components/ui/TagChip';
import { useNotification } from '@/components/ui/NotificationProvider';

import { Trash2, Plus, X } from 'lucide-react';

export default function PreferencesPage() {
    const { showAlert, showConfirm } = useNotification();
    const { preferences, loading, updatePreferences } = usePreferences();
    const [activeManager, setActiveManager] = useState<'TAGS' | 'CATEGORIES'>('TAGS');
    const [newTag, setNewTag] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);


    const handleAddTag = async () => {
        if (!newTag.trim() || !preferences) return;
        const tagExists = preferences.tags.some(t => t.name.toLowerCase() === newTag.trim().toLowerCase());
        if (tagExists) {
            showAlert('Tag already exists', 'Validation Error');
            return;
        }

        const updatedPrefs = {
            ...preferences,
            tags: [...preferences.tags, { id: Date.now().toString(), name: newTag.trim() }]
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
            setNewTag('');
            showAlert(`Tag "${newTag}" added successfully!`, 'Success');
        } catch (err: any) {
            showAlert(`Failed to add tag: ${err.message}`, 'Error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        if (!preferences) return;
        const updatedPrefs = {
            ...preferences,
            tags: preferences.tags.filter(t => t.id !== tagId)
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
            showAlert('Tag deleted successfully.', 'Success');
        } catch (err: any) {
            showAlert(`Failed to delete tag: ${err.message}`, 'Error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim() || !preferences) return;
        const catExists = preferences.categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase());
        if (catExists) {
            showAlert('Category already exists', 'Validation Error');
            return;
        }

        const updatedPrefs = {
            ...preferences,
            categories: [...preferences.categories, { id: Date.now().toString(), name: newCategory.trim(), count: 0 }]
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
            setNewCategory('');
            showAlert(`Category "${newCategory}" added successfully!`, 'Success');
        } catch (err: any) {
            showAlert(`Failed to add category: ${err.message}`, 'Error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCategory = async (catId: string) => {
        if (!preferences) return;
        const updatedPrefs = {
            ...preferences,
            categories: preferences.categories.filter(c => c.id !== catId)
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
            showAlert('Category deleted successfully.', 'Success');
        } catch (err: any) {
            showAlert(`Failed to delete category: ${err.message}`, 'Error');
        } finally {
            setIsSaving(false);
        }
    };


    if (loading) return <div className="p-20 text-center animate-pulse font-bold bg-surface-50 min-h-screen">Loading Managers...</div>;

    return (
        <div className="py-12 px-10">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black mb-2 px-1">Preferences Management</h1>
                    <p className="text-surface-800/60 font-medium px-1">Control the metadata, categories, and hero features of the platform.</p>
                </header>
                <div className="flex flex-col gap-8">
                    <div className="flex bg-surface-100 p-1.5 rounded-2xl border border-surface-200 w-fit">
                        {(['TAGS', 'CATEGORIES'] as const).map(manager => (
                            <button
                                key={manager}
                                onClick={() => setActiveManager(manager as 'TAGS' | 'CATEGORIES')}
                                className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeManager === manager
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-surface-400 hover:text-surface-600'
                                    }`}
                            >
                                {manager}
                            </button>
                        ))}
                    </div>

                    <div className="w-full">
                        <section className="bg-white p-8 rounded-3xl border border-surface-200 shadow-premium relative min-h-[500px]">
                            {isSaving && (
                                <div className="absolute inset-0 bg-white/50 rounded-3xl backdrop-blur-sm flex items-center justify-center z-10 ">
                                    <div className="animate-spin  h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            )}

                            {activeManager === 'TAGS' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black">Platform Tags</h2>
                                    </div>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="New tag name..."
                                            className="flex-1 px-5 py-3 rounded-xl border border-surface-200 bg-surface-50 outline-none focus:border-primary transition-all"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                        />
                                        <button
                                            onClick={handleAddTag}
                                            className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
                                        >
                                            <Plus size={18} strokeWidth={3} /> Add Tag
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3 pt-4">
                                        {preferences?.tags.map(tag => (
                                            <div key={tag.id} className="group relative">
                                                <TagChip label={tag.name} />
                                                <button
                                                    onClick={() => handleDeleteTag(tag.id)}
                                                    className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeManager === 'CATEGORIES' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black">Categories</h2>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="New category name..."
                                            className="flex-1 px-5 py-3 rounded-xl border border-surface-200 bg-surface-50 outline-none focus:border-primary transition-all"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                        />
                                        <button
                                            onClick={handleAddCategory}
                                            className="px-8 py-3 bg-primary text-white font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20"
                                        >
                                            <Plus size={18} strokeWidth={3} /> Add Category
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {preferences?.categories.map(cat => (
                                            <div key={cat.id} className="flex items-center justify-between p-5 bg-surface-50 rounded-2xl border border-surface-100 hover:border-primary/20 transition-all group">
                                                <span className="font-black text-sm uppercase tracking-tight">{cat.name}</span>
                                                <div className="flex gap-6 items-center">
                                                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-surface-100">{cat.count || 0} Events</span>
                                                    <button
                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                        className="text-surface-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
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
        </div>
    );
}

