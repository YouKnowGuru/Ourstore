'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { getMe } from '@/lib/store/slices/authSlice';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { AppDispatch } from '@/lib/store';

const AuthCallbackContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const token = searchParams.get('token');
        const refresh = searchParams.get('refresh');
        const error = searchParams.get('error');

        if (error) {
            toast.error('Authentication Failed', {
                description: decodeURIComponent(error)
            });
            router.push('/login');
            return;
        }

        if (token && refresh) {
            // Store tokens
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refresh);
            }

            // Update Redux state by fetching user profile
            dispatch(getMe())
                .unwrap()
                .then(() => {
                    toast.success('Successfully signed in with Google');
                    router.push('/');
                })
                .catch(() => {
                    toast.error('Failed to load user profile');
                    router.push('/login');
                });

        } else {
            // Only show error if we also didn't get token/refresh
            // But we should be careful about double invocation which is handled by processedRef
        }
    }, [searchParams, router, dispatch]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-maroon animate-spin" />
                </div>
                <h2 className="text-xl font-display font-bold text-gray-900">Completing Sign In...</h2>
                <p className="text-gray-500 text-sm">Please wait while we log you in</p>
            </div>
        </div>
    );
};

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-maroon animate-spin" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
