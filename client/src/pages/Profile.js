import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateVendorProfile } from '../utils/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, vendorProfile, loadUser, isVendor } = useAuth();

  const [userForm, setUserForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    },
  });

  const [vendorForm, setVendorForm] = useState({
    shopName: vendorProfile?.shopName || '',
    shopDescription: vendorProfile?.shopDescription || '',
    category: vendorProfile?.category || '',
  });

  const [savingUser, setSavingUser] = useState(false);
  const [savingVendor, setSavingVendor] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Food & Beverage','Beauty','Toys','Automotive','Other'];

  const handleUserSave = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      await updateProfile(userForm);
      await loadUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingUser(false);
    }
  };

  const handleVendorSave = async (e) => {
    e.preventDefault();
    setSavingVendor(true);
    try {
      await updateVendorProfile(vendorForm);
      await loadUser();
      toast.success('Shop details updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shop');
    } finally {
      setSavingVendor(false);
    }
  };

  const setAddr = (field, val) =>
    setUserForm(p => ({ ...p, address: { ...p.address, [field]: val } }));

  return (
    <div className="page-wrapper container" style={{ maxWidth: 760 }}>
      <div className="profile-header">
        <div className="profile-avatar-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="section-title" style={{ marginBottom: 4 }}>{user?.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</p>
          <span className={`badge ${
            user?.role === 'admin' ? 'badge-accent' :
            user?.role === 'vendor' ? 'badge-info' : 'badge-muted'}`} style={{ marginTop: 8 }}>
            {user?.role}
          </span>
        </div>
      </div>

      <div className="vendor-tabs" style={{ marginBottom: 28 }}>
        <button className={`vendor-tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}>Personal Info</button>
        {isVendor && (
          <button className={`vendor-tab ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}>Shop Details</button>
        )}
      </div>

      {activeTab === 'personal' && (
        <div className="card fade-in">
          <h2 className="checkout-section-title">Personal Information</h2>
          <form onSubmit={handleUserSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={userForm.name}
                  onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={userForm.phone}
                  onChange={e => setUserForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 9876543210" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email cannot be changed</span>
            </div>

            <div className="profile-section-label">Address</div>

            <div className="form-group">
              <label className="form-label">Street</label>
              <input className="form-input" value={userForm.address.street}
                onChange={e => setAddr('street', e.target.value)} placeholder="House No, Street, Area" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={userForm.address.city}
                  onChange={e => setAddr('city', e.target.value)} placeholder="Mumbai" />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={userForm.address.state}
                  onChange={e => setAddr('state', e.target.value)} placeholder="Maharashtra" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input className="form-input" value={userForm.address.zipCode}
                  onChange={e => setAddr('zipCode', e.target.value)} placeholder="400001" />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" value={userForm.address.country}
                  onChange={e => setAddr('country', e.target.value)} placeholder="India" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={savingUser}>
                {savingUser ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'shop' && isVendor && (
        <div className="card fade-in">
          <h2 className="checkout-section-title">Shop Details</h2>
          <div style={{ marginBottom: 20 }}>
            <span className={`badge ${vendorProfile?.isApproved ? 'badge-success' : 'badge-warning'}`}>
              {vendorProfile?.isApproved ? '✓ Approved' : '⏳ Pending Admin Approval'}
            </span>
          </div>
          <form onSubmit={handleVendorSave}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input className="form-input" value={vendorForm.shopName}
                onChange={e => setVendorForm(p => ({ ...p, shopName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={vendorForm.category}
                onChange={e => setVendorForm(p => ({ ...p, category: e.target.value }))} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Shop Description</label>
              <textarea className="form-input" rows={4} value={vendorForm.shopDescription}
                onChange={e => setVendorForm(p => ({ ...p, shopDescription: e.target.value }))}
                placeholder="Tell customers about your shop..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={savingVendor}>
                {savingVendor ? 'Saving...' : 'Update Shop'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
