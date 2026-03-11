
'use client';

import React, { useState } from 'react';
import { usePreferences } from '@/hooks/usePreferences';
import { API_ROUTES } from '@/config/api';
import OTPInput from '@/components/ui/OTPInput';
import TagChip from '@/components/ui/TagChip';

export default function SubmitEventPage() {
    const { preferences } = usePreferences();
    const [step, setStep] = useState<'AUTH' | 'FORM' | 'SUCCESS'>('AUTH');
    const [phone, setPhone] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [entry, setEntry] = useState('');
    const [meetingLink, setMeetingLink] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
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
                setImageUrl(data.secure_url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            const reader = new FileReader();
            reader.onloadend = () => setImageUrl(reader.result as string);
            reader.readAsDataURL(file);
        } finally {
            setUploading(false);
        }
    };

    const handleAuthComplete = (otp: string) => {
        console.log('OTP Verified:', otp);
        setStep('FORM');
    };

    const toggleTag = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            setSelectedTags(selectedTags.filter(t => t !== tagName));
        } else if (selectedTags.length < 10) {
            setSelectedTags([...selectedTags, tagName]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Date and Time must be in the future
        const now = new Date();
        const selectedDateTime = new Date(`${date}T${time}`);

        if (selectedDateTime <= now) {
            alert('Please select a future date and time for your event.');
            return;
        }

        setSubmitting(true);

        try {
            const eventData = {
                title,
                description,
                date,
                time,
                location,
                category: category || preferences?.categories[0]?.name || 'Drama',
                tags: selectedTags,
                featureImage: imageUrl,
                gallery: [],
                entry,
                meetingLink,
            };

            const response = await fetch(API_ROUTES.CREATE_EVENT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) throw new Error('Failed to submit event');

            // Reset form
            setTitle('');
            setDescription('');
            setDate('');
            setTime('');
            setLocation('');
            setCategory('');
            setSelectedTags([]);
            setImageUrl('');
            setEntry('');
            setMeetingLink('');
            setStep('SUCCESS');
        } catch (error) {
            console.error('Submit failed:', error);
            alert('Failed to submit event. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 'AUTH') {
        return (
            <div className="min-h-[90vh] flex items-center justify-center bg-white p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 -right-24 w-64 h-64 bg-accent rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="max-w-md w-full relative">
                    <div className="p-10 bg-white rounded-[2.5rem] shadow-premium border border-surface-200 relative z-10 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mb-8 mx-auto transform -rotate-6">
                            🔐
                        </div>

                        <h1 className="text-3xl font-black text-center mb-3 tracking-tight">Verify Identity</h1>
                        <p className="text-center text-surface-800/60 mb-10 font-medium leading-relaxed">
                            Sign in to your account or verify your identity to list a new event on our platform.
                        </p>

                        <div className="space-y-8">
                            <div className="group">
                                <label className="block text-[11px] font-black mb-2 uppercase tracking-[0.2em] text-surface-800/30 group-focus-within:text-primary transition-colors">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-800/40 font-bold">+91</span>
                                    <input
                                        type="tel"
                                        placeholder="00000 00000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-16 pr-5 py-4 bg-surface-50 border-2 border-surface-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-lg shadow-inner group-hover:border-surface-200"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => { }}
                                disabled={!phone}
                                className="w-full py-4.5 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:grayscale transform active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                <span>Send OTP</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-surface-200 opacity-50"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-4 bg-white text-[10px] font-black uppercase tracking-widest text-surface-800/30">Verification Code</span>
                                </div>
                            </div>

                            <div>
                                <OTPInput onComplete={handleAuthComplete} />
                            </div>
                        </div>
                    </div>

                    <p className="text-center mt-8 text-xs text-surface-800/40 leading-relaxed max-w-[280px] mx-auto">
                        By continuing, you agree to our Terms of Service and Privacy Policy. Securely managed by Mandd Sobhann.
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'SUCCESS') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-white p-6">
                <div className="max-w-xl w-full text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full animate-bounce" />
                        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
                        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-300" />
                    </div>

                    <div className="p-12 md:p-16 bg-white rounded-[3rem] shadow-premium border border-surface-200">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-10 shadow-inner animate-in zoom-in duration-500">
                            🎉
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Show&apos;s on the Way!</h1>
                        <p className="text-surface-800/60 text-lg mb-12 font-medium leading-relaxed max-w-sm mx-auto">
                            Your event has been submitted. Our team at <span className="text-primary font-bold">Mandd Sobhann</span> will review it shortly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-10 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95"
                            >
                                Back to Main App
                            </button>
                            <button
                                onClick={() => setStep('FORM')}
                                className="px-10 py-4 bg-surface-50 text-surface-900 border border-surface-200 font-bold rounded-2xl hover:bg-white hover:border-primary transition-all active:scale-95"
                            >
                                Submit Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white py-12 md:py-20 px-6">
            <div className="max-w-5xl mx-auto">
                <header className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-full mb-4 border border-primary/10">
                            Partner Portal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Submit Your Show</h1>
                        <p className="text-surface-800/50 text-lg font-medium">Create a stunning listing for your upcoming Konkani event.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-surface-50 p-2 rounded-2xl border border-surface-200 self-center md:self-auto shadow-sm">
                        <div className="px-6 py-2 bg-white text-primary text-xs font-black uppercase tracking-widest rounded-xl shadow-sm">Step 2 of 2</div>
                        <div className="w-12 h-1.5 bg-primary rounded-full" />
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Column: Form Content */}
                        <div className="lg:col-span-8 space-y-10">
                            <section className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-surface-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-primary/40 group-focus-within:bg-primary transition-colors" />
                                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                    <span className="text-2xl">📝</span> Basic Information
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Date</label>
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
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

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Venue Location</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40">📍</span>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Venue Name, City"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full p-5 pl-12 bg-surface-50 rounded-2xl outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-surface-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-accent/40 group-focus-within:bg-accent transition-colors" />
                                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                    <span className="text-2xl">🏷️</span> Classification
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
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
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
                                        <label className="text-[10px] font-black uppercase tracking-widest text-surface-800/40 ml-1">Event Poster (Feature Image)</label>
                                        <div className="relative group/upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                disabled={uploading}
                                            />
                                            <div className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${imageUrl ? 'border-primary/20 bg-primary/5' : 'border-surface-200 bg-white group-hover/upload:border-primary group-hover/upload:bg-primary/5'}`}>
                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-[10px] font-bold text-primary italic">Uploading...</span>
                                                    </div>
                                                ) : imageUrl ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xl">✅</span>
                                                        <span className="text-[10px] font-bold text-primary">Poster Uploaded</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-2xl mb-2">📸</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-surface-400 group-hover/upload:text-primary transition-colors">Click to Upload Poster</span>
                                                        <span className="text-[8px] text-surface-400 mt-1">Recommended: 1200x1800 (2:3)</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {imageUrl && (
                                        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-surface-200 shadow-sm animate-in fade-in zoom-in duration-300">
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setImageUrl('')}
                                                className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-white transition-colors"
                                            >
                                                ✕
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
                                        disabled={uploading || !imageUrl || submitting}
                                        className="w-full py-5 bg-primary text-white font-black text-lg rounded-[1.5rem] shadow-premium hover:bg-primary-dark transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:transform-none"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            'Submit for Approval'
                                        )}
                                    </button>
                                </div>
                            </section>

                            <div className="p-8 bg-brand-gradient rounded-[2.5rem] text-white shadow-premium">
                                <h4 className="font-black text-sm uppercase tracking-widest mb-4">Why List with us?</h4>
                                <ul className="space-y-4 text-sm opacity-90 font-bold">
                                    <li className="flex gap-2"><span>✓</span> Reach 50,000+ local fans</li>
                                    <li className="flex gap-2"><span>✓</span> Automated SMS Marketing</li>
                                    <li className="flex gap-2"><span>✓</span> Direct WhatsApp booking</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}
