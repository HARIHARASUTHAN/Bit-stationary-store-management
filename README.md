# BIT Campus Stationery Store — Frontend Portal (Pre-Ordering & Inventory Management)

A production-grade React frontend application built for **Bannari Amman Institute of Technology (BIT)**. The portal provides an end-to-end stationery pre-ordering and inventory fulfillment ecosystem supporting 4 distinct institutional roles: **Student**, **Faculty**, **Shop Admin**, and **Campus Admin**.

---

## 🚀 Key Features

### 1. Multi-Role Authentication & Access Control
- **Strict Campus Domain Validation**: Login restricted to campus domains:
  - `@student.ac.in` → Student Portal
  - `@faculty.ac.in` → Faculty Portal
  - `@shopadmin.ac.in` → Shop Admin Desk
  - `@admin.ac.in` → Campus Admin Governance
- **Session Persistence**: Stored via `AuthContext` + local storage fallback with Firebase client SDK integration.
- **One-Click Demo Credentials**: Instant role switching buttons on the login screen for testing.
- **Route Guards**: Automated role-based redirects with `<ProtectedRoute>` and custom `/unauthorized` clearance checks.

### 2. Student Experience
- **Interactive Dashboard**: Welcome banner, active pre-orders count, and popular materials highlights.
- **Stationery Catalog**: 30+ items categorized (Writing, Geometry, Notebooks, Lab manuals, Art supplies), instant search, stock level badges, price sorting, and category filters.
- **Item Detail View**: Full specs, high-res previews, stock indicators, and quantity steppers.
- **Pre-Order Tray & Cart**: Real-time total calculation, persistence across sessions via **Zustand**, item removal, and quantity adjustment.
- **Counter Slot Reservation**: Choose available pickup date and time windows (e.g. 10:00 AM – 11:00 AM) to skip campus lines.
- **Order History & Tracker**: Real-time status badges (`Pending`, `Approved`, `Ready`, `Collected`, `Cancelled`) and milestone timeline.
- **Printable Pickup Slip**: Instant counter voucher with QR/SKU breakdown.

### 3. Faculty Experience
- **Department Requisition Desk**: Specialized view for faculty indents.
- **Bulk Order Mode**: One-click toggle at checkout with department allocation remarks.
- **Priority Counter Access**: Designated Counter #2 pickup routing.

### 4. Shop Admin Experience (Store Operators)
- **Live Counter Operations Dashboard**: Real-time metrics for pending approvals, today's pickups, and low-stock warnings.
- **Inventory Management**: Comprehensive table with stock status indicators, quick stock +/- adjustment buttons, and Add/Edit Item modal forms.
- **Order Processing Queue**: Status progression actions (`Approve` → `Mark Ready for Pickup` → `Mark as Collected` or `Reject`).
- **Pickup Slot Scheduling**: Configure pickup windows, capacity bounds, and booked statistics.
- **Department Reports**: Order volume and revenue summaries by academic department.

### 5. Campus Admin Experience (Governance & Store Management)
- **Store Analytics Dashboard (Recharts)**:
  - Weekly Pre-Order Volume (Line chart)
  - Top 5 Most-Ordered Items (Horizontal Bar chart)
  - Department Orders Distribution (Pie chart)
  - Inventory Stock vs Reserved Queues (Bar chart)
- **Shop Admin Account Governance**: Create, monitor, and activate/deactivate store operator accounts.
- **System Settings**: Manage registered academic departments, daily order cutoff times, and ordering windows.
- **Audit Trail & Activity Log**: Searchable and filterable log of all inventory and order mutations.
- **Report & Ledger Export**: Instant CSV and PDF downloads for accounting audits.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (Vite 8)
- **Styling**: Tailwind CSS v3 (custom campus navy `#1e3a5f` & teal `#0d9488` palette)
- **Routing**: React Router v7 with code-split lazy routes
- **State Management**:
  - `React Context API`: Authentication, session persistence, role claims, and Toast notification queue
  - `Zustand`: Pre-order tray state management with `persist` middleware
- **Icons**: `lucide-react`
- **Charts**: `recharts`
- **HTTP Client**: `axios` with bearer token interceptors
- **Auth SDK**: `firebase` Auth client SDK

