import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';

import { getMe, logout } from '@/lib/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, user]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const refreshUser = useCallback(() => {
    return dispatch(getMe());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isAdmin: user?.role === 'admin',
    logout: handleLogout,
    refreshUser,
  };
};

export default useAuth;
