
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTable from '@/components/admin/AdminTable';
import { API_ROUTES } from '@/config/api';
import { Event } from '@/types';
import { useNotification } from '@/components/ui/NotificationProvider';
import { Loader2, Star, Clock, CheckCircle, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';

type AdminView = 'featured' | 'timeline' | 'approval';
type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type TimelineStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export default function AdminDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = (searchParams.get('view') as AdminView) || 'approval';

    const { showAlert, showConfirm } = useNotification();
    const [activeStatus, setActiveStatus] = useState<ApprovalStatus>('PENDING');
    const [activeTimelineTab, setActiveTimelineTab] = useState<TimelineStatus>('UPCOMING');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
    const limit = 10;

    const parseEventDate = (ev: Event): number => {
        if (ev.startAt && ev.startAt > 0) return ev.startAt;

        // Robust parsing for DD-MM-YYYY or YYYY-MM-DD
        const dateStr = ev.date;
        const timeStr = ev.time || '00:00';

        // Try direct parsing first
        let d = new Date(`${dateStr} ${timeStr}`);
        if (!isNaN(d.getTime())) return d.getTime();

        // Fallback for DD-MM-YYYY
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [p1, p2, p3] = parts.map(Number);
            const [hours, mins] = timeStr.split(':').map(Number);

            // Assume if p1 > 31, it's YYYY-MM-DD
            if (p1 > 31) {
                d = new Date(p1, p2 - 1, p3, hours || 0, mins || 0);
            } else {
                // Otherwise DD-MM-YYYY
                d = new Date(p3, p2 - 1, p1, hours || 0, mins || 0);
            }
            return d.getTime();
        }

        return 0;
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentView === 'approval') {
                params.set('status', activeStatus);
            } else if (currentView === 'featured') {
                params.set('featured', 'true');
                params.set('sort', 'featured');
            } else if (currentView === 'timeline') {
                params.set('timeline', activeTimelineTab.toLowerCase());
            }

            if (searchQuery.trim()) {
                params.set('q', searchQuery.trim());
            }

            params.set('page', page.toString());
            params.set('limit', limit.toString());

            const response = await fetch(`${API_ROUTES.EVENTS}?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();

            if (Array.isArray(result)) {
                setEvents(result);
                setPagination({ total: result.length, totalPages: 1, limit: result.length });
            } else {
                setEvents(result.data || []);
                setPagination({
                    total: result.pagination?.total || 0,
                    totalPages: result.pagination?.totalPages || 1,
                    limit: result.pagination?.limit || limit
                });
            }
        } catch (error) {
            console.error('Fetch failed:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset page when view or tab changes
    }, [currentView, activeStatus, activeTimelineTab]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [currentView, activeStatus, activeTimelineTab, page, searchQuery]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const response = await fetch(API_ROUTES.EVENT_STATUS(id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'APPROVED' }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to approve');
            }
            fetchEvents();
            showAlert('Event approved successfully!', 'Success');
        } catch (error: any) {
            console.error('Approve failed:', error);
            showAlert(`Failed to approve: ${error.message}`, 'Error');
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
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to reject');
            }
            fetchEvents();
            showAlert('Event rejected.', 'Success');
        } catch (error: any) {
            console.error('Reject failed:', error);
            showAlert(`Failed to reject: ${error.message}`, 'Error');
        } finally {
            setActionLoading(null);
        }
    };

    // Delete functionality removed as per user request

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        setActionLoading(id);
        try {
            const response = await fetch(API_ROUTES.EVENT_BY_ID(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFeatured }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to update featured status');
            }
            fetchEvents();
            showAlert(isFeatured ? 'Event marked as featured!' : 'Event removed from featured.', 'Success');
        } catch (error: any) {
            console.error('Feature toggle failed:', error);
            showAlert(`Failed to update featured: ${error.message}`, 'Error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/events/${id}/edit?from=${currentView}`);
    };

    const handlePreview = (id: string) => {
        router.push(`/admin/events/${id}?from=${currentView}`);
    };

    return (
        <div className="py-12 px-10">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-foreground capitalize">
                            {currentView === 'approval' ? 'Event Approvals' : currentView === 'featured' ? 'Featured Events' : 'Event Timeline'}
                        </h1>
                        <p className="text-surface-800/60 font-medium">
                            {currentView === 'approval'
                                ? 'Manage event submissions and their status.'
                                : currentView === 'featured'
                                    ? 'Curated events highlighted on the main page.'
                                    : 'Overview of upcoming, ongoing, and completed events sorted by date.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentView === 'featured' && <Star className="text-amber-500" size={32} fill="currentColor" />}
                        {currentView === 'timeline' && <Clock className="text-primary" size={32} />}
                        {currentView === 'approval' && <CheckCircle className="text-emerald-500" size={32} />}
                    </div>
                </header>

                <section className="bg-white p-8 rounded-3xl border border-surface-200 shadow-premium min-h-[600px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        {currentView === 'approval' && (
                            <div className="flex bg-surface-100 p-1.5 rounded-2xl border border-surface-200 w-fit">
                                {(['PENDING', 'APPROVED', 'REJECTED'] as ApprovalStatus[]).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setActiveStatus(status)}
                                        className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeStatus === status
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-surface-400 hover:text-surface-600'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentView === 'timeline' && (
                            <div className="flex bg-surface-100 p-1.5 rounded-2xl border border-surface-200 w-fit">
                                {(['UPCOMING', 'ONGOING', 'COMPLETED'] as TimelineStatus[]).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTimelineTab(tab)}
                                        className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTimelineTab === tab
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-surface-400 hover:text-surface-600'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative group max-w-sm w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1); // Reset to first page on search
                                }}
                                className="w-full pl-12 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-surface-400"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-16 w-full bg-surface-100 animate-pulse " />
                            ))}
                        </div>
                    ) : (
                        <AdminTable
                            events={events}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onEdit={handleEdit}
                            onPreview={handlePreview}
                            onToggleFeatured={handleToggleFeatured}
                        />
                    )}

                    <Pagination
                        currentPage={page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={(p) => setPage(p)}
                    />
                    {/* Page-level views now handle review and editing */}
                </section>
            </div>
        </div>
    );
}

