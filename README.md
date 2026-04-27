# ⬡ BazaarX — Multi-Vendor E-commerce Platform

> A full-stack MERN application built as part of the MERN Stack Project Assignment (April 24 – May 10)

---

## 📋 Project Overview

**BazaarX** is a production-grade multi-vendor e-commerce platform where:
- **Customers** browse, search, and purchase products from multiple vendors
- **Vendors** manage their shop, list products, and track orders
- **Admins** oversee the platform, approve vendors, and monitor sales

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| HTTP Client | Axios |
| Notifications | React-Toastify |
| Dev Tools | Nodemon, Concurrently |

---

## 📁 Project Structure

```
multivendor-ecommerce/
├── bazaarx.code-workspace     ← Open this in VS Code
├── .prettierrc
├── .gitignore
├── package.json               ← Root (runs both server + client)
│
├── server/
│   ├── index.js               ← Express entry point
│   ├── seed.js                ← Database seeder
│   ├── .env.example           ← Copy to .env
│   ├── models/
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── CartAndReview.js
│   ├── middleware/
│   │   └── auth.js            ← JWT protect + role guard
│   └── routes/
│       ├── auth.js
│       ├── products.js
│       ├── orders.js
│       ├── cart.js
│       ├── vendors.js
│       ├── admin.js
│       └── reviews.js
│
└── client/
    ├── public/index.html
    └── src/
        ├── App.js             ← All routes wired here
        ├── index.js
        ├── index.css          ← Global design system
        ├── context/
        │   ├── AuthContext.js
        │   └── CartContext.js
        ├── utils/api.js       ← All API calls
        ├── components/common/
        │   ├── Navbar.js/css
        │   ├── Footer.js/css
        │   ├── ProductCard.js/css
        │   └── ProtectedRoute.js
        └── pages/
            ├── Home.js/css
            ├── Auth.js/css        ← Login + Register
            ├── Products.js/css    ← Listing with filters
            ├── ProductDetail.js/css
            ├── Cart.js/css
            ├── Checkout.js/css
            ├── Orders.js/css      ← List + Detail
            ├── VendorDashboard.js/css
            ├── AdminDashboard.js/css
            └── Vendors.js/css
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas (cloud)
- Git

### 1. Clone / Extract the project
```bash
cd multivendor-ecommerce
```

### 2. Set up environment variables
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/multivendor_ecommerce
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
```

### 3. Install all dependencies
```bash
npm run install-all
```
This installs dependencies for root, server, and client.

### 4. Seed the database
```bash
npm run server:seed
```
Or manually:
```bash
cd server && node seed.js
```

### 5. Start the development server
```bash
npm run dev
```
This starts both backend (port 5000) and frontend (port 3000) concurrently.

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | admin123 |
| Vendor | vendor@demo.com | vendor123 |
| Customer | customer@demo.com | cust123 |

---

## 🗂️ API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |
| PUT | /api/auth/update-profile | Private |
| POST | /api/auth/wishlist/:id | Customer |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/products | Vendor/Admin |
| PUT | /api/products/:id | Vendor/Admin |
| DELETE | /api/products/:id | Vendor/Admin |

### Cart
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/cart | Customer |
| POST | /api/cart/add | Customer |
| PUT | /api/cart/update/:id | Customer |
| DELETE | /api/cart/remove/:id | Customer |
| DELETE | /api/cart/clear | Customer |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/orders | Customer |
| GET | /api/orders/my | Customer |
| GET | /api/orders/vendor | Vendor |
| GET | /api/orders/:id | Auth |
| PUT | /api/orders/:id/status | Vendor/Admin |

### Vendors
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/vendors | Public |
| GET | /api/vendors/:id | Public |
| GET | /api/vendors/dashboard/stats | Vendor |
| PUT | /api/vendors/profile/update | Vendor |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/admin/stats | Admin |
| GET | /api/admin/users | Admin |
| PUT | /api/admin/users/:id/toggle | Admin |
| GET | /api/admin/vendors | Admin |
| PUT | /api/admin/vendors/:id/approve | Admin |
| GET | /api/admin/orders | Admin |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/reviews/:productId | Public |
| POST | /api/reviews/:productId | Customer |
| DELETE | /api/reviews/:id | Customer/Admin |

---

## 💻 VS Code Setup

1. Open `bazaarx.code-workspace` in VS Code
2. Install recommended extensions when prompted:
   - **Prettier** – code formatter
   - **ESLint** – linting
   - **MongoDB for VS Code** – database viewer
   - **ES7+ React Snippets** – React shortcuts
   - **GitLens** – enhanced Git
   - **Thunder Client** – API testing (Postman alternative)
   - **Material Icon Theme** – better file icons
   - **One Dark Pro** – recommended theme

3. Use Tasks (Ctrl+Shift+P → "Run Task"):
   - **Start Dev (Full Stack)** – starts everything
   - **Seed Database** – seeds demo data
   - **Install All Dependencies** – one-shot install

---

## 📝 GitHub Daily Commit Plan

| Day | Focus |
|-----|-------|
| Apr 25–26 | Synopsis + project setup + models |
| Apr 27–28 | Auth routes + product routes |
| Apr 29–30 | Order, cart, vendor, admin routes |
| May 1–2 | React setup + auth pages + home |
| May 3–4 | Products, cart, checkout pages |
| May 5 | Vendor dashboard |
| May 6 | Admin dashboard |
| May 7–8 | Integration testing + bug fixes |
| May 9 | Documentation + final polish |
| May 10 | Final submission |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd client && npm run build
# Deploy the build/ folder to Vercel
```

### Backend → Render
```bash
# Push server/ to GitHub
# Connect to Render, set env vars, deploy
```

---

## ✅ Evaluation Criteria Coverage

| Criterion | Implementation |
|-----------|---------------|
| Functionality | All modules: Customer, Vendor, Admin |
| Code Quality | Modular, clean, well-commented routes |
| UI/UX Design | Dark luxury theme, responsive, animated |
| GitHub Activity | Daily commits with meaningful messages |
| Documentation | This README + inline code comments |

---

## 👨‍💻 Author

**Your Name** | MERN Stack Assignment | April–May 2025
