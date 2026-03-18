'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [challengeUser, setChallengeUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (challengeUser) {
                // Complete the challenge
                await new Promise((resolve, reject) => {
                    challengeUser.completeNewPasswordChallenge(newPassword, {}, {
                        onSuccess: resolve,
                        onFailure: reject
                    });
                });
                router.push('/admin');
                return;
            }

            const result: any = await signIn(email, password);
            
            if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
                setChallengeUser(result.cognitoUser);
                setNewPassword(''); // Reset for the new password input
            } else {
                router.push('/admin');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-premium border border-surface-200 p-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto font-black">
                        MS
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Admin Portal</h1>
                    <p className="text-surface-800/60 font-medium">Secured by AWS Cognito</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-100 italic">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            disabled={!!challengeUser}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@manddsobhann.com"
                            className="w-full p-4 bg-surface-50 rounded-xl outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold disabled:opacity-50"
                        />
                    </div>

                    {!challengeUser ? (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-surface-800/40 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-4 bg-surface-50 rounded-xl outline-none focus:bg-white border-2 border-transparent focus:border-primary transition-all font-bold"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary ml-1 italic">Set New Permanent Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full p-4 bg-primary/5 rounded-xl outline-none border-2 border-primary transition-all font-bold"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white font-black text-lg rounded-xl shadow-lg hover:bg-primary-dark transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            challengeUser ? 'Set Password & Login' : 'Sign In'
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-xs text-surface-800/40 font-medium italic">
                    For authorized access only. Unauthorized attempts are logged.
                </p>
            </div>
        </div>
    );
}
