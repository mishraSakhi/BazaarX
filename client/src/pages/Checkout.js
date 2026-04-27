import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../utils/api';
import { toast } from 'react-toastify';
import './Checkout.css';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
  { value: 'upi', label: 'UPI', icon: '📱' },
  { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
];

const Checkout = () => {
  const { cart, total, emptyCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: address, 2: payment, 3: review

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const shippingCost = total > 500 ? 0 : 50;
  const grandTotal = total + shippingCost;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const items = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      }));
      const { data } = await placeOrder({ items, shippingAddress: address, paymentMethod });
      await emptyCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = (field, value) => setAddress(prev => ({ ...prev, [field]: value }));

  const steps = ['Delivery Address', 'Payment Method', 'Review & Place Order'];

  return (
    <div className="page-wrapper container">
      <h1 className="section-title" style={{ marginBottom: 8 }}>Checkout</h1>

      {/* Step indicator */}
      <div className="checkout-steps">
        {steps.map((s, i) => (
          <div key={i} className={`checkout-step ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
            <div className="step-circle">
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span>{s}</span>
            {i < steps.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card fade-in">
              <h2 className="checkout-section-title">Delivery Address</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={address.name}
                    onChange={e => updateAddress('name', e.target.value)} placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={address.phone}
                    onChange={e => updateAddress('phone', e.target.value)} placeholder="+91 9876543210" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="form-input" value={address.street}
                  onChange={e => updateAddress('street', e.target.value)} placeholder="House No, Street, Area" required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={address.city}
                    onChange={e => updateAddress('city', e.target.value)} placeholder="Mumbai" required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={address.state}
                    onChange={e => updateAddress('state', e.target.value)} placeholder="Maharashtra" required />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">ZIP / Postal Code</label>
                  <input className="form-input" value={address.zipCode}
                    onChange={e => updateAddress('zipCode', e.target.value)} placeholder="400001" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" value={address.country}
                    onChange={e => updateAddress('country', e.target.value)} placeholder="India" required />
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  if (!address.name || !address.phone || !address.street || !address.city || !address.zipCode) {
                    toast.error('Please fill all required fields');
                    return;
                  }
                  setStep(2);
                }}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card fade-in">
              <h2 className="checkout-section-title">Payment Method</h2>
              <div className="payment-options">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.value} className={`payment-option ${paymentMethod === m.value ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)} />
                    <span className="payment-icon">{m.icon}</span>
                    <span className="payment-label">{m.label}</span>
                    {paymentMethod === m.value && <span className="payment-check">✓</span>}
                  </label>
                ))}
              </div>
              {paymentMethod === 'cod' && (
                <div className="payment-note fade-in">
                  <span>ℹ️</span>
                  <p>Pay in cash when your order arrives. No extra charges.</p>
                </div>
              )}
              {paymentMethod !== 'cod' && (
                <div className="payment-note fade-in">
                  <span>🔒</span>
                  <p>This is a mock payment flow. No real transaction will occur.</p>
                </div>
              )}
              <div className="checkout-nav">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card fade-in">
              <h2 className="checkout-section-title">Review Your Order</h2>

              <div className="review-section">
                <div className="review-label">Delivering to</div>
                <div className="review-value">
                  <strong>{address.name}</strong> · {address.phone}<br />
                  {address.street}, {address.city}, {address.state} - {address.zipCode}, {address.country}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Edit</button>
              </div>

              <div className="review-section">
                <div className="review-label">Payment</div>
                <div className="review-value">
                  {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.icon}{' '}
                  {PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>Edit</button>
              </div>

              <div className="review-items">
                {cart.items.map(item => (
                  <div key={item._id} className="review-item">
                    <div className="review-item-img">
                      {item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.name} />
                        : <span>📦</span>
                      }
                    </div>
                    <div className="review-item-info">
                      <div className="review-item-name">{item.product?.name}</div>
                      <div className="review-item-qty">Qty: {item.quantity}</div>
                    </div>
                    <div className="review-item-price">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="checkout-nav">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? 'Placing Order...' : `Place Order · ₹${grandTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="checkout-sidebar">
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Order Summary</h3>
            <div className="checkout-items-list">
              {cart.items.map(item => (
                <div key={item._id} className="checkout-mini-item">
                  <span className="checkout-mini-name">
                    {item.product?.name?.substring(0, 30)}{item.product?.name?.length > 30 ? '…' : ''}
                    <span className="checkout-mini-qty"> ×{item.quantity}</span>
                  </span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="summary-row"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
            <div className="summary-row" style={{ marginTop: 8 }}>
              <span>Shipping</span>
              <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'inherit' }}>
                {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
              </span>
            </div>
            <div className="divider" />
            <div className="summary-row summary-total">
              <span>Total</span><span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
