'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { Toaster } from '@/components/ui/sonner';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { rehydrateAuth } from '@/lib/store/slices/authSlice';
import { rehydrateCart } from '@/lib/store/slices/cartSlice';

function StoreInitializer() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(rehydrateAuth());
        dispatch(rehydrateCart());
    }, [dispatch]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const handleGlobalError = (event: ErrorEvent) => {
            const message = event.message || '';
            const isChunkError =
                message.includes('Loading chunk') ||
                message.includes('ChunkLoadError') ||
                (event.error && (event.error.name === 'ChunkLoadError' || event.error.message?.includes('Loading chunk')));

            if (isChunkError) {
                console.warn('Global ChunkLoadError detected. Recovering...');
                const lastReload = sessionStorage.getItem('last-chunk-error-reload');
                const now = Date.now();

                if (!lastReload || now - parseInt(lastReload) > 10000) {
                    sessionStorage.setItem('last-chunk-error-reload', now.toString());
                    window.location.reload();
                }
            }
        };

        window.addEventListener('error', handleGlobalError);
        return () => window.removeEventListener('error', handleGlobalError);
    }, []);

    return (
        <Provider store={store}>
            <StoreInitializer />
            {children}
            <Toaster position="top-right" richColors />
        </Provider>
    );
}
