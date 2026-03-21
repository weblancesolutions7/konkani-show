
'use client';

import React, { useState } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import { useNotification } from '@/components/ui/NotificationProvider';
import { Trash2, Pencil, ChevronUp, ChevronDown, Upload, Plus, Info, Loader2, X } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export default function BannersPage() {
    const { showAlert, showConfirm } = useNotification();
    const { preferences, loading, updatePreferences } = usePreferences();
    const [isSaving, setIsSaving] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 5;

    // Hero Manager State
    const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
    const [heroForm, setHeroForm] = useState({
        imageUrl: '',
        link: ''
    });
    const [isUploadingHero, setIsUploadingHero] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Strict Size Validation: 1920 x 480
        const dimensions = await getImageDimensions(file);
        if (dimensions.width !== 1920 || dimensions.height !== 480) {
            showAlert(`Invalid dimensions: ${dimensions.width}x${dimensions.height}. Hero Banner must be exactly 1920x480 px.`, 'Image Dimension Error');
            return;
        }

        setIsUploadingHero(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.secure_url) {
                setHeroForm(prev => ({ ...prev, imageUrl: data.secure_url }));
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showAlert('Upload failed. Please check your AWS S3 configuration.', 'Upload Error');
        } finally {
            setIsUploadingHero(false);
        }
    };

    const handleReorderFeatured = async (fromIndex: number, toIndex: number) => {
        if (!preferences) return;
        const newFeatured = [...preferences.heroBanners];
        const [removed] = newFeatured.splice(fromIndex, 1);
        newFeatured.splice(toIndex, 0, removed);

        const updatedPrefs = {
            ...preferences,
            heroBanners: newFeatured.map(item => ({
                ...item,
                id: item.id || Math.random().toString(36).substr(2, 9)
            }))
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
        } catch (err) {
            showAlert('Failed to reorder items', 'Error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveHeroItem = async () => {
        if (!heroForm.imageUrl || !preferences) return;

        let updatedBanners;
        if (editingHeroId) {
            updatedBanners = (preferences.heroBanners || []).map(item =>
                item.id === editingHeroId ? { ...heroForm, id: editingHeroId } : item
            );
        } else {
            updatedBanners = [
                ...(preferences.heroBanners || []),
                { ...heroForm, id: Date.now().toString() }
            ];
        }

        const updatedPrefs = {
            ...preferences,
            heroBanners: updatedBanners.map(item => ({
                ...item,
                id: item.id || Math.random().toString(36).substr(2, 9)
            }))
        };

        setIsSaving(true);
        try {
            await updatePreferences(updatedPrefs);
            setHeroForm({ imageUrl: '', link: '' });
            setEditingHeroId(null);
            setIsModalOpen(false);
        } catch (err) {
            showAlert('Failed to save hero item', 'Error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteHeroItem = async (id: string) => {
        if (!preferences) return;
        showConfirm('Are you sure you want to delete this hero slide?', async () => {
            const updatedPrefs = {
                ...preferences,
                heroBanners: (preferences.heroBanners || []).filter(f => f.id !== id)
            };

            setIsSaving(true);
            try {
                await updatePreferences(updatedPrefs);
            } catch (err) {
                showAlert('Failed to delete hero item', 'Error');
            } finally {
                setIsSaving(false);
            }
        });
    };

    const startEditingHero = (item: any) => {
        setEditingHeroId(item.id);
        setHeroForm({
            imageUrl: item.imageUrl || '',
            link: item.link || ''
        });
        setIsModalOpen(true);
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-bold bg-surface-50 min-h-screen">Loading Banner Manager...</div>;

    return (
        <div className="py-12 px-10">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black mb-2 px-1">Hero Banners</h1>
                        <p className="text-surface-800/60 font-medium px-1">Manage the promotional banners for the home page carousel (1920x480).</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingHeroId(null);
                            setHeroForm({ imageUrl: '', link: '' });
                            setIsModalOpen(true);
                        }}
                        className="px-6 py-3 bg-brand-gradient text-white font-black shadow-lg transform active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add New Banner
                    </button>
                </header>

                <section className="bg-white p-8 rounded-3xl border border-surface-200 shadow-premium relative min-h-[500px]">
                    {isSaving && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 ">
                            <div className="animate-spin  h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}

                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black">Current Carousel Slides</h2>
                        </div>

                        {/* Modal Overlay */}
                        {isModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                <div className="bg-white w-full max-w-2xl rounded-3xl shadow-premium relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                                    <div className="p-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-3xl font-black">{editingHeroId ? 'Edit Hero Banner' : 'Add New Hero Banner'}</h2>
                                            <button
                                                onClick={() => {
                                                    setIsModalOpen(false);
                                                    setEditingHeroId(null);
                                                    setHeroForm({ imageUrl: '', link: '' });
                                                }}
                                                className="p-3 hover:bg-surface-100 rounded-full transition-colors text-surface-400 hover:text-surface-900"
                                            >
                                                <X size={28} />
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-[11px] font-black uppercase text-surface-500 tracking-wider">Banner Image (1920x480)</label>
                                                    <div className="relative group">
                                                        <button type="button" className="text-primary text-[10px] font-black bg-primary/10 w-6 h-6 flex items-center justify-center rounded-full">
                                                            <Info size={14} strokeWidth={3} />
                                                        </button>
                                                        <div className="absolute right-0 bottom-full pb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
                                                            <div className="p-3 bg-black text-white text-[10px] font-bold rounded-xl shadow-xl">
                                                                To get image <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">click here</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        value={heroForm.imageUrl}
                                                        onChange={(e) => setHeroForm({ ...heroForm, imageUrl: e.target.value })}
                                                        placeholder="Image URL or upload..."
                                                        className="flex-1 px-5 py-4 rounded-xl border border-surface-200 bg-white text-sm focus:border-primary outline-none transition-all"
                                                    />
                                                    <div className="relative h-[58px]">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleHeroImageUpload}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            disabled={isUploadingHero}
                                                        />
                                                        <button
                                                            type="button"
                                                            className={`h-full px-8 border border-surface-200 rounded-xl bg-surface-50 text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 ${isUploadingHero ? 'animate-pulse text-primary' : 'hover:bg-surface-100 hover:border-primary/30 active:scale-95'}`}
                                                        >
                                                            {isUploadingHero ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                                            {isUploadingHero ? 'Uploading...' : 'Upload Image'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black uppercase text-surface-500 ml-1 tracking-wider">Redirect Link (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={heroForm.link}
                                                    onChange={(e) => setHeroForm({ ...heroForm, link: e.target.value })}
                                                    placeholder="URL when clicked (e.g. /events/my-show)..."
                                                    className="w-full px-5 py-4 rounded-xl border border-surface-200 bg-white focus:border-primary outline-none transition-all"
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-6">
                                                <button
                                                    onClick={() => {
                                                        setIsModalOpen(false);
                                                        setEditingHeroId(null);
                                                        setHeroForm({ imageUrl: '', link: '' });
                                                    }}
                                                    className="flex-1 py-4 border border-surface-200 rounded-xl font-bold hover:bg-surface-100 transition-all active:scale-[0.98]"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveHeroItem}
                                                    disabled={!heroForm.imageUrl || isSaving}
                                                    className="flex-[2] py-4 bg-brand-gradient text-white font-black rounded-xl shadow-lg disabled:opacity-50 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                >
                                                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : (editingHeroId ? <Pencil size={20} /> : <Plus size={20} />)}
                                                    {editingHeroId ? 'Update Banner' : 'Add to Carousel'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* List */}
                        <div className="space-y-4 pt-4 border-t border-surface-200">
                            <h3 className="text-sm font-black uppercase tracking-widest text-surface-400">Current Banners & Priority</h3>
                            {(() => {
                                const banners = preferences?.heroBanners || [];
                                const paginatedBanners = banners.slice((page - 1) * limit, page * limit);
                                
                                return (
                                    <>
                                        {paginatedBanners.map((f, i) => {
                                            const globalIndex = (page - 1) * limit + i;
                                            return (
                                                <div key={f.id || globalIndex} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-surface-200 shadow-sm hover:shadow-md transition-shadow group">
                                                    <div className="w-24 h-12 rounded-xl bg-surface-100 overflow-hidden flex-shrink-0 border border-surface-200 relative">
                                                        <img src={f.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                                                        <div className="absolute top-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded-full font-bold">
                                                            #{globalIndex + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-surface-500 truncate italic">
                                                            {f.link || 'Internal Page (No Link)'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col gap-0.5">
                                                            <button
                                                                disabled={globalIndex === 0}
                                                                onClick={() => handleReorderFeatured(globalIndex, globalIndex - 1)}
                                                                className="p-1 hover:bg-surface-50 rounded disabled:opacity-20 transition-colors text-surface-400 hover:text-primary"
                                                                title="Move Up"
                                                            >
                                                                <ChevronUp size={16} strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                disabled={globalIndex === (banners.length - 1)}
                                                                onClick={() => handleReorderFeatured(globalIndex, globalIndex + 1)}
                                                                className="p-1 hover:bg-surface-50 rounded disabled:opacity-20 transition-colors text-surface-400 hover:text-primary"
                                                                title="Move Down"
                                                            >
                                                                <ChevronDown size={16} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                        <div className="h-8 w-px bg-surface-200" />
                                                        <button
                                                            onClick={() => startEditingHero(f)}
                                                            className="p-2 hover:bg-primary/10 text-primary  transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHeroItem(f.id)}
                                                            className="p-2 hover:bg-rose-50 text-rose-500  transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {banners.length > limit && (
                                            <div className="pt-6 border-t border-surface-100">
                                                <Pagination 
                                                    currentPage={page}
                                                    totalPages={Math.ceil(banners.length / limit)}
                                                    onPageChange={setPage}
                                                    totalItems={banners.length}
                                                    itemsPerPage={limit}
                                                />
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

