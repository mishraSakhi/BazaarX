import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, getVendors } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './Home.css';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Home & Garden', icon: '🏡' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Books', icon: '📚' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Toys', icon: '🧸' },
  { name: 'Automotive', icon: '🚗' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes, vendRes] = await Promise.all([
          getProducts({ featured: true, limit: 4 }),
          getProducts({ sort: 'newest', limit: 8 }),
          getVendors(),
        ]);
        setFeaturedProducts(featRes.data.products);
        setNewArrivals(newRes.data.products);
        setVendors(vendRes.data.vendors.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">✦ Multi-Vendor Marketplace</div>
          <h1 className="hero-title">
            Discover Products<br />
            from <em>Trusted</em> Vendors
          </h1>
          <p className="hero-subtitle">
            Shop from hundreds of curated vendors. Quality products, seamless experience.
          </p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-primary btn-lg">Search</button>
          </form>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">500+</span><span>Products</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">100+</span><span>Vendors</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">10K+</span><span>Customers</span></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section container">
        <div className="section-header">
          <h2 className="section-title">Browse Categories</h2>
          <Link to="/products" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <Link
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              key={cat.name}
              className="category-card"
            >
              <div className="category-icon">{cat.icon}</div>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Hand-picked by our team</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">See All →</Link>
          </div>
          <div className="grid-4">
            {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">Fresh listings, just in</p>
            </div>
            <Link to="/products?sort=newest" className="btn btn-outline btn-sm">See All →</Link>
          </div>
          <div className="grid-4">
            {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* Top Vendors */}
      {vendors.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Top Vendors</h2>
              <p className="section-subtitle">Trusted sellers on BazaarX</p>
            </div>
            <Link to="/vendors" className="btn btn-outline btn-sm">All Vendors →</Link>
          </div>
          <div className="grid-4">
            {vendors.map(v => (
              <Link to={`/vendors/${v._id}`} key={v._id} className="vendor-card">
                <div className="vendor-logo">
                  {v.shopLogo
                    ? <img src={v.shopLogo} alt={v.shopName} />
                    : <span>{v.shopName.charAt(0)}</span>
                  }
                </div>
                <div className="vendor-info">
                  <h3>{v.shopName}</h3>
                  <span className="badge badge-muted">{v.category}</span>
                  <div className="vendor-rating">
                    {'★'.repeat(Math.round(v.rating || 0))}
                    <span className="review-count">{v.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section container">
        <div className="cta-card">
          <div className="cta-orb" />
          <h2>Want to sell on BazaarX?</h2>
          <p>Join hundreds of vendors already growing their business on our platform.</p>
          <Link to="/register?role=vendor" className="btn btn-primary btn-lg">
            Become a Vendor
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
