'use client';

import React, { useState } from 'react';
import { Event } from '@/types';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event;
}

export default function RegisterModal({ isOpen, onClose, event }: RegisterModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        tickets: 1,
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: event.id,
                    ...formData,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setStatus('success');
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface-50 w-full max-w-md  shadow-xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-surface-500 hover:text-surface-900 bg-surface-100 hover:bg-surface-200 p-2  transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-black mb-2 text-surface-900">Register for Event</h2>
                    <p className="text-surface-500 text-sm mb-6 leading-relaxed">
                        Complete your registration for <strong className="text-primary">{event.title}</strong>.
                    </p>

                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600  flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-surface-900 mb-2">Registration Complete!</h3>
                            <p className="text-surface-600 mb-6">We've received your registration for this event.</p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-primary text-white font-bold  shadow-lg hover:bg-primary-dark transition-all transform active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-surface-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3  border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all outline-none"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-surface-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3  border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-surface-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3  border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all outline-none"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-surface-700 mb-1">Number of Tickets</label>
                                <input
                                    type="number"
                                    name="tickets"
                                    required
                                    min="1"
                                    max="10"
                                    value={formData.tickets}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3  border border-surface-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all outline-none"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="p-3  bg-red-50 border border-red-100 text-red-600 text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-4 mt-2 bg-primary text-white font-black  shadow-lg hover:bg-primary-dark transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    'Complete Registration'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

