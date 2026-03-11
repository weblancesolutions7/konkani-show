
'use client';

import React, { useState } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import TagChip from '@/components/ui/TagChip';

import AdminSidebar from '@/components/admin/AdminSidebar';

export default function PreferencesPage() {
    const { preferences, loading, updatePreferences } = usePreferences();
    const [activeManager, setActiveManager] = useState<'TAGS' | 'CATEGORIES' | 'CITIES' | 'FEATURED'>('TAGS');
    const [newTag, setNewTag] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newCity, setNewCity] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Hero Manager State
    const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
    const [heroForm, setHeroForm] = useState({
        category: '',
        title: '',
        description: '',
        featuredImage: '',
        link: ''
    });
    const [isUploadingHero, setIsUploadingHero] = useState(false);

    const handleAddTag = async () => {
        if (!newTag.trim() || !preferences) return;
        const tagExists = preferences.tags.some(t => t.name.toLowerCase() === newTag.trim().toLowerCase());
        if (tagExists) {
            alert('Tag already exists');
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
        } catch (err) {
            alert('Failed to add tag');
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
        } catch (err) {
            alert('Failed to delete tag');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim() || !preferences) return;
        const catExists = preferences.categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase());
        if (catExists) {
            alert('Category already exists');
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
        } catch (err) {
            alert('Failed to add category');
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
        } catch (err) {
            alert('Failed to delete category');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCity = async () => {
        if (!newCity.trim() || !preferences) return;
        const cityExists = (preferences.cities || []).some(c => c.toLowerCase() === newCity.trim().toLowerCase());
        if (cityExists) {
            alert('City already exists');
            return;
        }

        const updatedPrefs = {
            ...preferences,
            cities: [...(preferences.cities || []), newCity.trim()]
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
            setNewCity('');
        } catch (err) {
            alert('Failed to add city');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCity = async (cityName: string) => {
        if (!preferences) return;
        const updatedPrefs = {
            ...preferences,
            cities: (preferences.cities || []).filter(c => c !== cityName)
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
        } catch (err) {
            alert('Failed to delete city');
        } finally {
            setIsSaving(false);
        }
    };

    const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingHero(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
                { method: 'POST', body: formData }
            );
            const data = await response.json();
            if (data.secure_url) {
                setHeroForm(prev => ({ ...prev, featuredImage: data.secure_url }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again or use a URL.');
        } finally {
            setIsUploadingHero(false);
        }
    };

    const handleReorderFeatured = async (fromIndex: number, toIndex: number) => {
        if (!preferences) return;
        const newFeatured = [...preferences.featuredCategories];
        const [removed] = newFeatured.splice(fromIndex, 1);
        newFeatured.splice(toIndex, 0, removed);

        const updatedPrefs = {
            ...preferences,
            featuredCategories: newFeatured.map(item => ({
                ...item,
                id: item.id || Math.random().toString(36).substr(2, 9)
            }))
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
        } catch (err) {
            alert('Failed to reorder items');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveHeroItem = async () => {
        if (!heroForm.category || !heroForm.featuredImage || !preferences) return;

        let updatedFeatured;
        if (editingHeroId) {
            updatedFeatured = preferences.featuredCategories.map(item =>
                item.id === editingHeroId ? { ...heroForm, id: editingHeroId } : item
            );
        } else {
            updatedFeatured = [
                ...preferences.featuredCategories,
                { ...heroForm, id: Date.now().toString() }
            ];
        }

        const updatedPrefs = {
            ...preferences,
            featuredCategories: updatedFeatured.map(item => ({
                ...item,
                id: item.id || Math.random().toString(36).substr(2, 9)
            }))
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
            setHeroForm({ category: '', title: '', description: '', featuredImage: '', link: '' });
            setEditingHeroId(null);
        } catch (err) {
            alert('Failed to save hero item');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteHeroItem = async (id: string) => {
        if (!preferences) return;
        if (!confirm('Are you sure you want to delete this hero slide?')) return;

        const updatedPrefs = {
            ...preferences,
            featuredCategories: preferences.featuredCategories.filter(f => f.id !== id)
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
        } catch (err) {
            alert('Failed to delete hero item');
        } finally {
            setIsSaving(false);
        }
    };

    const startEditingHero = (item: any) => {
        setEditingHeroId(item.id);
        setHeroForm({
            category: item.category,
            title: item.title || '',
            description: item.description || '',
            featuredImage: item.featuredImage || '',
            link: item.link || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-bold bg-surface-50 min-h-screen">Loading Managers...</div>;

    return (
        <div className="flex min-h-screen bg-surface-50">
            <AdminSidebar />

            <main className="flex-1 py-12 px-10">
                <div className="max-w-5xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-black mb-2 px-1">Preferences Management</h1>
                        <p className="text-surface-800/60 font-medium px-1">Control the metadata, categories, and hero features of the platform.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <nav className="space-y-2">
                            {(['TAGS', 'CATEGORIES', 'CITIES', 'FEATURED'] as const).map(manager => (
                                <button
                                    key={manager}
                                    onClick={() => setActiveManager(manager)}
                                    className={`w-full text-left px-5 py-3 rounded-xl font-bold transition-all ${activeManager === manager
                                        ? 'bg-white text-primary shadow-sm border-l-4 border-primary'
                                        : 'bg-surface-50 border border-surface-200 text-surface-800/60 hover:border-primary/50'
                                        }`}
                                >
                                    {manager.charAt(0) + manager.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </nav>

                        <div className="md:col-span-3">
                            <section className="bg-white p-8 rounded-3xl border border-surface-200 shadow-premium relative min-h-[500px]">
                                {isSaving && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                )}

                                {activeManager === 'TAGS' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-black">Platform Tags</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newTag}
                                                onChange={(e) => setNewTag(e.target.value)}
                                                placeholder="New tag name..."
                                                className="flex-1 px-4 py-2 rounded-xl border border-surface-200 outline-none focus:border-primary"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                            />
                                            <button
                                                onClick={handleAddTag}
                                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-3 pt-4">
                                            {preferences?.tags.map(tag => (
                                                <div key={tag.id} className="group relative">
                                                    <TagChip label={tag.name} />
                                                    <button
                                                        onClick={() => handleDeleteTag(tag.id)}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeManager === 'CATEGORIES' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-black">Categories</h2>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                placeholder="New category name..."
                                                className="flex-1 px-4 py-2 rounded-xl border border-surface-200 outline-none focus:border-primary"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                            />
                                            <button
                                                onClick={handleAddCategory}
                                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {preferences?.categories.map(cat => (
                                                <div key={cat.id} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-100">
                                                    <span className="font-bold">{cat.name}</span>
                                                    <div className="flex gap-4 items-center">
                                                        <span className="text-xs font-bold text-surface-800/40 uppercase tracking-tighter">{cat.count || 0} Events</span>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="text-surface-800/20 hover:text-rose-500 transition-colors"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeManager === 'CITIES' && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-black">Cities</h2>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCity}
                                                onChange={(e) => setNewCity(e.target.value)}
                                                placeholder="New city name..."
                                                className="flex-1 px-4 py-2 rounded-xl border border-surface-200 outline-none focus:border-primary"
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                                            />
                                            <button
                                                onClick={handleAddCity}
                                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {preferences?.cities?.map(city => (
                                                <div key={city} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-100">
                                                    <span className="font-bold">{city}</span>
                                                    <button
                                                        onClick={() => handleDeleteCity(city)}
                                                        className="text-surface-800/20 hover:text-rose-500 transition-colors"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeManager === 'FEATURED' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-black">Hero Carousel Manager</h2>
                                            {editingHeroId && (
                                                <button
                                                    onClick={() => {
                                                        setEditingHeroId(null);
                                                        setHeroForm({ category: '', title: '', description: '', featuredImage: '', link: '' });
                                                    }}
                                                    className="text-xs font-bold text-rose-500 hover:underline"
                                                >
                                                    Cancel Editing
                                                </button>
                                            )}
                                        </div>

                                        {/* Editor Form */}
                                        <div className="p-6 bg-surface-100/50 rounded-2xl border border-surface-200 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-surface-500 ml-1">Category Link</label>
                                                    <select
                                                        value={heroForm.category}
                                                        onChange={(e) => setHeroForm({ ...heroForm, category: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-xl border border-surface-200 bg-white"
                                                    >
                                                        <option value="">Select Category...</option>
                                                        {preferences?.categories.map(c => (
                                                            <option key={c.id} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-surface-500 ml-1">Custom Title</label>
                                                    <input
                                                        type="text"
                                                        value={heroForm.title}
                                                        onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                                                        placeholder="Hero Headline..."
                                                        className="w-full px-4 py-2 rounded-xl border border-surface-200 bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-surface-500 ml-1">Description</label>
                                                <textarea
                                                    value={heroForm.description}
                                                    onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                                                    placeholder="Slide descriptive text..."
                                                    className="w-full px-4 py-2 rounded-xl border border-surface-200 bg-white h-20 resize-none"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-surface-500 ml-1">Hero Image</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={heroForm.featuredImage}
                                                        onChange={(e) => setHeroForm({ ...heroForm, featuredImage: e.target.value })}
                                                        placeholder="Image URL or upload..."
                                                        className="flex-1 px-4 py-3 rounded-xl border border-surface-200 bg-white text-sm"
                                                    />
                                                    <div className="relative h-[46px]">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleHeroImageUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            disabled={isUploadingHero}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={`h-full px-6 border border-surface-200 rounded-xl bg-surface-50 text-xs font-black uppercase tracking-wider transition-all shadow-sm ${isUploadingHero ? 'animate-pulse text-primary' : 'hover:bg-surface-100 hover:border-primary/30 active:scale-95'}`}
                                                        >
                                                            {isUploadingHero ? '⏳ Uploading...' : '📁 Upload Image'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleSaveHeroItem}
                                                disabled={!heroForm.category || !heroForm.featuredImage}
                                                className="w-full py-3 bg-brand-gradient text-white font-black rounded-xl shadow-lg disabled:opacity-50 transform active:scale-[0.98] transition-all"
                                            >
                                                {editingHeroId ? 'Update Hero Slide' : 'Add to Hero Carousel'}
                                            </button>
                                        </div>

                                        {/* List */}
                                        <div className="space-y-4 pt-4 border-t border-surface-200">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-surface-400">Current Items & Priority</h3>
                                            {preferences?.featuredCategories.map((f, i) => (
                                                <div key={f.id || i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow group">
                                                    <div className="w-16 h-20 rounded-lg bg-surface-100 overflow-hidden flex-shrink-0 border border-surface-200 relative">
                                                        <img src={f.featuredImage} className="w-full h-full object-cover" alt={f.category} />
                                                        <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded font-bold">
                                                            #{i + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                {f.category}
                                                            </span>
                                                            <h4 className="font-bold truncate">{f.title || `Best of ${f.category} Shows`}</h4>
                                                        </div>
                                                        <p className="text-xs text-surface-500 line-clamp-2 italic">
                                                            {f.description || `Explore our curated selection of ${f.category.toLowerCase()} events.`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                disabled={i === 0}
                                                                onClick={() => handleReorderFeatured(i, i - 1)}
                                                                className="p-1 hover:bg-surface-50 rounded disabled:opacity-20 transition-colors"
                                                            >
                                                                ▲
                                                            </button>
                                                            <button
                                                                disabled={i === (preferences.featuredCategories.length - 1)}
                                                                onClick={() => handleReorderFeatured(i, i + 1)}
                                                                className="p-1 hover:bg-surface-50 rounded disabled:opacity-20 transition-colors"
                                                            >
                                                                ▼
                                                            </button>
                                                        </div>
                                                        <div className="h-8 w-px bg-surface-200" />
                                                        <button
                                                            onClick={() => startEditingHero(f)}
                                                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHeroItem(f.id)}
                                                            className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            🗑️
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
            </main>
        </div>
    );
}
