
import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="text-white pt-12 pb-8" style={{ background: 'linear-gradient(135deg, #7030ef 0%, #db1fff 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Minimal Brand Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase mb-3">
                        Konkani<span className="text-white/80 not-italic">Show</span>
                    </h2>
                    <p className="text-white/80 text-sm italic opacity-80 decoration-white/30 underline-offset-4">
                        The ultimate platform for Konkani shows and events.
                    </p>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-center items-center gap-6">
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
