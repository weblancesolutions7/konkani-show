'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Default open first

    const faqs = [
        {
            question: "How do I list my show on Konkani Show?",
            answer: "Click on the 'List Show' button in the header and fill out the event submission form. Our team will review and approve it within 24-48 hours."
        },
        {
            question: "Is there a fee to list an event?",
            answer: "Basic event listings are free. We also offer featured listing options for organizations looking for maximum visibility."
        },
        {
            question: "How can I filter events by city?",
            answer: "Use the location dropdown in the header to select your city or choose 'Worldwide' to see all upcoming shows."
        },
        {
            question: "Can I edit my event after submission?",
            answer: "Yes, you can contact our support team or log in to your dashboard (if registered) to manage your listings."
        },
        {
            question: "What types of events can I list?",
            answer: "You can list any Konkani cultural event, including Tiatrs, Musical shows, Dramas, and community gatherings."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Everything you need to know about the Konkani Show platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className="bg-white rounded-2xl shadow-premium border border-surface-100 overflow-hidden transition-all hover:border-primary/20 h-fit">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full text-left p-6 flex items-center justify-between gap-4 group"
                                >
                                    <h3 className={`text-base font-bold transition-colors ${isOpen ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>
                                        {faq.question}
                                    </h3>
                                    <ChevronDown 
                                        className={`text-primary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                                        size={18} 
                                    />
                                </button>
                                <div 
                                    className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default FAQPage;
