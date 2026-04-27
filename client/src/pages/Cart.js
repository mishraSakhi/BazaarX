import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cart, total, updateItem, removeItem, emptyCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(null);

  const handleQty = async (productId, qty) => {
    setUpdating(productId);
    await updateItem(productId, qty);
    setUpdating(null);
  };

  const shippingCost = total > 500 ? 0 : 50;
  const grandTotal = total + shippingCost;

  if (!cart?.items?.length) {
    return (
      <div className="page-wrapper container">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <h1 className="section-title" style={{ marginBottom: 32 }}>Shopping Cart</h1>
      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          <div className="cart-header-row">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span />
          </div>

          {cart.items.map(item => {
            const product = item.product;
            if (!product) return null;
            const itemTotal = item.price * item.quantity;
            return (
              <div key={item._id || product._id} className="cart-item fade-in">
                <div className="cart-item-product">
                  <div className="cart-item-image">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} />
                      : <span>📦</span>
                    }
                  </div>
                  <div className="cart-item-meta">
                    <Link to={`/products/${product._id}`} className="cart-item-name">
                      {product.name}
                    </Link>
                    <span className="cart-item-vendor">
                      {product.vendor?.shopName || 'Unknown Shop'}
                    </span>
                    {product.stock < 5 && product.stock > 0 && (
                      <span className="badge badge-warning" style={{ fontSize: 11 }}>
                        Only {product.stock} left
                      </span>
                    )}
                  </div>
                </div>

                <div className="cart-item-price">₹{item.price.toLocaleString()}</div>

                <div className="qty-control">
                  <button className="qty-btn"
                    onClick={() => handleQty(product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updating === product._id}>−</button>
                  <span className="qty-value">
                    {updating === product._id ? '...' : item.quantity}
                  </span>
                  <button className="qty-btn"
                    onClick={() => handleQty(product._id, item.quantity + 1)}
                    disabled={item.quantity >= product.stock || updating === product._id}>+</button>
                </div>

                <div className="cart-item-total">₹{itemTotal.toLocaleString()}</div>

                <button className="cart-remove-btn"
                  onClick={() => removeItem(product._id)} title="Remove">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            );
          })}

          <div className="cart-actions">
            <Link to="/products" className="btn btn-ghost btn-sm">← Continue Shopping</Link>
            <button className="btn btn-danger btn-sm" onClick={emptyCart}>Clear Cart</button>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary card">
          <h2 className="cart-summary-title">Order Summary</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-success' : ''}>
                {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
              </span>
            </div>
            {shippingCost > 0 && (
              <div className="free-ship-note">
                Add ₹{(500 - total).toLocaleString()} more for free shipping
              </div>
            )}
            <div className="divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 20 }}
            onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <div className="cart-trust">
            <span>🔒 Secure Checkout</span>
            <span>📦 Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
