'use client';

import React, { useState } from 'react';
import { getSession } from '@/lib/auth';
import OTPInput from '@/components/ui/OTPInput';
import EventForm from '@/components/event/EventForm';
import { useNotification } from '@/components/ui/NotificationProvider';
import { API_ROUTES } from '@/config/api';
import {
    Lock,
    ArrowRight,
    Loader2,
    PartyPopper,
    Check
} from 'lucide-react';

export default function SubmitEventPage() {
    const { showAlert } = useNotification();
    const [isAdminChecking, setIsAdminChecking] = useState(true);
    const [step, setStep] = useState<'AUTH' | 'FORM' | 'SUCCESS'>('AUTH');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    // Check if user is already logged in as admin
    React.useEffect(() => {
        const checkAdminSession = async () => {
            try {
                const session = await getSession();
                if (session && session.isValid()) {
                    setStep('FORM');
                    const userEmail = session.getIdToken().payload.email;
                    if (userEmail) setEmail(userEmail);
                }
            } catch (err) {
                console.error('Error checking for existing session:', err);
            } finally {
                setIsAdminChecking(false);
            }
        };
        checkAdminSession();
    }, []);

    const handleSendOTP = async () => {
        if (!email) return;
        setSendingOtp(true);
        try {
            const response = await fetch('/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.success) {
                setOtpSent(true);
                showAlert('OTP sent successfully!', 'Success');
            } else {
                showAlert(data.error || 'Failed to send OTP', 'OTP Error');
            }
        } catch (error) {
            console.error('OTP Send Error:', error);
            showAlert('Failed to send OTP', 'Error');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleAuthComplete = async (otp: string) => {
        setVerifyingOtp(true);
        try {
            const response = await fetch('/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (data.success) {
                setStep('FORM');
            } else {
                showAlert(data.error || 'Invalid OTP', 'Verification Failed');
            }
        } catch (error) {
            console.error('OTP Verify Error:', error);
            showAlert('Verification failed', 'Error');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleEventSubmit = async (eventData: any) => {
        setSubmitting(true);
        try {
            const response = await fetch(API_ROUTES.CREATE_EVENT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to submit event');
            }

            setStep('SUCCESS');
            showAlert(`Event "${eventData.title}" submitted successfully!`, 'Success');
        } catch (error: any) {
            console.error('Submit failed:', error);
            showAlert(`Failed to submit event: ${error.message}`, 'Submit Error');
        } finally {
            setSubmitting(false);
        }
    };

    if (isAdminChecking) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (step === 'AUTH') {
        return (
            <div className="min-h-[90vh] flex items-center justify-center bg-white p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary  blur-3xl animate-pulse" />
                    <div className="absolute top-1/2 -right-24 w-64 h-64 bg-accent  blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="max-w-md w-full relative">
                    <div className="p-10 bg-white rounded-[2.5rem] shadow-premium border border-surface-200 relative z-10 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-primary/10 text-primary  flex items-center justify-center mb-8 mx-auto transform -rotate-6">
                            <Lock size={32} strokeWidth={3} />
                        </div>

                        <h1 className="text-3xl font-black text-center mb-3 tracking-tight">Verify Identity</h1>
                        <p className="text-center text-surface-800/60 mb-10 font-medium leading-relaxed">
                            Sign in to your account or verify your identity to list a new event on our platform.
                        </p>

                        <div className="space-y-8">
                            {!otpSent ? (
                                <>
                                    <div className="group">
                                        <label className="block text-[11px] font-black mb-2 uppercase tracking-[0.2em] text-surface-800/30 group-focus-within:text-primary transition-colors">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                placeholder="user@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-5 pr-5 py-4 bg-surface-50 border-2 border-surface-100  focus:border-primary focus:bg-white outline-none transition-all font-bold text-lg shadow-inner group-hover:border-surface-200"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSendOTP}
                                        disabled={!email || sendingOtp}
                                        className="w-full py-4.5 bg-primary text-white font-bold  shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:grayscale transform active:scale-95 flex items-center justify-center gap-2 group"
                                    >
                                        {sendingOtp ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send OTP</span>
                                                <ArrowRight size={18} strokeWidth={3} className="transform group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="p-6 bg-surface-50  border-2 border-surface-100 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2">
                                            <button
                                                onClick={() => setOtpSent(false)}
                                                className="text-[10px] font-black uppercase text-primary hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <label className="block text-[10px] font-black mb-1 uppercase tracking-widest text-surface-800/30">
                                            Sending OTP to
                                        </label>
                                        <div className="text-lg font-black text-surface-900 truncate pr-10">
                                            {email}
                                        </div>
                                    </div>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-surface-200 opacity-50"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-4 bg-white text-[10px] font-black uppercase tracking-widest text-surface-800/30">Verification Code</span>
                                        </div>
                                    </div>

                                    <div>
                                        <OTPInput onComplete={handleAuthComplete} />
                                    </div>

                                    <button
                                        onClick={handleSendOTP}
                                        disabled={sendingOtp}
                                        className="w-full py-2 text-primary font-bold text-xs uppercase tracking-widest hover:underline disabled:opacity-50"
                                    >
                                        {sendingOtp ? 'Sending...' : 'Resend OTP'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-center mt-8 text-xs text-surface-800/40 leading-relaxed max-w-[280px] mx-auto">
                        By continuing, you agree to our Terms of Service and Privacy Policy. Securely managed by Mandd Sobhann.
                    </p>
                </div>
            </div>
        );
    }

    if (step === 'SUCCESS') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-white p-6">
                <div className="max-w-xl w-full text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary  animate-bounce" />
                        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-accent  animate-bounce delay-100" />
                        <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-emerald-500  animate-bounce delay-300" />
                    </div>

                    <div className="p-12 md:p-16 bg-white rounded-[3rem] shadow-premium border border-surface-200">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600  flex items-center justify-center mx-auto mb-10 shadow-inner animate-in zoom-in duration-500">
                            <PartyPopper size={48} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Show&apos;s on the Way!</h1>
                        <p className="text-surface-800/60 text-lg mb-12 font-medium leading-relaxed max-w-sm mx-auto">
                            Your event has been submitted. Our team at <span className="text-primary font-bold">Mandd Sobhann</span> will review it shortly.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-10 py-4 bg-primary text-white font-bold  shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all active:scale-95"
                            >
                                Back to Main App
                            </button>
                            <button
                                onClick={() => setStep('FORM')}
                                className="px-10 py-4 bg-surface-50 text-surface-900 border border-surface-200 font-bold  hover:bg-white hover:border-primary transition-all active:scale-95"
                            >
                                Submit Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white py-12 md:py-20 px-6">
            <div className="max-w-5xl mx-auto">
                <header className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-block px-4 py-1.5 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-[0.2em]  mb-4 border border-primary/10">
                            Partner Portal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Submit Your Show</h1>
                        <p className="text-surface-800/50 text-lg font-medium">Create a stunning listing for your upcoming Konkani event.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-surface-50 p-2  border border-surface-200 self-center md:self-auto shadow-sm">
                        <div className="px-6 py-2 bg-white text-primary text-xs font-black uppercase tracking-widest  shadow-sm">Step 2 of 2</div>
                        <div className="w-12 h-1.5 bg-primary " />
                    </div>
                </header>

                <EventForm
                    onSubmit={handleEventSubmit}
                    isSubmitting={submitting}
                    submitLabel="Submit for Approval"
                />
            </div>
        </main>
    );
}


