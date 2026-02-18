// useEffect imported for future use
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchProduct,
  fetchCategories,
  setFilters,
  clearFilters,
  clearCurrentProduct,
} from '@/lib/store/slices/productSlice';

export const useProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    products,
    featuredProducts,
    categories,
    currentProduct,
    reviews,
    loading,
    error,
    filters,
    pagination,
  } = useSelector((state: RootState) => state.products);

  const getProducts = (params?: any) => {
    return dispatch(fetchProducts(params));
  };

  const getFeaturedProducts = () => {
    return dispatch(fetchFeaturedProducts());
  };

  const getProduct = (id: string) => {
    return dispatch(fetchProduct(id));
  };

  const getCategories = () => {
    return dispatch(fetchCategories());
  };

  const updateFilters = (newFilters: any) => {
    return dispatch(setFilters(newFilters));
  };

  const resetFilters = () => {
    return dispatch(clearFilters());
  };

  const clearProduct = () => {
    return dispatch(clearCurrentProduct());
  };

  return {
    products,
    featuredProducts,
    categories,
    currentProduct,
    reviews,
    loading,
    error,
    filters,
    pagination,
    getProducts,
    getFeaturedProducts,
    getProduct,
    getCategories,
    updateFilters,
    resetFilters,
    clearProduct,
  };
};

export default useProducts;
