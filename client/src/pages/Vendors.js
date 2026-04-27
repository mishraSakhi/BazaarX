import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getVendors, getVendor } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './Vendors.css';

export const VendorsList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendors()
      .then(({ data }) => setVendors(data.vendors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper container">
      <div style={{ marginBottom: 40 }}>
        <h1 className="section-title">Our Vendors</h1>
        <p className="section-subtitle">Discover trusted sellers on BazaarX</p>
      </div>

      {vendors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <h3>No vendors yet</h3>
          <p>Be the first to open a shop!</p>
          <Link to="/register?role=vendor" className="btn btn-primary" style={{ marginTop: 20 }}>
            Become a Vendor
          </Link>
        </div>
      ) : (
        <div className="vendors-grid">
          {vendors.map(v => (
            <Link to={`/vendors/${v._id}`} key={v._id} className="vendor-profile-card">
              <div className="vpc-banner" />
              <div className="vpc-logo">
                {v.shopLogo
                  ? <img src={v.shopLogo} alt={v.shopName} />
                  : <span>{v.shopName?.charAt(0)}</span>
                }
              </div>
              <div className="vpc-info">
                <h3 className="vpc-name">{v.shopName}</h3>
                <span className="badge badge-muted">{v.category}</span>
                <div className="vpc-rating">
                  <span className="stars">{'★'.repeat(Math.round(v.rating || 0))}{'☆'.repeat(5 - Math.round(v.rating || 0))}</span>
                  <span>{v.rating?.toFixed(1) || '0.0'}</span>
                </div>
                {v.shopDescription && (
                  <p className="vpc-desc">{v.shopDescription}</p>
                )}
                <div className="vpc-stats">
                  <div className="vpc-stat">
                    <span className="vpc-stat-val">{v.totalSales}</span>
                    <span className="vpc-stat-label">Sales</span>
                  </div>
                  <div className="vpc-stat">
                    <span className="vpc-stat-val" style={{ color: 'var(--text-primary)' }}>View Shop →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const VendorProfile = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendor(id)
      .then(({ data }) => { setVendor(data.vendor); setProducts(data.products); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!vendor) return <div className="page-wrapper container"><p>Vendor not found.</p></div>;

  return (
    <div className="page-wrapper">
      <div className="vendor-profile-hero">
        <div className="vph-banner" />
        <div className="container vph-content">
          <div className="vph-logo">
            {vendor.shopLogo
              ? <img src={vendor.shopLogo} alt={vendor.shopName} />
              : <span>{vendor.shopName?.charAt(0)}</span>
            }
          </div>
          <div className="vph-info">
            <h1 className="vph-name">{vendor.shopName}</h1>
            <span className="badge badge-muted">{vendor.category}</span>
            <div className="vph-rating">
              <span className="stars" style={{ fontSize: 18 }}>{'★'.repeat(Math.round(vendor.rating || 0))}</span>
              <span>{vendor.rating?.toFixed(1) || '0.0'}</span>
            </div>
            {vendor.shopDescription && <p className="vph-desc">{vendor.shopDescription}</p>}
          </div>
          <div className="vph-stats">
            <div className="vph-stat">
              <span className="vph-stat-val">{vendor.totalSales}</span>
              <span>Total Sales</span>
            </div>
            <div className="vph-stat">
              <span className="vph-stat-val">{products.length}</span>
              <span>Products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40 }}>
        <h2 className="section-title" style={{ marginBottom: 24 }}>Products by {vendor.shopName}</h2>
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products listed yet</h3>
          </div>
        ) : (
          <div className="grid-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};
