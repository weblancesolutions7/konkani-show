'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Headphones, Ticket } from 'lucide-react';
import { usePreferences } from '@/hooks/usePreferences';

const Footer = () => {
    const { preferences, loading } = usePreferences();

    return (
        <footer className="text-white mt-auto" style={{ background: 'linear-gradient(135deg, #7030ef 0%, #db1fff 100%)' }}>




            {/* Section 4: Logo & Socials */}
            <div className="bg-black/30 py-10 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 border-t border-white/10"></div>
                        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase select-none">
                            Konkani<span className="text-white/60 not-italic font-light">Show</span>
                        </h2>
                        <div className="flex-1 border-t border-white/10"></div>
                    </div>

                    {/* Links - Moved here */}
                    <div className="space-y-6 mb-8">
                        {/* Categories */}
                        <div>
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Events by Category</h4>
                            <div className="text-[11px] text-white/80 leading-relaxed flex flex-wrap justify-center gap-y-2 gap-x-1">
                                {loading ? (
                                    <span className="text-white/50">Loading...</span>
                                ) : (preferences?.categories || []).map((cat, i, arr) => (
                                    <React.Fragment key={cat.id}>
                                        <Link href={`/events?category=${encodeURIComponent(cat.name)}`} className="hover:text-white transition-all whitespace-nowrap">{cat.name}</Link>
                                        {i < arr.length - 1 && <span className="mx-2 text-white/20">|</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Help */}
                        <div>
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Help</h4>
                            <div className="text-[11px] text-white/80 leading-relaxed flex flex-wrap justify-center gap-y-2 gap-x-1">
                                {[
                                    { name: 'FAQs', href: '/faqs' },
                                    { name: 'Terms and Conditions', href: '/terms' },
                                    { name: 'Privacy Policy', href: '/privacy' }
                                ].map((item, i, arr) => (
                                    <React.Fragment key={item.name}>
                                        <Link href={item.href} className="hover:text-white transition-all whitespace-nowrap">{item.name}</Link>
                                        {i < arr.length - 1 && <span className="mx-2 text-white/20">|</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div>
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Contact</h4>
                            <div className="text-[11px] text-white/80 leading-relaxed flex flex-wrap justify-center gap-y-2 gap-x-6">

                                <span>Phone: +91 9743730632</span>
                                <span>Location: Mangalore, India</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Icons */}
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm" title="Facebook">
                            <svg width={14} height={14} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm" title="Twitter">
                            <svg width={12} height={12} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all shadow-sm" title="WhatsApp">
                            <svg width={14} height={14} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </a>
                    </div>

                    {/* Copyright & Info */}
                    <p className="text-[10px] text-white/60 mt-1">
                        Copyright 2026 © Konkani Show Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
