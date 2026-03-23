'use client';

import React, { useState, useEffect } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import TagChip from '@/components/ui/TagChip';
import WorldLocationPicker, { LocationData } from '@/components/event/WorldLocationPicker';
import { useNotification } from '@/components/ui/NotificationProvider';
import {
    FileText,
    Tag,
    ChevronDown,
    Info,
    Camera,
    X,
    CheckCircle,
    Check,
    Loader2
} from 'lucide-react';
import { Event } from '@/types';

interface EventFormProps {
    initialData?: Event;
    onSubmit: (eventData: any) => Promise<void>;
    isSubmitting: boolean;
    submitLabel?: string;
    isAdmin?: boolean;
}

export default function EventForm({ initialData, onSubmit, isSubmitting, submitLabel, isAdmin }: EventFormProps) {
    const { showAlert } = useNotification();
    const { preferences } = usePreferences();

    // Form state
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || '');
    const [time, setTime] = useState(initialData?.time || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
    const [imageUrl, setImageUrl] = useState(initialData?.featureImage || '');
    const [detailImageUrl, setDetailImageUrl] = useState(initialData?.detailImage || '');
    const [locationData, setLocationData] = useState<LocationData | null>(() => {
        if (initialData?.locationDetails) {
            return {
                ...initialData.locationDetails,
                lat: initialData.locationCoords ? initialData.locationCoords.coordinates[1] : 12.9141,
                lng: initialData.locationCoords ? initialData.locationCoords.coordinates[0] : 74.8560
            };
        }
        return null;
    });
    const [category, setCategory] = useState(initialData?.category || '');
    const [entry, setEntry] = useState(initialData?.entry || '');
    const [meetingLink, setMeetingLink] = useState(initialData?.meetingLink || '');
    const [contactNumber, setContactNumber] = useState(initialData?.contactNumber || '');

    const [uploading, setUploading] = useState(false);
    const [detailUploading, setDetailUploading] = useState(false);

    useEffect(() => {
        if (!category && preferences?.categories.length) {
            setCategory(preferences.categories[0].name);
        }
    }, [preferences, category]);

    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'card' | 'detail') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const dimensions = await getImageDimensions(file);
        if (type === 'card') {
            if (dimensions.width !== 800 || dimensions.height !== 1200) {
                showAlert(`Invalid dimensions: ${dimensions.width}x${dimensions.height}. Card image must be exactly 800x1200 px.`, 'Image Dimension Error');
                return;
            }
            setUploading(true);
        } else {
            if (dimensions.width !== 1920 || dimensions.height !== 1080) {
                showAlert(`Invalid dimensions: ${dimensions.width}x${dimensions.height}. Detailed screen image must be exactly 1920x1080 px.`, 'Image Dimension Error');
                return;
            }
            setDetailUploading(true);
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.secure_url) {
                if (type === 'card') setImageUrl(data.secure_url);
                else setDetailImageUrl(data.secure_url);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showAlert('Upload failed. Please check your cloud configuration.', 'Upload Error');
        } finally {
            setUploading(false);
            setDetailUploading(false);
        }
    };

    const toggleTag = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            setSelectedTags(selectedTags.filter(t => t !== tagName));
        } else if (selectedTags.length < 10) {
            setSelectedTags([...selectedTags, tagName]);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Date and Time
        if (date && time) {
            const now = new Date();
            const selectedDateTime = new Date(`${date}T${time}`);
            if (selectedDateTime <= now && !initialData) { // Only enforce future date for new events
                showAlert('Please select a future date and time for your event.', 'Invalid Date');
                return;
            }
        }

        const displayParts = [];
        if (locationData?.venueAddress) displayParts.push(locationData.venueAddress);
        if (locationData?.city) displayParts.push(locationData.city);
        if (locationData?.state) displayParts.push(locationData.state);
        if (locationData?.country) displayParts.push(locationData.country);
        const locationString = displayParts.join(', ') || initialData?.location || 'Online / TBD';

        // Extract numeric price from entry string if possible
        let numericPrice = 0;
        if (entry) {
            const match = entry.match(/\d+/);
            if (match) numericPrice = parseInt(match[0], 10);
            else if (entry.toLowerCase().includes('free')) numericPrice = 0;
            else if (entry.toLowerCase().includes('paid')) numericPrice = 1; // Default min paid
        }

        const eventData = {
            title,
            description,
            date,
            time,
            location: locationString,
            locationDetails: locationData,
            locationCoords: locationData ? {
                type: 'Point',
                coordinates: [locationData.lng, locationData.lat]
            } : initialData?.locationCoords,
            category: category || preferences?.categories[0]?.name || 'Drama',
            tags: selectedTags,
            featureImage: imageUrl,
            detailImage: detailImageUrl,
            gallery: initialData?.gallery || [],
            entry,
            price: numericPrice,
            meetingLink,
            contactNumber,
        };

        await onSubmit(eventData);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Form Content */}
                <div className="lg:col-span-8 space-y-10">
                    <section className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-surface-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary/40 group-focus-within:bg-primary transition-colors" />
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <FileText size={24} className="text-primary" /> Basic Information
                        </h2>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Event Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Traditional Konkani Drama Night"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-5 bg-surface-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary transition-all font-bold text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Description</label>
                                <textarea
                                    required
                                    placeholder="Describe your event in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full p-5 bg-surface-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 border-2 border-transparent focus:border-primary transition-all font-bold resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Contact Number</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. +91 98765 43210"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    className="w-full p-5 bg-surface-50 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={!initialData ? new Date().toISOString().split('T')[0] : undefined}
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full p-5 bg-surface-50 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full p-5 bg-surface-50 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <WorldLocationPicker
                                    value={locationData || undefined}
                                    onChange={(data) => setLocationData(data)}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-surface-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-accent/40 group-focus-within:bg-accent transition-colors" />
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <Tag size={24} className="text-accent" /> Classification
                        </h2>

                        <div className="space-y-10">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Event Category</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full p-5 bg-surface-50 rounded-2xl outline-none appearance-none font-bold focus:bg-white border-2 border-transparent focus:border-accent transition-all cursor-pointer"
                                    >
                                        {preferences?.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                        <ChevronDown size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Popular Tags (Select up to 10)</label>
                                <div className="flex flex-wrap gap-2 p-1">
                                    {preferences?.tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.name)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <TagChip
                                                label={tag.name}
                                                variant={selectedTags.includes(tag.name) ? 'primary' : 'outline'}
                                                className={`cursor-pointer !px-6 !py-2.5 !text-xs ${selectedTags.includes(tag.name) ? 'shadow-lg ring-4 ring-primary/10' : ''}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Sidebar Actions/Media */}
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 h-fit">
                    <section className="p-8 bg-surface-50 rounded-[2.5rem] border border-surface-200 space-y-6">
                        <h3 className="text-lg font-black uppercase tracking-widest text-surface-800/40">Media & Cost</h3>

                        <div className="space-y-6 font-medium">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-800/40">Event Card (800x1200)</label>
                                    <div className="relative group">
                                        <button type="button" className="text-primary text-[10px] font-black bg-primary/10 w-5 h-5 flex items-center justify-center rounded-full">
                                            <Info size={12} strokeWidth={3} />
                                        </button>
                                        <div className="absolute right-0 bottom-full pb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
                                            <div className="p-3 bg-black text-white text-[10px] font-bold shadow-xl">
                                                To get image click here
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'card')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={uploading}
                                    />
                                    <div className={`w-full py-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${imageUrl ? 'border-primary/20 bg-primary/5' : 'border-surface-200 bg-white group-hover/upload:border-primary group-hover/upload:bg-primary/5'}`}>
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={24} className="animate-spin text-primary" />
                                                <span className="text-[10px] font-bold text-primary italic">Uploading...</span>
                                            </div>
                                        ) : imageUrl ? (
                                            <div className="flex flex-col items-center gap-1 text-primary">
                                                <CheckCircle size={28} strokeWidth={2.5} />
                                                <span className="text-[10px] font-black uppercase tracking-widest mt-1">Card Image Uploaded</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Camera size={32} className="mb-2 text-surface-400 group-hover/upload:text-primary transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-surface-400 group-hover/upload:text-primary transition-colors">Click to Upload Card Image</span>
                                                <span className="text-[8px] text-surface-400 mt-1">Required: 800x1200 px</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {imageUrl && (
                                <div className="relative aspect-[2/3] w-full rounded-3xl overflow-hidden border border-surface-200 shadow-sm animate-in fade-in zoom-in duration-300">
                                    <img src={imageUrl} alt="Card Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrl('')}
                                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-800/40">Detailed Screen (1920x1080)</label>
                                    <div className="relative group">
                                        <button type="button" className="text-primary text-[10px] font-black bg-primary/10 w-5 h-5 flex items-center justify-center rounded-full">
                                            <Info size={12} strokeWidth={3} />
                                        </button>
                                        <div className="absolute right-0 bottom-full pb-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
                                            <div className="p-3 bg-black text-white text-[10px] font-bold shadow-xl">
                                                To get image click here
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative group/upload-detail">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, 'detail')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        disabled={detailUploading}
                                    />
                                    <div className={`w-full py-8 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${detailImageUrl ? 'border-primary/20 bg-primary/5' : 'border-surface-200 bg-white group-hover-detail:border-primary group-hover-detail:bg-primary/5'}`}>
                                        {detailUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 size={24} className="animate-spin text-primary" />
                                                <span className="text-[10px] font-bold text-primary italic">Uploading...</span>
                                            </div>
                                        ) : detailImageUrl ? (
                                            <div className="flex flex-col items-center gap-1 text-primary">
                                                <CheckCircle size={28} strokeWidth={2.5} />
                                                <span className="text-[10px] font-black uppercase tracking-widest mt-1">Detail Image Uploaded</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Camera size={32} className="mb-2 text-surface-400 group-hover-detail:text-primary transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-surface-400 group-hover-detail:text-primary transition-colors">Click to Upload Detail Image</span>
                                                <span className="text-[8px] text-surface-400 mt-1">Required: 1920x1080 px</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {detailImageUrl && (
                                <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-surface-200 shadow-sm animate-in fade-in zoom-in duration-300">
                                    <img src={detailImageUrl} alt="Detail Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setDetailImageUrl('')}
                                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                    >
                                        <X size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-surface-800/40 ml-1">Entry Fee Detail</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Free, Paid ₹500"
                                    value={entry}
                                    onChange={(e) => setEntry(e.target.value)}
                                    className="w-full p-4 bg-white border border-surface-200 rounded-xl outline-none focus:border-primary transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-surface-800/40 ml-1">Meeting Link (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="zoom.us/abc..."
                                    value={meetingLink}
                                    onChange={(e) => setMeetingLink(e.target.value)}
                                    className="w-full p-4 bg-white border border-surface-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <button
                                type="submit"
                                disabled={uploading || detailUploading || !imageUrl || !detailImageUrl || isSubmitting}
                                className="w-full py-5 bg-primary text-white font-black text-lg rounded-[1.5rem] shadow-premium hover:bg-primary-dark transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    submitLabel || 'Submit for Approval'
                                )}
                            </button>
                        </div>
                    </section>

                    <div className="p-8 bg-brand-gradient rounded-[2.5rem] text-white shadow-premium">
                        <h4 className="font-black text-sm uppercase tracking-widest mb-4">Why List with us?</h4>
                        <ul className="space-y-4 text-sm opacity-90 font-bold">
                            <li className="flex gap-2"><Check size={16} strokeWidth={4} /> Reach 50,000+ local fans</li>
                            <li className="flex gap-2"><Check size={16} strokeWidth={4} /> Automated SMS Marketing</li>
                            <li className="flex gap-2"><Check size={16} strokeWidth={4} /> Direct WhatsApp booking</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    );
}
