
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 text-white shadow-premium overflow-hidden" style={{ background: 'linear-gradient(135deg, #7030ef 0%, #db1fff 100%)' }}>
            {/* Subtle light reflection sweep animation */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute inset-y-0 w-1/4 bg-white/30 -skew-x-12 animate-[sweep_5s_infinite] blur-2xl" style={{ left: '-50%' }} />
            </div>

            {/* Upper Header: Logo, Search, Location, Login */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center justify-between gap-8 py-4 md:py-5">
                    {/* Logo with Glow */}
                    <Link href="/" className="flex-shrink-0 group">
                        <h1 className="text-2xl md:text-3xl font-black italic text-white tracking-tighter uppercase transition-all duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] group-hover:scale-[1.02]">
                            Konkani<span className="text-white/70 not-italic">Show</span>
                        </h1>
                    </Link>

                    {/* Search Bar - Refined Glassmorphism */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-2xl relative group"
                    >
                        <input
                            type="text"
                            placeholder="Search for Movies, Events, Plays and Activities"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/40 text-sm text-white placeholder:text-white/50 transition-all duration-300 focus:bg-white/20 group-hover:border-white/40 shadow-inner"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-white group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </form>

                    {/* Location & CTA */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="hidden lg:flex items-center gap-1.5 cursor-pointer group">
                            <div className="text-white/70 group-hover:text-white transition-colors">
                                <span className="text-xs uppercase font-black tracking-widest block opacity-60">Location</span>
                                <span className="text-sm font-bold block leading-tight">Mangalore</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/40 group-hover:text-white transition-all transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <button className="relative px-6 py-2.5 bg-surface-50 text-primary text-[14px] font-black rounded-xl hover:bg-surface-100 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 group overflow-hidden">
                            <span className="relative z-10">Sign In</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>

                        {/* Mobile Search Toggle */}
                        <button className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lower Header: Navigation Section - More Air, Refined items */}
            <nav className="border-t border-white/15 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-12">
                    <ul className="flex items-center gap-8 h-full">
                        {['Events', 'Plays', 'Activities'].map((item) => (
                            <li key={item} className="h-full">
                                <Link href={`/${item.toLowerCase()}`} className="relative h-full flex items-center text-[13px] font-bold text-white/80 hover:text-white transition-all group">
                                    {item}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <ul className="flex items-center gap-8 text-[11px] font-black text-white/70 uppercase tracking-[0.1em]">
                        <li>
                            <Link href="/submit-event" className="hover:text-white transition-colors px-1">
                                List Your Show
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin" className="hover:text-white transition-colors px-1">
                                Admin Portal
                            </Link>
                        </li>
                        <li>
                            <Link href="/" className="hover:text-white transition-colors px-1">
                                Offers
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <style jsx>{`
                @keyframes sweep {
                    0% { transform: translateX(0) skewX(-12deg); }
                    100% { transform: translateX(1000%) skewX(-12deg); }
                }
            `}</style>
        </header>
    );
};

export default Header;
