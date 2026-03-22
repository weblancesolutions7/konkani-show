'use client';

import React from 'react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-premium border border-surface-100">
                <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight uppercase italic">
                    Terms and <span className="text-primary">Conditions</span>
                </h1>
                
                <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed">
                            By accessing and using the Konkani Show platform, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Responsibilities</h2>
                        <p className="leading-relaxed">
                            Users are responsible for the accuracy of the information they provide when listing events. Konkani Show reserves the right to remove any content that is deemed inappropriate or inaccurate.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Event Listings</h2>
                        <p className="leading-relaxed">
                            Konkani Show acts as a platform for event discovery. We are not responsible for the actual conduct, management, or cancellation of any events listed on the platform. All ticket purchases and event-related issues should be addressed directly with the event organizers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Intellectual Property</h2>
                        <p className="leading-relaxed">
                            All content on this website, including text, graphics, logos, and images, is the property of Konkani Show and protected by international copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
                        <p className="leading-relaxed">
                            Konkani Show shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
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

export default TermsPage;
