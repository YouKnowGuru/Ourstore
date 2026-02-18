import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { LoginCredentials, RegisterData } from '@/lib/types';
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

  const handleLogout = () => {
    dispatch(logout());
  };

  const refreshUser = () => {
    return dispatch(getMe());
  };

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
