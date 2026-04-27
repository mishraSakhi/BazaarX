import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import { Login, Register } from './pages/Auth';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { OrdersList, OrderDetail } from './pages/Orders';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { VendorsList, VendorProfile } from './pages/Vendors';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/vendors" element={<VendorsList />} />
                <Route path="/vendors/:id" element={<VendorProfile />} />

                {/* Customer routes */}
                <Route path="/cart" element={
                  <ProtectedRoute roles={['customer']}>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute roles={['customer']}>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute roles={['customer']}>
                    <OrdersList />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute roles={['customer', 'vendor', 'admin']}>
                    <OrderDetail />
                  </ProtectedRoute>
                } />

                {/* Vendor routes */}
                <Route path="/vendor/dashboard" element={
                  <ProtectedRoute roles={['vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Profile & Wishlist */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute roles={['customer']}>
                    <Wishlist />
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={
                  <div className="page-wrapper container">
                    <div className="empty-state" style={{ paddingTop: 80 }}>
                      <div className="empty-icon">🔍</div>
                      <h3>404 – Page Not Found</h3>
                      <p>The page you're looking for doesn't exist.</p>
                      <a href="/" className="btn btn-primary" style={{ marginTop: 20 }}>Go Home</a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>

          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="dark"
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
