import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
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
} from '@/store/slices/cartSlice';
import type { CartItem } from '@/types';

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const isOpen = useSelector((state: RootState) => state.cart.isOpen);

  const addToCart = (item: CartItem) => {
    dispatch(addItem(item));
  };

  const removeFromCart = (productId: string) => {
    dispatch(removeItem(productId));
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  const emptyCart = () => {
    dispatch(clearCart());
  };

  const toggleCartDrawer = () => {
    dispatch(toggleCart());
  };

  const openCart = () => {
    dispatch(setCartOpen(true));
  };

  const closeCart = () => {
    dispatch(setCartOpen(false));
  };

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
