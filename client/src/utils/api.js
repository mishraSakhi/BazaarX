import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/update-profile', data);
export const toggleWishlist = (productId) => API.post(`/auth/wishlist/${productId}`);

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart/add', data);
export const updateCartItem = (productId, data) => API.put(`/cart/update/${productId}`, data);
export const removeFromCart = (productId) => API.delete(`/cart/remove/${productId}`);
export const clearCart = () => API.delete('/cart/clear');

// Orders
export const placeOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my');
export const getVendorOrders = () => API.get('/orders/vendor');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);

// Vendors
export const getVendors = () => API.get('/vendors');
export const getVendor = (id) => API.get(`/vendors/${id}`);
export const getVendorDashboard = () => API.get('/vendors/dashboard/stats');
export const updateVendorProfile = (data) => API.put('/vendors/profile/update', data);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const getAdminVendors = () => API.get('/admin/vendors');
export const approveVendor = (id) => API.put(`/admin/vendors/${id}/approve`);
export const getAdminOrders = () => API.get('/admin/orders');
export const featureProduct = (id, data) => API.put(`/admin/products/${id}/feature`, data);

// Reviews
export const getReviews = (productId) => API.get(`/reviews/${productId}`);
export const createReview = (productId, data) => API.post(`/reviews/${productId}`, data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);

export default API;
