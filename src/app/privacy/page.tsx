'use client';

import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-premium border border-surface-100">
                <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight uppercase italic">
                    Privacy <span className="text-primary">Policy</span>
                </h1>
                
                <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                        <p className="leading-relaxed">
                            We collect personal information that you provide to us directly, such as when you create an account, submit an event, or contact us for support. This may include your name, email address, and event details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
                        <p className="leading-relaxed">
                            We use the information we collect to provide, maintain, and improve our services, to process your event listings, and to communicate with you about updates and promotions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Information Sharing</h2>
                        <p className="leading-relaxed">
                            We do not sell your personal information to third parties. We may share your information with service providers who perform services on our behalf, or when required by law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                        <p className="leading-relaxed">
                            We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever completely secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Cookies</h2>
                        <p className="leading-relaxed">
                            We use cookies and similar technologies to enhance your experience on our platform and to collect analytics about how our service is being used.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-slate-100">
                        <p className="text-sm font-medium">Last updated: March 22, 2026</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
