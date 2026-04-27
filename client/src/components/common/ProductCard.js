import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

const StarRating = ({ rating, size = 14 }) => {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { addItem, loading } = useCart();
  const { isCustomer } = useAuth();

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const displayPrice = product.discountPrice || product.price;

  return (
    <div className="product-card fade-in">
      <Link to={`/products/${product._id}`} className="product-image-link">
        <div className="product-image-wrap">
          {product.images && product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="product-image" />
          ) : (
            <div className="product-image-placeholder">
              <span>📦</span>
            </div>
          )}
          {discountPercent && (
            <span className="discount-badge">-{discountPercent}%</span>
          )}
          {product.stock === 0 && (
            <div className="out-of-stock-overlay">Out of Stock</div>
          )}
          {product.isFeatured && (
            <span className="featured-badge">✦ Featured</span>
          )}
        </div>
      </Link>

      <div className="product-info">
        <div className="product-vendor">
          {product.vendor?.shopName || 'Unknown Shop'}
        </div>
        <Link to={`/products/${product._id}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-rating">
          <StarRating rating={product.rating} />
          <span className="review-count">({product.numReviews})</span>
        </div>

        <div className="product-footer">
          <div className="product-price-block">
            <span className="price">₹{displayPrice.toLocaleString()}</span>
            {product.discountPrice && (
              <span className="price-original">₹{product.price.toLocaleString()}</span>
            )}
          </div>

          {isCustomer && product.stock > 0 && (
            <button
              className="add-to-cart-btn"
              onClick={() => addItem(product._id)}
              disabled={loading}
              title="Add to Cart"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
