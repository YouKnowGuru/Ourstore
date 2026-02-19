'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/store/slices/authSlice';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const userData = searchParams.get('user');

        if (token && refreshToken && userData) {
            try {
                const user = JSON.parse(userData);

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));

                // Update Redux state
                dispatch(setUser(user));

                toast.success('Successfully signed in with Google!');
                router.push('/');
            } catch (error) {
                console.error('Error parsing Google user data:', error);
                toast.error('Failed to complete Google sign-in');
                router.push('/login');
            }
        } else if (searchParams.get('error')) {
            toast.error(searchParams.get('error') || 'Google authentication failed');
            router.push('/login');
        }
    }, [searchParams, dispatch, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-10 h-10 text-maroon animate-spin" />
            <h2 className="text-xl font-display font-bold text-gray-900 text-center px-4">
                Completing your sign-in...
            </h2>
            <p className="text-gray-500 text-sm">Please wait while we set up your session.</p>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-maroon animate-spin" />
                <p className="text-gray-500 text-sm">Loading...</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
