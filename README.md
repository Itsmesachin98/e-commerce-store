# 🧵 Urban Stitch — Scalable E-Commerce Platform

> A production-grade full-stack e-commerce application built with the MERN stack, designed for scalability, security, and real-world deployment.

🌐 **Live Demo:** https://urban-stitch-clothing.vercel.app
💻 **Source Code:** https://github.com/Itsmesachin98/urban-stitch

---

## 🚀 Why This Project Stands Out

Urban Stitch is not just a CRUD-based e-commerce app — it is built with **real-world backend architecture and production best practices**, including:

- Secure **JWT authentication with refresh token rotation**
- **Role-Based Access Control (RBAC)** for admin & users
- **Stripe integration** for real payment workflows
- **Redis caching** for performance optimization
- **Cloudinary integration** for scalable media handling
- Clean, modular, and maintainable backend structure

---

## 🧠 Key Features

### 🔐 Authentication & Security

- JWT-based authentication with **access + refresh tokens**
- Secure password hashing using bcrypt
- HTTP-only cookies for enhanced protection
- Role-based route protection (Admin / User)

### 🛍️ Product & Catalog System

- Category-based product browsing
- Admin-controlled product management (CRUD)
- Featured products with Redis caching
- Rich product schema (images, pricing, metadata)

### 🛒 Shopping Cart

- Persistent cart across sessions
- Real-time quantity updates
- Optimized backend synchronization

### 💳 Payments (Stripe Integration)

- Secure checkout using Stripe
- Dynamic session creation
- Coupon-based discount system
- Payment success & cancellation handling

### 🎟️ Coupon System

- Admin-generated coupon codes
- Expiry validation & user-specific coupons
- Real-time discount calculation

### 📊 Admin Dashboard

- Product and inventory management
- Sales tracking and order monitoring
- Feature toggling for products

---

## 🏗️ Architecture & Tech Stack

### Backend

- **Node.js + Express.js**
- **MongoDB + Mongoose**
- **Redis (Upstash)** for caching
- **JWT Authentication**
- **Stripe API**
- **Cloudinary**

### Frontend

- **React (Vite)**
- **Zustand** (State Management)
- **Tailwind CSS**
- **Axios**
- **Framer Motion**

---

## 📁 Project Structure (Clean & Scalable)

```
urban-stitch/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & RBAC
│   ├── services/        # Token logic
│   ├── lib/             # External configs (DB, Stripe, Redis)
│   └── utils/           # Helper functions
│
├── frontend/
│   ├── components/      # Reusable UI
│   ├── pages/           # Route-level components
│   ├── stores/          # Zustand state
│   └── lib/             # Axios config
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB**
- **Redis**
- **Stripe Account**
- **Cloudinary Account**

### Installation

**Step 1: Clone the repository**

```bash
git clone https://github.com/Itsmesachin98/urban-stitch.git
cd urban-stitch
```

**Step 2: Install backend dependencies**

```bash
cd backend
npm install
```

**Step 3: Install frontend dependencies**

```bash
cd ../frontend
npm install
```

### Environment Configuration

**Backend Configuration** - Create `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/urban-stitch?retryWrites=true&w=majority

# Redis
UPSTASH_REDIS_URL=redis://default:<password>@<host>:<port>

# JWT Secrets (use strong, random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here_min_32_chars
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here_min_32_chars

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

**Frontend Configuration** - Create `.env.local` file in the `frontend` directory:

```env
VITE_PUBLISHABLE_KEY=pk_test_your_stripe_public_key
VITE_API_URL=http://localhost:5000
```

### Running the Application

**Terminal 1 - Start Backend Server**

```bash
cd backend
node app.js
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server**

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 📈 What This Project Demonstrates

- Designing **scalable backend systems**
- Implementing **secure authentication flows**
- Integrating **third-party services (Stripe, Cloudinary)**
- Using **Redis for performance optimization**
- Writing **clean, modular, production-ready code**
- Managing **state efficiently in React**

---

## 👨‍💻 Author

**Sachin Kumar**

- GitHub: https://github.com/Itsmesachin98
- Focus: Backend Engineering | Scalable Systems | MERN Stack

---

## ⭐ Final Note

This project reflects **real-world engineering practices**, not just tutorial-level implementation.
It is built to demonstrate **readiness for backend and full-stack roles**.

---
