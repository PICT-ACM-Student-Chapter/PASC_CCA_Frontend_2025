// components/AdminGuard.tsx
// Dedicated authentication guard for admin-only routes.
// Unlike the generic AuthGuard, this explicitly verifies the admin role
// via the backend /auth/admin/me endpoint and redirects non-admins appropriately.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import axios from 'axios';
import { apiUrl } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const verifyAdmin = async () => {
            setError(null);
            const token = localStorage.getItem('token');

            // No token at all — redirect to login
            if (!token) {
                router.replace('/auth/login');
                return;
            }

            try {
                // Explicitly verify the admin role with the backend
                const response = await axios.get(`${apiUrl}/auth/admin/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    // Confirmed admin — update store and allow access
                    setAuth({ admin: response.data.data, user: undefined, role: 'admin' });
                    localStorage.setItem('role', 'admin');
                    setIsLoading(false);
                } else {
                    throw new Error('Admin verification failed');
                }
            } catch (err: any) {
                const status = err.response?.status;

                if (status === 401) {
                    // Invalid / expired token — clear storage and send to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('userId');
                    router.replace('/auth/login');
                    return;
                }

                if (status === 403) {
                    // Valid token, but not an admin — check if they are a student and redirect
                    try {
                        const userRes = await axios.get(`${apiUrl}/auth/user/me`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (userRes.data.success) {
                            setAuth({ user: userRes.data.data, admin: undefined, role: 'student' });
                            localStorage.setItem('role', 'student');
                            router.replace('/student/events');
                            return;
                        }
                    } catch {
                        // Cross-check also failed — logout
                    }
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('userId');
                    router.replace('/auth/login');
                    return;
                }

                // Network / server error — show retry UI rather than logging the user out
                console.error('AdminGuard error:', err);
                setError('Authentication check failed. Please check your connection and try again.');
                setIsLoading(false);
            }
        };

        verifyAdmin();
    }, [router, setAuth]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Access Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        );
    }

    return <>{children}</>;
};
