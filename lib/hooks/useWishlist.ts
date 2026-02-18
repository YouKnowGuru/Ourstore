import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import type { Product } from '@/lib/types';
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useWishlist = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error } = useSelector((state: RootState) => state.wishlist);
    const { isAuthenticated } = useAuth();

    const getWishlist = useCallback(() => {
        if (!isAuthenticated) return;
        return dispatch(fetchWishlist());
    }, [dispatch, isAuthenticated]);

    const toggleWishlist = useCallback(async (product: Product) => {
        if (!isAuthenticated) {
            toast.error('Please login to use the wishlist');
            return;
        }

        const isFavorited = items.some(item => item._id === product._id);

        try {
            if (isFavorited) {
                await dispatch(removeFromWishlist(product._id)).unwrap();
                toast.success('Removed from wishlist');
            } else {
                await dispatch(addToWishlist(product)).unwrap();
                toast.success('Added to wishlist');
            }
        } catch (err: any) {
            toast.error(err || 'Wishlist operation failed');
        }
    }, [dispatch, items, isAuthenticated]);

    const isInWishlist = useCallback((productId: string) => {
        return items.some(item => item._id === productId);
    }, [items]);

    return {
        wishlist: items,
        loading,
        error,
        getWishlist,
        toggleWishlist,
        isInWishlist,
    };
};
