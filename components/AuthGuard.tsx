// src/components/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from 'zustand';
import { useAuthStore } from '@/lib/store';
import axios from 'axios';
import { headers } from 'next/headers';
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const pathname = usePathname();
    const setAuth = useAuthStore((state) => state.setAuth);
    // OR: If you're storing token in Zustand
    // const token = useAuthStore(state => state.token);

    useEffect(() => {
        if (!token) {
            router.replace('/auth/login');
            return;
        }
        async function getData() {
            if (pathname.startsWith('/admin')) {
                try {
                    console.log("reached here")
                    const response = await axios.get('http://localhost:4000/api/auth/admin/me',
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    const data = response.data;
                    if (data.success) {
                        setAuth({ admin: data.data, user: undefined, role: "admin" });
                    }
                } catch (err) {
                    console.log(err);
                    router.replace('/auth/login');
                }
            } else if (pathname.startsWith('/student')) {
                try {
                    const response = await axios.get('http://localhost:4000/api/auth/user/me' ,
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                    const data = response.data;
                    if (data.success) {
                        setAuth({ user: data.data, admin: undefined, role: "student" });
                    }
                } catch (err) {
                    router.replace('/auth/login');
                }
            }
        }
        getData();
    }, [token, pathname, setAuth]);

    // Optionally show nothing or a loader while redirecting
    if (!token) return null;

    return <>{children}</>;
};
