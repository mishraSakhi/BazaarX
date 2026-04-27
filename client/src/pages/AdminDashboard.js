import React, { useEffect, useState } from 'react';
import { getAdminStats, getAdminUsers, getAdminVendors, getAdminOrders, approveVendor, toggleUserStatus } from '../utils/api';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, vendorsRes, ordersRes] = await Promise.all([
          getAdminStats(), getAdminUsers(), getAdminVendors(), getAdminOrders()
        ]);
        setStats(statsRes.data.stats);
        setMonthlyRevenue(statsRes.data.monthlyRevenue);
        setUsers(usersRes.data.users);
        setVendors(vendorsRes.data.vendors);
        setOrders(ordersRes.data.orders);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApproveVendor = async (id) => {
    try {
      await approveVendor(id);
      setVendors(prev => prev.map(v => v._id === id ? { ...v, isApproved: true } : v));
      toast.success('Vendor approved!');
    } catch { toast.error('Failed to approve vendor'); }
  };

  const handleToggleUser = async (id) => {
    try {
      const { data } = await toggleUserStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const maxRev = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  const TABS = ['overview', 'vendors', 'users', 'orders'];

  return (
    <div className="page-wrapper container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and management</p>
      </div>

      <div className="vendor-tabs">
        {TABS.map(t => (
          <button key={t} className={`vendor-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'vendors' && stats?.pendingVendors > 0 && (
              <span className="tab-badge">{stats.pendingVendors}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div className="fade-in">
          <div className="stats-grid">
            {[
              { label: 'Total Customers', value: stats.totalUsers, icon: '👥', color: 'info' },
              { label: 'Total Vendors', value: stats.totalVendors, icon: '🏪', color: 'accent' },
              { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'warning' },
              { label: 'Total Orders', value: stats.totalOrders, icon: '🛍️', color: 'success' },
              { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'success' },
              { label: 'Pending Vendors', value: stats.pendingVendors, icon: '⏳', color: 'warning' },
            ].map((s, i) => (
              <div key={i} className="stat-card card">
                <div className={`stat-icon badge-${s.color}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3 className="card-section-title">Monthly Revenue (Last 6 months)</h3>
            <div className="revenue-chart">
              {monthlyRevenue.map((m, i) => (
                <div key={i} className="chart-col">
                  <div className="chart-value">₹{(m.revenue / 1000).toFixed(0)}k</div>
                  <div className="chart-bar-wrap">
                    <div
                      className="chart-bar"
                      style={{ height: `${(m.revenue / maxRev) * 100}%` }}
                    />
                  </div>
                  <div className="chart-label">{m.month}</div>
                  <div className="chart-orders">{m.orders} orders</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="card-section-title">Recent Orders</h3>
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th>
                </tr></thead>
                <tbody>
                  {orders.slice(0, 8).map(o => (
                    <tr key={o._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{o.orderNumber}</td>
                      <td>{o.customer?.name}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{o.total?.toLocaleString()}</td>
                      <td>
                        <span className={`badge badge-${
                          o.orderStatus === 'delivered' ? 'success' :
                          o.orderStatus === 'cancelled' ? 'error' : 'warning'}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vendors */}
      {activeTab === 'vendors' && (
        <div className="fade-in card table-wrapper">
          <table>
            <thead><tr>
              <th>Shop Name</th><th>Owner</th><th>Category</th><th>Revenue</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.shopName}</td>
                  <td>{v.user?.name}<br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.user?.email}</span></td>
                  <td><span className="badge badge-muted">{v.category}</span></td>
                  <td style={{ color: 'var(--accent)' }}>₹{(v.totalRevenue || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${v.isApproved ? 'badge-success' : 'badge-warning'}`}>
                      {v.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {!v.isApproved && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleApproveVendor(v._id)}>
                        Approve
                      </button>
                    )}
                    {v.isApproved && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>✓ Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="fade-in card table-wrapper">
          <table>
            <thead><tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role === 'admin' ? 'accent' : u.role === 'vendor' ? 'info' : 'muted'}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-outline'}`}
                        onClick={() => handleToggleUser(u._id)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders */}
      {activeTab === 'orders' && (
        <div className="fade-in card table-wrapper">
          <table>
            <thead><tr>
              <th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{o.orderNumber}</td>
                  <td>{o.customer?.name}</td>
                  <td>{o.items?.length}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{o.total?.toLocaleString()}</td>
                  <td><span className="badge badge-muted">{o.paymentMethod?.toUpperCase()}</span></td>
                  <td>
                    <span className={`badge badge-${
                      o.orderStatus === 'delivered' ? 'success' :
                      o.orderStatus === 'cancelled' ? 'error' : 'warning'}`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
