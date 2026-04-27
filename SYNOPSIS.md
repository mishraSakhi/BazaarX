# Project Synopsis
## MERN Stack Project Assignment — April 2025

---

**Student Name:** ___________________________
**Project Title:** BazaarX — Multi-Vendor E-commerce Platform
**Problem Statement:** 4.3 — Multi-Vendor E-commerce Platform
**Submission Date:** April 26, 2025

---

## 1. Problem Statement

To develop a full-featured e-commerce platform that supports multiple sellers, enabling customers to browse and purchase products from different vendors through a unified marketplace.

---

## 2. Proposed Solution

**BazaarX** is a MERN-stack web application that creates a three-sided marketplace:

- **Customers** register, browse products by category/search/filters, add items to cart, checkout, and track orders.
- **Vendors** register their shop, list and manage products, monitor incoming orders, and view sales analytics through a personal dashboard.
- **Admins** approve vendors, manage users, oversee all platform orders, and view revenue statistics with monthly charts.

The platform is designed with a dark luxury aesthetic, full responsiveness, and real-time feedback via toast notifications.

---

## 3. Key Features

### Customer Module
- User registration and login (JWT-based auth)
- Product browsing with category filter, price range, search, sort
- Product detail with image gallery, specifications, and reviews
- Shopping cart with quantity management and shipping calculation
- Multi-step checkout (address → payment → review)
- Order history with real-time status tracking
- Wishlist management
- Product rating and review system (verified purchase badge)

### Vendor Module
- Vendor registration with shop profile
- Product CRUD (create, read, update, delete)
- Order management — view received orders, update item status
- Sales dashboard — revenue, order count, top products
- Shop profile editor

### Admin Module
- Platform statistics — users, vendors, products, revenue
- Monthly revenue bar chart
- Vendor approval system (new vendors need admin approval)
- User activate/deactivate controls
- Full orders overview across all vendors

---

## 4. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Context API, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas / Local, Mongoose ODM |
| Authentication | JWT (JSON Web Tokens), bcryptjs |
| Styling | Custom CSS with CSS Variables (dark theme) |
| Notifications | React-Toastify |
| Dev Tools | Nodemon, Concurrently, Postman |
| Version Control | Git + GitHub |
| Deployment | Vercel (frontend), Render (backend) |

---

## 5. Database Schema Overview

| Collection | Key Fields |
|------------|-----------|
| Users | name, email, password (hashed), role, address, wishlist |
| Vendors | user (ref), shopName, category, isApproved, totalRevenue |
| Products | vendor (ref), name, price, discountPrice, category, stock, images |
| Orders | customer (ref), items[], shippingAddress, total, orderStatus |
| Cart | user (ref), items[{ product, quantity, price }] |
| Reviews | product (ref), user (ref), rating, comment, isVerifiedPurchase |

---

## 6. System Architecture

```
Client (React)  ←→  REST API (Express)  ←→  MongoDB
     ↓                     ↓
Context API           JWT Middleware
AuthContext           Role Guard
CartContext           Route Handlers
```

---

## 7. Development Timeline

| Date | Milestone |
|------|-----------|
| Apr 24–25 | Project planning, schema design |
| Apr 26 | Synopsis submission ✓ |
| Apr 27–30 | Backend: Models, Auth, Product, Order APIs |
| May 1–5 | Frontend: All pages and components |
| May 6–8 | Integration, testing, bug fixes |
| May 9 | Documentation, README, final polish |
| May 10 | Final submission |

---

## 8. Expected Outcome

A fully functional multi-vendor marketplace with:
- Role-based access control (Customer / Vendor / Admin)
- Complete shopping flow (browse → cart → checkout → track)
- Vendor product management and order fulfillment
- Admin platform governance and analytics
- Responsive, modern UI with clean codebase

---

## 9. GitHub Repository

**Repo URL:** https://github.com/[your-username]/bazaarx-mern

**Structure:**
```
bazaarx-mern/
├── client/    (React frontend)
└── server/    (Node.js + Express backend)
```

---

*Submitted by: ___________________________*
*Date: April 26, 2025*
