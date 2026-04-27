import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div className="footer-brand">
        <Link to="/" className="footer-logo">
          <span>⬡</span> Bazaar<em>X</em>
        </Link>
        <p className="footer-tagline">The marketplace where vendors and customers meet.</p>
      </div>
      <div className="footer-links">
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/vendors">Vendors</Link>
          <Link to="/products?featured=true">Featured</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
          <Link to="/orders">My Orders</Link>
        </div>
        <div className="footer-col">
          <h4>Vendors</h4>
          <Link to="/register?role=vendor">Become a Vendor</Link>
          <Link to="/vendor/dashboard">Dashboard</Link>
        </div>
      </div>
    </div>
    <div className="footer-bottom container">
      <p>© {new Date().getFullYear()} BazaarX. Built with MERN Stack.</p>
    </div>
  </footer>
);

export default Footer;
