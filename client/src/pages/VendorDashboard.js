import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorDashboard, getVendorOrders, createProduct, updateProduct, deleteProduct } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './VendorDashboard.css';

const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Food & Beverage','Beauty','Toys','Automotive','Other'];

const emptyProduct = {
  name: '', description: '', price: '', discountPrice: '', category: '',
  stock: '', images: [''], tags: '', sku: ''
};

const VendorDashboard = () => {
  const { vendorProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          getVendorDashboard(),
          getVendorOrders()
        ]);
        setStats(dashRes.data.stats);
        setProducts(dashRes.data.topProducts);
        setOrders(ordersRes.data.orders);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setShowProductForm(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      category: product.category,
      stock: product.stock,
      images: product.images?.length ? product.images : [''],
      tags: product.tags?.join(', ') || '',
      sku: product.sku || ''
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
        stock: Number(productForm.stock),
        images: productForm.images.filter(Boolean),
        tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await createProduct(payload);
        toast.success('Product created!');
      }

      // Reload
      const dashRes = await getVendorDashboard();
      setProducts(dashRes.data.topProducts);
      setShowProductForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product removed');
    } catch {
      toast.error('Failed to remove product');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const TABS = ['overview', 'products', 'orders'];

  return (
    <div className="page-wrapper container">
      <div className="vendor-header">
        <div>
          <div className="vendor-greeting">Welcome back,</div>
          <h1 className="section-title">{vendorProfile?.shopName || 'Your Shop'}</h1>
          <span className={`badge ${vendorProfile?.isApproved ? 'badge-success' : 'badge-warning'}`}>
            {vendorProfile?.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
          </span>
        </div>
        <button className="btn btn-primary" onClick={openAddProduct}>+ Add Product</button>
      </div>

      {/* Tabs */}
      <div className="vendor-tabs">
        {TABS.map(t => (
          <button key={t} className={`vendor-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div className="fade-in">
          <div className="stats-grid">
            {[
              { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'info' },
              { label: 'Total Orders', value: stats.totalOrders, icon: '🛍️', color: 'accent' },
              { label: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'warning' },
              { label: 'Total Revenue', value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: '💰', color: 'success' },
            ].map((s, i) => (
              <div key={i} className="stat-card card">
                <div className={`stat-icon badge-${s.color}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="vendor-sections">
            <div className="card">
              <h3 className="card-section-title">Recent Orders</h3>
              {orders.length === 0 ? (
                <p className="empty-text">No orders yet</p>
              ) : orders.slice(0, 5).map(order => (
                <div key={order._id} className="vendor-order-row">
                  <div>
                    <div className="vendor-order-num">#{order.orderNumber}</div>
                    <div className="vendor-order-customer">{order.customer?.name}</div>
                  </div>
                  <div className="vendor-order-amount">₹{order.total?.toLocaleString()}</div>
                  <span className={`badge badge-${
                    order.orderStatus === 'delivered' ? 'success' :
                    order.orderStatus === 'cancelled' ? 'error' : 'warning'}`}>
                    {order.orderStatus}
                  </span>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="card-section-title">Top Products</h3>
              {products.length === 0 ? (
                <p className="empty-text">No products yet</p>
              ) : products.slice(0, 5).map(p => (
                <div key={p._id} className="vendor-product-row">
                  <div className="vendor-product-img">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <span>📦</span>}
                  </div>
                  <div className="vendor-product-info">
                    <div className="vendor-product-name">{p.name}</div>
                    <div className="vendor-product-meta">
                      Stock: {p.stock} · Sold: {p.totalSold}
                    </div>
                  </div>
                  <div className="vendor-product-price">₹{(p.discountPrice || p.price).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="fade-in">
          <div className="tab-actions">
            <h2 className="tab-title">Your Products</h2>
            <button className="btn btn-primary" onClick={openAddProduct}>+ Add Product</button>
          </div>
          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sold</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No products yet. Add your first product!</td></tr>
                ) : products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="table-product-img">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : '📦'}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-muted">{p.category}</span></td>
                    <td>
                      <div>₹{(p.discountPrice || p.price).toLocaleString()}</div>
                      {p.discountPrice && <div style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.price.toLocaleString()}</div>}
                    </td>
                    <td>
                      <span className={p.stock < 10 ? 'badge badge-warning' : 'badge badge-success'}>{p.stock}</span>
                    </td>
                    <td>{p.totalSold}</td>
                    <td>⭐ {p.rating?.toFixed(1) || '0.0'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEditProduct(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="fade-in">
          <h2 className="tab-title">Received Orders</h2>
          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No orders received yet</td></tr>
                ) : orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{order.orderNumber}</td>
                    <td>{order.customer?.name}</td>
                    <td>{order.items?.length} item(s)</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${
                        order.orderStatus === 'delivered' ? 'success' :
                        order.orderStatus === 'cancelled' ? 'error' :
                        order.orderStatus === 'shipped' ? 'accent' : 'warning'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowProductForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProduct} className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={productForm.name} required
                  onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" rows={3} value={productForm.description} required
                  onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" className="form-input" value={productForm.price} required min={0}
                    onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (₹)</label>
                  <input type="number" className="form-input" value={productForm.discountPrice} min={0}
                    onChange={e => setProductForm(p => ({ ...p, discountPrice: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={productForm.category} required
                    onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input type="number" className="form-input" value={productForm.stock} required min={0}
                    onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URLs (one per line)</label>
                <textarea className="form-input" rows={2}
                  value={productForm.images?.join('\n')}
                  onChange={e => setProductForm(p => ({ ...p, images: e.target.value.split('\n') }))}
                  placeholder="https://example.com/image.jpg" />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" value={productForm.tags}
                  onChange={e => setProductForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="electronics, wireless, portable" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowProductForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
