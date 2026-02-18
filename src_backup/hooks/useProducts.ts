// useEffect imported for future use
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchProduct,
  fetchCategories,
  setFilters,
  clearFilters,
  clearCurrentProduct,
} from '@/store/slices/productSlice';

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
    dispatch(fetchProducts(params));
  };

  const getFeaturedProducts = () => {
    dispatch(fetchFeaturedProducts());
  };

  const getProduct = (id: string) => {
    dispatch(fetchProduct(id));
  };

  const getCategories = () => {
    dispatch(fetchCategories());
  };

  const updateFilters = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  const clearProduct = () => {
    dispatch(clearCurrentProduct());
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
