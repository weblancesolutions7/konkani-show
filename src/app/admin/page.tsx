
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminTable from '@/components/admin/AdminTable';
import { API_ROUTES } from '@/config/api';
import { Event } from '@/types';
import WorldLocationPicker, { LocationData } from '@/components/event/WorldLocationPicker';

type AdminTab = 'PENDING' | 'APPROVED' | 'DELETED';

// Edit Modal Component
function EditModal({ event, onClose, onSave }: { event: Event; onClose: () => void; onSave: () => void }) {
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description);
    const [date, setDate] = useState(event.date);
    const [time, setTime] = useState(event.time);
    
    // Initialize WorldLocationData from existing Event schema
    const [locationData, setLocationData] = useState<LocationData | null>(() => {
        if (event.locationDetails) {
            return {
                ...event.locationDetails,
                lat: event.locationCoords ? event.locationCoords.coordinates[1] : 12.9141,
                lng: event.locationCoords ? event.locationCoords.coordinates[0] : 74.8560
            };
        }
        return null;
    });

    const [category, setCategory] = useState(event.category);
    const [entry, setEntry] = useState(event.entry || '');
    const [meetingLink, setMeetingLink] = useState(event.meetingLink || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Create fallback display string
            const displayParts = [];
            if (locationData?.venueAddress) displayParts.push(locationData.venueAddress);
            if (locationData?.city) displayParts.push(locationData.city);
            if (locationData?.state) displayParts.push(locationData.state);
            if (locationData?.country) displayParts.push(locationData.country);
            const locationString = displayParts.join(', ') || event.location;

            const response = await fetch(API_ROUTES.EVENT_BY_ID(event.id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    date,
                    time,
                    location: locationString,
                    locationDetails: locationData,
                    locationCoords: locationData ? {
                        type: 'Point',
                        coordinates: [locationData.lng, locationData.lat]
                    } : undefined,
                    category,
                    entry,
                    meetingLink,
                }),
            });
            if (!response.ok) throw new Error('Failed to update');
            onSave();
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update event.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black">Edit Event</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors font-bold">✕</button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-surface-50 rounded-xl border-2 border-transparent focus:border-primary outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full p-4 bg-surface-50 rounded-xl border-2 border-transparent focus:border-primary outline-none font-medium resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Date</label>
                            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-surface-50 rounded-xl border-2 border-transparent focus:border-primary outline-none font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Time</label>
                            <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-4 bg-surface-50 rounded-xl border-2 border-transparent focus:border-primary outline-none font-bold" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Event Location Details</label>
                        <WorldLocationPicker 
                            value={locationData || undefined}
                            onChange={(data) => setLocationData(data)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Category</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-surface-50 rounded-xl border-2 border-transparent focus:border-primary outline-none font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Entry Fee</label>
                            <input type="text" value={entry} onChange={(e) => setEntry(e.target.value)} className="w-full p-4 bg-surface-50 rounded-xl border-2 border-transparent focus:border-primary outline-none font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-surface-800/40">Meeting Link</label>
                            <input type="text" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="w-full p-4 bg-surface-50 rounded-xl border-2 border-transparent focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-4 bg-primary text-white font-black rounded-xl shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                    <button onClick={onClose} className="px-8 py-4 bg-surface-100 text-surface-800 font-bold rounded-xl hover:bg-surface-200 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>('PENDING');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchEvents = async (status?: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (status) params.set('status', status);
            const response = await fetch(`${API_ROUTES.EVENTS}?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Fetch failed:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents(activeTab);
    }, [activeTab]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const response = await fetch(API_ROUTES.EVENT_STATUS(id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });
            if (!response.ok) throw new Error('Failed to approve');
            fetchEvents(activeTab);
        } catch (error) {
            console.error('Approve failed:', error);
            alert('Failed to approve event.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            const response = await fetch(API_ROUTES.EVENT_STATUS(id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'REJECTED' }),
            });
            if (!response.ok) throw new Error('Failed to reject');
            fetchEvents(activeTab);
        } catch (error) {
            console.error('Reject failed:', error);
            alert('Failed to reject event.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        setActionLoading(id);
        try {
            const response = await fetch(API_ROUTES.EVENT_BY_ID(id), {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete');
            fetchEvents(activeTab);
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete event.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEdit = (id: string) => {
        const event = events.find(e => e.id === id);
        if (event) setEditingEvent(event);
    };

    const handleSeedData = async () => {
        if (!confirm('This will reset all events and seed sample data. Continue?')) return;
        try {
            const response = await fetch(API_ROUTES.SEED, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to seed');
            alert('Database seeded successfully!');
            fetchEvents(activeTab);
        } catch (error) {
            console.error('Seed failed:', error);
            alert('Failed to seed database.');
        }
    };

    return (
        <div className="flex min-h-screen bg-surface-100">
            <AdminSidebar onSeedData={handleSeedData} />
            
            <main className="flex-1 py-12 px-10">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-3xl font-black text-foreground">Events Dashboard</h1>
                        <p className="text-surface-800/60 font-medium">Approve, edit, or remove community events and shows.</p>
                    </header>

                    <section className="bg-surface-50 rounded-3xl p-8 shadow-premium border border-surface-200">
                        <div className="flex border-b border-surface-100 mb-8 overflow-x-auto">
                            {(['PENDING', 'APPROVED', 'DELETED'] as AdminTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-4 font-black transition-all border-b-4 ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-surface-800/40 hover:text-surface-800'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-16 w-full bg-surface-100 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <AdminTable
                                events={events}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                            />
                        )}
                        {/* Edit Modal */}
                        {editingEvent && (
                            <EditModal
                                event={editingEvent}
                                onClose={() => setEditingEvent(null)}
                                onSave={() => fetchEvents(activeTab)}
                            />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
