import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getReviews, createReview } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const StarRating = ({ rating, interactive = false, onRate }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => (
      <span
        key={s}
        className={`star ${s <= Math.round(rating) ? 'filled' : ''}`}
        style={{ cursor: interactive ? 'pointer' : 'default', fontSize: interactive ? 24 : 16 }}
        onClick={() => interactive && onRate && onRate(s)}
      >★</span>
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const { addItem } = useCart();
  const { isCustomer, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([getProduct(id), getReviews(id)]);
        setProduct(prodRes.data.product);
        setReviews(revRes.data.reviews);
      } catch { navigate('/products'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, navigate]);

  const handleAddToCart = () => addItem(product._id, qty);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      const { data } = await createReview(id, review);
      setReviews(prev => [data.review, ...prev]);
      setReview({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!product) return null;

  const displayPrice = product.discountPrice || product.price;
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="page-wrapper container">
      <div className="product-detail fade-in">
        {/* Images */}
        <div className="product-gallery">
          <div className="main-image-wrap">
            {product.images?.length > 0
              ? <img src={product.images[selectedImg]} alt={product.name} className="main-image" />
              : <div className="main-image-placeholder">📦</div>
            }
            {discountPct && <span className="discount-badge">-{discountPct}%</span>}
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnail-row">
              {product.images.map((img, i) => (
                <button key={i}
                  className={`thumbnail ${i === selectedImg ? 'active' : ''}`}
                  onClick={() => setSelectedImg(i)}>
                  <img src={img} alt={`${product.name} ${i+1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <div className="detail-vendor">
            {product.vendor?.shopName}
          </div>
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-rating">
            <StarRating rating={product.rating} />
            <span className="detail-rating-text">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
          </div>

          <div className="detail-price-block">
            <span className="price" style={{ fontSize: 28 }}>₹{displayPrice.toLocaleString()}</span>
            {product.discountPrice && (
              <>
                <span className="price-original">₹{product.price.toLocaleString()}</span>
                <span className="price-discount badge badge-success">{discountPct}% off</span>
              </>
            )}
          </div>

          <div className="detail-stock">
            {product.stock > 0
              ? <span className="badge badge-success">✓ In Stock ({product.stock} left)</span>
              : <span className="badge badge-error">✗ Out of Stock</span>
            }
          </div>

          <div className="detail-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.specifications?.length > 0 && (
            <div className="detail-specs">
              <h3>Specifications</h3>
              <div className="specs-grid">
                {product.specifications.map((s, i) => (
                  <div key={i} className="spec-row">
                    <span className="spec-key">{s.key}</span>
                    <span className="spec-val">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCustomer && product.stock > 0 && (
            <div className="detail-actions">
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1 }}>
                Add to Cart
              </button>
            </div>
          )}

          <div className="detail-meta">
            <span className="badge badge-muted">{product.category}</span>
            {product.tags?.map(t => <span key={t} className="badge badge-muted">{t}</span>)}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2 className="section-title">Customer Reviews</h2>

        {isCustomer && (
          <div className="review-form card">
            <h3>Write a Review</h3>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <StarRating rating={review.rating} interactive onRate={(r) => setReview(prev => ({ ...prev, rating: r }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" placeholder="Summary of your review"
                  value={review.title} onChange={e => setReview(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea className="form-input" rows={4} placeholder="Share your experience..."
                  value={review.comment} onChange={e => setReview(p => ({ ...p, comment: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No reviews yet</h3>
              <p>Be the first to review this product</p>
            </div>
          ) : reviews.map(r => (
            <div key={r._id} className="review-card card">
              <div className="review-header">
                <div className="reviewer-avatar">{r.user?.name?.charAt(0)}</div>
                <div>
                  <div className="reviewer-name">{r.user?.name}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StarRating rating={r.rating} />
                    {r.isVerifiedPurchase && <span className="badge badge-success" style={{ fontSize: 11 }}>Verified</span>}
                  </div>
                </div>
                <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
              {r.title && <div className="review-title">{r.title}</div>}
              <p className="review-comment">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
