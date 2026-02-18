import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import {
  createOrder,
  fetchOrders,
  fetchOrder,
  fetchOrderStats,
  clearCurrentOrder,
} from '@/store/slices/orderSlice';

export const useOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, currentOrder, loading, error, stats } = useSelector(
    (state: RootState) => state.orders
  );

  const placeOrder = (data: any) => {
    return dispatch(createOrder(data));
  };

  const getOrders = (params?: any) => {
    dispatch(fetchOrders(params));
  };

  const getOrder = (id: string) => {
    dispatch(fetchOrder(id));
  };

  const getOrderStats = () => {
    dispatch(fetchOrderStats());
  };

  const clearOrder = () => {
    dispatch(clearCurrentOrder());
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    stats,
    placeOrder,
    getOrders,
    getOrder,
    getOrderStats,
    clearOrder,
  };
};

export default useOrders;
