'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await getSession();
                const valid = session?.isValid() || false;
                setIsAuthenticated(valid);

                if (!valid && pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                setIsAuthenticated(false);
                if (pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            }
        };

        checkAuth();
    }, [router, pathname]);

    // Don't show anything while checking auth on protected routes
    if (isAuthenticated === null && pathname !== '/admin/login') {
        return (
            <div className="min-h-screen bg-surface-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If on login page, or authenticated, show content
    if (pathname === '/admin/login' || isAuthenticated) {
        return <>{children}</>;
    }

    // Otherwise, it will redirect via useEffect
    return null;
}
