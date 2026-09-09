# BIT Campus Stationery Store — Backend API

Node.js + Express REST API server integrated with **Firebase Admin SDK** (Authentication token verification & Cloud Firestore database) for the BIT Campus Stationery Pre-Ordering & Inventory Portal.

---

## 🏗️ Architecture & Features

- **Port**: `5001` (avoids macOS AirPlay Receiver port 5000 conflict).
- **Authentication**: Verifies Firebase ID Tokens (`Authorization: Bearer <token>`) using `admin.auth().verifyIdToken()`.
- **Role-Based Access Control**:
  - Automatically manages campus roles (`student`, `faculty`, `shopadmin`, `admin`) based on institutional email domains.
  - Enforces route permissions with `requireRole(['shopadmin', 'admin'])`.
- **Database (Cloud Firestore)**:
  - `inventory`: Stationery products, live shelf stock counts, threshold warnings, SKU tags.
  - `orders`: Pre-orders, automatic stock deduction, status progression timeline, pickup slots.
  - `slots`: Pickup windows and hourly capacity tracking.
  - `audit_logs`: Activity and mutation logs.
  - `users`: User accounts and roles.
- **Graceful Fallback Mode**:
  - Operates automatically in **Demo / Mock Mode** if Firebase credentials are not yet configured in `.env`, allowing local development and testing without server crashes.
- **Database Seeding (`npm run seed`)**:
  - Automated CLI script to populate all 30 campus stationery items and pickup slots into Firestore with one command.

---

## 🔌 API Endpoints

### Health Check
- `GET /api/health` — Service status and Firebase connection mode.

### Inventory (`/api/inventory`)
- `GET /api/inventory` — Browse catalog (supports `?category=...&search=...`).
- `GET /api/inventory/:id` — Get single stationery item details.
- `POST /api/inventory` — Add new stationery product *(Requires `shopadmin` or `admin`)*.
- `PUT /api/inventory/:id` — Update item details or shelf stock *(Requires `shopadmin` or `admin`)*.
- `DELETE /api/inventory/:id` — Remove item from catalog *(Requires `shopadmin` or `admin`)*.

### Orders (`/api/orders`)
- `GET /api/orders` — List pre-orders (scoped to logged-in student/faculty; shopadmin/admin view all).
- `GET /api/orders/:id` — Order details and timeline.
- `POST /api/orders` — Place pre-order (automatically deducts inventory stock).
- `PATCH /api/orders/:id/status` — Update order status progression (`Approved`, `Ready`, `Collected`, `Cancelled`).

### Pickup Slots (`/api/slots`)
- `GET /api/slots` — List available pickup time windows.
- `POST /api/slots` — Add pickup window *(Requires `shopadmin` or `admin`)*.
- `PUT /api/slots/:id` — Update slot capacity *(Requires `shopadmin` or `admin`)*.

### Auth & Roles (`/api/auth`)
- `POST /api/auth/sync-role` — Assigns Firebase custom claims based on campus email domain.
- `GET /api/auth/me` — Current authenticated user profile.
- `GET /api/auth/accounts` — Registered accounts *(Requires `admin`)*.

### Reports (`/api/reports`)
- `GET /api/reports/department` — Department-wise order and billing summaries.
- `GET /api/reports/audit-log` — Administrative audit log.

---

## 🔥 Step-by-Step: Connecting Live Firebase

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g. `bit-stationery-store`).
3. Click **Continue** and finish project creation.

### Step 2: Enable Firebase Authentication
1. In the left menu, click **Build > Authentication**.
2. Click **Get Started**.
3. Under **Sign-in method**, choose **Email/Password**.
4. Enable **Email/Password** and click **Save**.

### Step 3: Enable Cloud Firestore Database
1. In the left menu, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your nearest database location (e.g., `asia-south1` for Mumbai).
4. Start in **Test mode** (for development) and click **Create**.

### Step 4: Generate Firebase Admin Service Account Key
1. In the Firebase Console, click the **Gear icon (Project settings)** in the top left.
2. Go to the **Service accounts** tab.
3. Click **Generate new private key**, then click **Generate key**.
4. A `.json` file will download to your computer.
5. Rename that file to `serviceAccountKey.json` and move it into this `backend/` folder:
   ```bash
   mv ~/Downloads/your-project-firebase-adminsdk-*.json "backend/serviceAccountKey.json"
   ```
6. Ensure `backend/.env` points to the file:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   ```

### Step 5: Seed Cloud Firestore Database
Once `serviceAccountKey.json` is in place, run the seed script:
```bash
npm run seed
```
This will automatically upload all 30 campus stationery supplies and pickup windows into your live Firestore database!

### Step 6: Connect Frontend
1. In the Firebase Console, go to **Project settings > General**.
2. Scroll to **Your apps**, click the **Web icon (`</>`)**, and register the app.
3. Copy the `firebaseConfig` keys into `frontend/.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_API_BASE_URL=http://localhost:5001/api
   VITE_USE_MOCK_API=false
   ```

---

## 🚀 Running the Backend Server

```bash
# In the backend directory:
npm run dev
```

The server will start on **`http://localhost:5001`**.