---

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/          # InventoryTable, ItemFormModal, OrderQueue, SlotConfig, AuditLogTable, AnalyticsCharts
│   ├── cart/           # CartItem, CartSummary
│   ├── catalog/        # ItemCard, CatalogGrid, CategoryFilter, StockBadge, QuantitySelector
│   ├── layout/         # Navbar, Sidebar, StudentLayout, FacultyLayout, ShopAdminLayout, AdminLayout
│   ├── orders/         # OrderStatusBadge, OrderTimeline, OrderCard
│   └── ui/             # Button, Modal, Table, Badge, Card, Input, Select, Textarea, StatCard, Toast, Spinner
├── context/            # AuthContext.jsx
├── hooks/              # useAuth, useCart, useDebounce, useFetch
├── mocks/              # Realistic datasets (items, orders, slots, users, auditLog) + delay simulator
├── pages/
│   ├── admin/          # DashboardPage, AccountsPage, SettingsPage, AuditLogPage, ReportsPage
│   ├── auth/           # LoginPage, ForgotPasswordPage, UnauthorizedPage
│   ├── faculty/        # DashboardPage, CheckoutPage
│   ├── shopadmin/      # DashboardPage, InventoryPage, OrdersPage, SlotsPage, ReportsPage
│   ├── student/        # DashboardPage, CatalogPage, ItemDetailPage, CartPage, CheckoutPage, OrdersPage, OrderDetailPage
│   └── NotFoundPage.jsx
├── routes/             # AppRouter.jsx, ProtectedRoute.jsx
├── services/           # api.js, authService.js, orderService.js, inventoryService.js, firebase.js
└── utils/              # currency.js, formatDate.js, roleGuards.js
```

---

## 📁 Repository Structure

```
.
├── frontend/                   # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/         # Modular UI, Layout, Catalog, Orders, Admin components
│   │   ├── context/            # AuthContext (Firebase + session persistence)
│   │   ├── hooks/              # useAuth, useCart (Zustand), useDebounce, useFetch
│   │   ├── pages/              # Role-based pages (student, faculty, shopadmin, admin)
│   │   ├── routes/             # AppRouter & ProtectedRoute
│   │   └── services/           # api.js, authService.js, orderService.js, inventoryService.js, slotService.js
│   ├── .env.example
│   └── package.json
│
├── backend/                    # Node.js + Express API Server with Firebase Admin
│   ├── src/
│   │   ├── config/             # firebase.js (Admin SDK & Cloud Firestore connector)
│   │   ├── controllers/        # auth, inventory, orders, slots, reports
│   │   ├── middleware/         # authMiddleware (verifyIdToken), roleGuard, errorHandler
│   │   ├── routes/             # REST endpoints (/api/inventory, /api/orders, /api/slots, etc.)
│   │   ├── scripts/            # seed.js (populates Cloud Firestore)
│   │   └── server.js           # Express app entry point (port 5001)
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🔑 Quick Demo Credentials

You can use the **1-Click Demo Buttons** on the `/login` screen or manually enter:

| Role | Email | Password |
|------|-------|----------|
| **Student** | `arjun@student.ac.in` | `student123` |
| **Faculty** | `kavitha@faculty.ac.in` | `faculty123` |
| **Shop Admin** | `suresh@shopadmin.ac.in` | `admin123` |
| **Campus Admin** | `admin@admin.ac.in` | `admin123` |

---

## ⚙️ Getting Started

### 1. Run the Backend (Express + Firebase Admin)
```bash
cd backend
npm install
npm run dev
```
- Backend runs at: **`http://localhost:5001`**
- Health check: **`http://localhost:5001/api/health`**
- Operates automatically in **Demo Mode** if Firebase credentials are not yet added.

### 2. Run the Frontend (React + Vite)
In a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Frontend runs at: **`http://localhost:5173`**

---

## 🔥 Connecting Live Firebase

1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Enable Auth**: Turn on **Email/Password** under **Authentication > Sign-in method**.
3. **Enable Database**: Create a **Cloud Firestore Database** (start in Test mode).
4. **Download Admin Key**: In Project Settings > Service accounts, click **Generate new private key**. Save it as `backend/serviceAccountKey.json`.
5. **Seed Database**:
   ```bash
   cd backend
   npm run seed
   ```
6. **Set Web Config**: Register a Web App in Firebase Console, copy your credentials into `frontend/.env`, and set `VITE_USE_MOCK_API=false`.

