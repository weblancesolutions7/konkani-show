'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { LayoutDashboard, Image as ImageIcon, Settings, PlusCircle, LogOut, ChevronDown, ChevronRight, Star, Clock, CheckCircle } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isEventsOpen, setIsEventsOpen] = React.useState(true);

    const handleLogout = () => {
        signOut();
        router.push('/admin/login');
    };

    // navItems array is no longer needed as we've hardcoded the structure for more control

    return (
        <aside className="w-64 bg-white border-r border-surface-200 h-full flex flex-col p-6 shadow-sm">
            <div className="mb-10">
                <Link href="/" className="block">
                    <h2 className="text-xl font-black italic text-primary tracking-tighter uppercase">
                        Konkani<span className="text-surface-800 not-italic opacity-80">Show</span>
                    </h2>
                </Link>
                <p className="text-[10px] font-black uppercase text-surface-400 mt-2 tracking-widest px-1">Admin Panel</p>
            </div>

            <nav className="flex-1 space-y-2">
                <div>
                    <button
                        onClick={() => setIsEventsOpen(!isEventsOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                            pathname === '/admin' || pathname.startsWith('/admin/events')
                                ? 'bg-primary/5 text-primary'
                                : 'text-surface-600 hover:bg-surface-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <LayoutDashboard size={20} strokeWidth={2.5} />
                            <span>Events</span>
                        </div>
                        {isEventsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {isEventsOpen && (
                        <div className="mt-2 ml-4 pl-4 border-l-2 border-surface-100 space-y-1">
                            {[
                                { label: 'Featured Events', href: '/admin?view=featured', icon: Star },
                                { label: 'Timeline', href: '/admin?view=timeline', icon: Clock },
                                { label: 'Approval', href: '/admin?view=approval', icon: CheckCircle },
                            ].map((subItem) => {
                                const view = searchParams.get('view');
                                const isActive = pathname === '/admin' && (
                                    (subItem.href.includes('view=featured') && view === 'featured') ||
                                    (subItem.href.includes('view=timeline') && view === 'timeline') ||
                                    (subItem.href.includes('view=approval') && (view === 'approval' || !view))
                                );

                                return (
                                    <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                                            isActive
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-surface-500 hover:bg-surface-50 hover:text-primary'
                                        }`}
                                    >
                                        <subItem.icon size={16} />
                                        {subItem.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Link
                    href="/admin/banners"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                        pathname === '/admin/banners'
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-surface-600 hover:bg-surface-50 hover:text-primary'
                    }`}
                >
                    <ImageIcon size={20} strokeWidth={2.5} />
                    Hero Banners
                </Link>

                <Link
                    href="/admin/preferences"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                        pathname === '/admin/preferences'
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-surface-600 hover:bg-surface-50 hover:text-primary'
                    }`}
                >
                    <Settings size={20} strokeWidth={2.5} />
                    Preferences
                </Link>
            </nav>

            <div className="mt-auto pt-6 space-y-3">

                <Link
                    href="/submit-event"
                    className="w-full px-4 py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-all text-sm flex items-center justify-center gap-2"
                >
                    <PlusCircle size={18} /> Create Event
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold hover:bg-rose-100 transition-all text-sm flex items-center justify-center gap-2"
                >
                    <LogOut size={18} /> Sign Out
                </button>
            </div>
        </aside>
    );
}

