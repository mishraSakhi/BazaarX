import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMyOrders, getOrder } from '../utils/api';
import './Orders.css';

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  shipped: 'accent', delivered: 'success', cancelled: 'error'
};

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${STATUS_COLORS[status] || 'muted'}`}>
    {status?.charAt(0).toUpperCase() + status?.slice(1)}
  </span>
);

export const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper container">
      <h1 className="section-title" style={{ marginBottom: 32 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card card fade-in">
              <div className="order-card-header">
                <div>
                  <div className="order-number">#{order.orderNumber}</div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="order-header-right">
                  <StatusBadge status={order.orderStatus} />
                  <div className="order-total">₹{order.total.toLocaleString()}</div>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="order-preview-item">
                    <div className="order-preview-img">
                      {item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.name} />
                        : <span>📦</span>
                      }
                    </div>
                    <div className="order-preview-info">
                      <div className="order-preview-name">{item.name}</div>
                      <div className="order-preview-qty">Qty: {item.quantity} · ₹{item.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="order-more-items">+{order.items.length - 3} more items</div>
                )}
              </div>

              <div className="order-card-footer">
                <span className="order-payment">
                  {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : `💳 ${order.paymentMethod.toUpperCase()}`}
                </span>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!order) return <div className="page-wrapper container"><p>Order not found.</p></div>;

  const shippingCost = order.shippingCost || 0;

  return (
    <div className="page-wrapper container">
      <div className="order-detail-header">
        <div>
          <h1 className="section-title">Order #{order.orderNumber}</h1>
          <p className="order-date">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          {/* Order progress */}
          <div className="card order-progress">
            <h3>Order Status</h3>
            <div className="progress-track">
              {['pending','confirmed','shipped','delivered'].map((s, i) => {
                const statuses = ['pending','confirmed','processing','shipped','delivered'];
                const currentIdx = statuses.indexOf(order.orderStatus);
                const stepIdx = ['pending','confirmed','shipped','delivered'].indexOf(s);
                const isDone = currentIdx > stepIdx || order.orderStatus === s;
                const isCancelled = order.orderStatus === 'cancelled';
                return (
                  <div key={s} className={`progress-step ${isDone && !isCancelled ? 'done' : ''} ${order.orderStatus === s ? 'current' : ''}`}>
                    <div className="progress-circle">
                      {isDone && !isCancelled ? '✓' : i + 1}
                    </div>
                    <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    {i < 3 && <div className={`progress-line ${isDone && !isCancelled && i < currentIdx ? 'done' : ''}`} />}
                  </div>
                );
              })}
            </div>
            {order.orderStatus === 'cancelled' && (
              <div className="cancelled-note">
                <span className="badge badge-error">Order Cancelled</span>
                {order.cancellationReason && <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-muted)' }}>{order.cancellationReason}</p>}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card">
            <h3 style={{ marginBottom: 20 }}>Order Items</h3>
            {order.items.map((item, i) => (
              <div key={i} className="order-detail-item">
                <div className="order-detail-img">
                  {item.product?.images?.[0]
                    ? <img src={item.product.images[0]} alt={item.name} />
                    : <span>📦</span>
                  }
                </div>
                <div className="order-detail-info">
                  <div className="order-detail-name">{item.name}</div>
                  <div className="order-detail-vendor">{item.vendor?.shopName}</div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="order-detail-pricing">
                  <div className="order-detail-price">₹{item.price.toLocaleString()} × {item.quantity}</div>
                  <div className="order-detail-subtotal">₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-detail-sidebar">
          {/* Price breakdown */}
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Price Details</h3>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
              <div className="summary-row" style={{ marginTop: 8 }}>
                <span>Shipping</span>
                <span style={{ color: shippingCost === 0 ? 'var(--success)' : 'inherit' }}>
                  {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="summary-row" style={{ marginTop: 8, color: 'var(--success)' }}>
                  <span>Discount</span><span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="divider" />
              <div className="summary-row summary-total">
                <span>Total</span><span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Delivery Address</h3>
            <div className="address-block">
              <div className="address-name">{order.shippingAddress.name}</div>
              <div className="address-phone">{order.shippingAddress.phone}</div>
              <div className="address-line">
                {order.shippingAddress.street},<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Payment</h3>
            <div className="payment-info-row">
              <span>Method</span>
              <span>{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : `💳 ${order.paymentMethod.toUpperCase()}`}</span>
            </div>
            <div className="payment-info-row">
              <span>Status</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
