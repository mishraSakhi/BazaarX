import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './Products.css';

const CATEGORIES = ['Electronics','Fashion','Home & Garden','Sports','Books','Food & Beverage','Beauty','Toys','Automotive','Other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (category) params.category = category;
      if (search) params.search = search;
      if (featured) params.featured = featured;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await getProducts(params);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page, featured, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value;
    else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  const applyPrice = () => fetchProducts();

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({ sort: 'newest' });
  };

  return (
    <div className="page-wrapper container">
      <div className="products-layout">
        {/* Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>
          </div>

          <div className="filter-section">
            <h4>Category</h4>
            <div className="filter-options">
              <label className={`filter-option ${!category ? 'active' : ''}`}>
                <input type="radio" name="category" value="" checked={!category}
                  onChange={() => updateParam('category', '')} />
                All Categories
              </label>
              {CATEGORIES.map(c => (
                <label key={c} className={`filter-option ${category === c ? 'active' : ''}`}>
                  <input type="radio" name="category" value={c} checked={category === c}
                    onChange={() => updateParam('category', c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input type="number" className="form-input" placeholder="Min ₹" value={minPrice}
                onChange={e => setMinPrice(e.target.value)} />
              <span>–</span>
              <input type="number" className="form-input" placeholder="Max ₹" value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)} />
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={applyPrice}>
              Apply
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="products-main">
          <div className="products-topbar">
            <div>
              <h1 className="products-title">
                {search ? `Results for "${search}"` : category || 'All Products'}
              </h1>
              <p className="products-count">{pagination.total || 0} products found</p>
            </div>
            <select className="form-select" value={sort} style={{ width: 'auto' }}
              onChange={e => updateParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="page-loading"><div className="spinner" /><p>Loading products...</p></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query</p>
              <button className="btn btn-outline" onClick={clearFilters} style={{ marginTop: 16 }}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button className="btn btn-outline btn-sm"
                    disabled={page === 1} onClick={() => updateParam('page', String(page - 1))}>
                    ← Previous
                  </button>
                  <span className="pagination-info">Page {page} of {pagination.pages}</span>
                  <button className="btn btn-outline btn-sm"
                    disabled={page === pagination.pages} onClick={() => updateParam('page', String(page + 1))}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
