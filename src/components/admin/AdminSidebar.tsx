
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ onSeedData }: { onSeedData?: () => void }) {
    const pathname = usePathname();

    const navItems = [
        { label: 'Events Dashboard', href: '/admin', icon: '📋' },
        { label: 'Preferences', href: '/admin/preferences', icon: '⚙️' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-surface-200 min-h-screen sticky top-0 flex flex-col p-6 shadow-sm">
            <div className="mb-10">
                <Link href="/" className="block">
                    <h2 className="text-xl font-black italic text-primary tracking-tighter uppercase">
                        Konkani<span className="text-surface-800 not-italic opacity-80">Show</span>
                    </h2>
                </Link>
                <p className="text-[10px] font-black uppercase text-surface-400 mt-2 tracking-widest px-1">Admin Panel</p>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                            pathname === item.href
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-surface-600 hover:bg-surface-50 hover:text-primary'
                        }`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-6 space-y-3">
                {onSeedData && (
                    <button
                        onClick={onSeedData}
                        className="w-full px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-bold hover:shadow-md transition-all text-sm flex items-center gap-2"
                    >
                        🌱 Seed Data
                    </button>
                )}
                <Link
                    href="/submit-event"
                    className="w-full px-4 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary-dark transition-all text-sm flex items-center justify-center gap-2"
                >
                    ➕ Create Event
                </Link>
            </div>
        </aside>
    );
}
