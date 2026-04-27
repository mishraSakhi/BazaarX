import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMe, toggleWishlist } from '../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    getMe()
      .then(({ data }) => setWishlist(data.user.wishlist || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId);
      setWishlist(prev => prev.filter(p => p._id !== productId));
      toast.info('Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    await addItem(productId, 1);
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper container">
      <h1 className="section-title" style={{ marginBottom: 8 }}>My Wishlist</h1>
      <p className="section-subtitle" style={{ marginBottom: 32 }}>
        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
      </p>

      {wishlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">♡</div>
          <h3>Your wishlist is empty</h3>
          <p>Save products you love by clicking the heart icon</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => {
            const displayPrice = product.discountPrice || product.price;
            const discountPct = product.discountPrice
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
              : null;

            return (
              <div key={product._id} className="wishlist-card fade-in">
                <Link to={`/products/${product._id}`} className="wishlist-img-wrap">
                  {product.images?.[0]
                    ? <img src={product.images[0]} alt={product.name} />
                    : <div className="wishlist-placeholder">📦</div>
                  }
                  {discountPct && (
                    <span className="discount-badge">-{discountPct}%</span>
                  )}
                </Link>

                <div className="wishlist-info">
                  <Link to={`/products/${product._id}`} className="wishlist-name">
                    {product.name}
                  </Link>

                  <div className="wishlist-price-row">
                    <span className="price">₹{displayPrice?.toLocaleString()}</span>
                    {product.discountPrice && (
                      <span className="price-original">₹{product.price?.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(product._id)}
                      title="Remove from wishlist"
                    >
                      ♡ Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
