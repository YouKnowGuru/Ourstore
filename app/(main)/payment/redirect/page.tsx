'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

function RedirectForm() {
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const paymentUrl = searchParams.get('paymentUrl');
        const fieldsParam = searchParams.get('fields');

        if (!paymentUrl || !fieldsParam) {
            setError('Missing payment data. Please try again.');
            return;
        }

        try {
            const fields = JSON.parse(decodeURIComponent(fieldsParam));
            console.log('[BFS-REDIRECT] URL:', paymentUrl);
            console.log('[BFS-REDIRECT] Fields:', fields);

            // Build and submit form
            const form = formRef.current;
            if (!form) return;

            form.action = paymentUrl;
            form.method = 'POST';

            // Clear any existing inputs
            form.innerHTML = '';

            // Add hidden inputs
            Object.entries(fields).forEach(([name, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value as string;
                form.appendChild(input);
            });

            // Auto-submit after a brief delay
            setTimeout(() => {
                console.log('[BFS-REDIRECT] Submitting form...');
                form.submit();
            }, 500);
        } catch (e) {
            console.error('[BFS-REDIRECT] Error:', e);
            setError('Failed to process payment data.');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center space-y-6 p-10">
                {error ? (
                    <div className="text-red-600 font-bold">{error}</div>
                ) : (
                    <>
                        <div className="w-16 h-16 mx-auto border-4 border-saffron border-t-transparent rounded-full animate-spin" />
                        <h1 className="text-2xl font-display font-black text-gray-900">
                            Redirecting to Payment Gateway...
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Please wait while we securely connect you to BFS Secure.
                        </p>
                    </>
                )}
                <form ref={formRef} style={{ display: 'none' }} />
            </div>
        </div>
    );
}

export default function BfsRedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <RedirectForm />
        </Suspense>
    );
}
