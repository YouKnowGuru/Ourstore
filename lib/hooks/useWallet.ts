'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface WalletInfo {
    points: number;
    walletBalance: number;
    pointHistory: { type: string; points: number; amount?: number; reason: string; createdAt: string }[];
    transactions: { _id: string; type: string; amount: number; points?: number; description: string; createdAt: string }[];
}

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
}

export const useWallet = () => {
    const [wallet, setWallet] = useState<WalletInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchWallet = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/wallet', { headers: getAuthHeaders() });
            if (!res.ok) throw new Error('Failed to fetch wallet');
            const data = await res.json();
            setWallet(data);
            return data;
        } catch (error) {
            console.error('[useWallet] fetchWallet error:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const convertPoints = useCallback(async (pointsToConvert: number) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/wallet/convert', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ pointsToConvert }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setWallet(prev => prev ? { ...prev, points: data.points, walletBalance: data.walletBalance } : prev);
            toast.success(data.message);
            return data;
        } catch (error: any) {
            toast.error(error.message || 'Failed to convert points');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const applyWallet = useCallback(async (cartTotal: number, walletToUse: number) => {
        try {
            const res = await fetch('/api/wallet/apply', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ cartTotal, walletToUse }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            return data;
        } catch (error: any) {
            toast.error(error.message || 'Failed to apply wallet');
            return null;
        }
    }, []);

    return { wallet, isLoading, fetchWallet, convertPoints, applyWallet };
};
