import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: { fullName: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  verifyEmail: (data: { userId: string; otp: string }) =>
    api.post('/auth/verify-email', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { userId: string; otp: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
};

// User API
export const userAPI = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  updateProfilePicture: (formData: FormData) =>
    api.put('/users/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
  addToWishlist: (productId: string) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId: string) => api.delete(`/users/wishlist/${productId}`),
  getWishlist: () => api.get('/users/wishlist'),
  deleteAccount: (password: string) => api.post('/users/delete-account', { password }),
};

// Product API
export const productAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  createProduct: (data: any) => api.post('/products', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  }),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  }),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  createReview: (data: any) => api.post('/products/reviews', data),
};

// Order API
export const orderAPI = {
  createOrder: (data: any) => api.post('/orders', data),
  getOrders: (params?: any) => api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  updateOrderStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
  updatePaymentStatus: (id: string, data: any) => api.put(`/orders/${id}/payment`, data),
  cancelOrder: (id: string) => api.post(`/orders/${id}/cancel`),
  getOrderStats: () => api.get('/orders/stats'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: (params?: any) => api.get('/admin/dashboard', { params }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserDetails: (id: string) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id: string) => api.put(`/admin/users/${id}/toggle-status`),
};

// Blog API
export const blogAPI = {
  getBlogs: (params?: any) => api.get('/blogs', { params }),
  getBlog: (slug: string) => api.get(`/blogs/${slug}`),
  createBlog: (data: any) => api.post('/blogs', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  }),
  updateBlog: (id: string, data: any) => api.put(`/blogs/${id}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  }),
  deleteBlog: (id: string) => api.delete(`/blogs/${id}`),
};

// Gallery API
export const galleryAPI = {
  getGallery: (params?: any) => api.get('/gallery', { params }),
  createGallery: (data: any) => api.post('/gallery', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
  }),
  addImages: (id: string, data: FormData) =>
    api.post(`/gallery/${id}/images`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateImageCaption: (id: string, imageId: string, caption: string) =>
    api.put(`/gallery/${id}/images/${imageId}`, { caption }),
  deleteImage: (id: string, imageId: string) =>
    api.delete(`/gallery/${id}/images/${imageId}`),
  deleteGallery: (id: string) => api.delete(`/gallery/${id}`),
};

// Message API
export const messageAPI = {
  createMessage: (data: any) => api.post('/messages', data),
  getMessages: (params?: any) => api.get('/messages', { params }),
  getMessage: (id: string) => api.get(`/messages/${id}`),
  replyToMessage: (id: string, reply: string) =>
    api.post(`/messages/${id}/reply`, { reply }),
  deleteMessage: (id: string) => api.delete(`/messages/${id}`),
};

export default api;
