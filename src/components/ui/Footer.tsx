
import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="text-white pt-12 pb-8" style={{ background: 'linear-gradient(135deg, #7030ef 0%, #db1fff 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase mb-6">
                            Konkani<span className="text-white/80 not-italic">Show</span>
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed max-w-sm">
                            The ultimate platform for Konkani shows and events. We bring you the best of coastal culture, drama, and activities.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Explore</h3>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li><Link href="/" className="hover:text-white transition-colors">All Events</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Drama & Plays</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Activities</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-white">Platform</h3>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li><Link href="/submit-event" className="hover:text-white transition-colors">List Your Show</Link></li>
                            <li><Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Offers & Deals</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-white/60 italic">
                        Developed with ❤️ for the Konkani Community by WebLance Solutions.
                    </p>
                    <p className="text-xs text-white/60">
                        © 2026 Konkani Show Platform. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
