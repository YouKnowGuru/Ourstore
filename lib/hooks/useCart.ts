import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState, AppDispatch } from '@/lib/store';
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  selectCartItems,
  selectCartTotal,
  selectCartCount,
} from '@/lib/store/slices/cartSlice';
import type { CartItem } from '@/lib/types';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const isOpen = useSelector((state: RootState) => state.cart.isOpen);

  const addToCart = useCallback((item: CartItem) => {
    dispatch(addItem(item));
  }, [dispatch]);

  const removeFromCart = useCallback((productId: string) => {
    dispatch(removeItem(productId));
  }, [dispatch]);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  }, [dispatch]);

  const emptyCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const toggleCartDrawer = useCallback(() => {
    dispatch(toggleCart());
  }, [dispatch]);

  const openCart = useCallback(() => {
    dispatch(setCartOpen(true));
  }, [dispatch]);

  const closeCart = useCallback(() => {
    dispatch(setCartOpen(false));
  }, [dispatch]);

  return {
    items,
    total,
    count,
    isOpen,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    emptyCart,
    toggleCartDrawer,
    openCart,
    closeCart,
  };
};

export default useCart;
