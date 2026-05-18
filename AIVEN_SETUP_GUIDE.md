# 🌊 Water Market — Aiven MySQL + MySQL Workbench Setup Guide

This guide walks you through setting up a **free Aiven MySQL database**, connecting it to **MySQL Workbench**, importing the schema, and connecting your React app to it via a Node.js backend.

---

## 📋 Table of Contents
1. [Create Aiven Account & Database](#1-create-aiven-account--database)
2. [Get Connection Details](#2-get-connection-details)
3. [Install MySQL Workbench](#3-install-mysql-workbench)
4. [Connect Workbench to Aiven](#4-connect-workbench-to-aiven)
5. [Import the Database Schema](#5-import-the-database-schema)
6. [Build the Node.js Backend](#6-build-the-nodejs-backend)
7. [Connect React Frontend](#7-connect-react-frontend)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Create Aiven Account & Database

### Step 1 — Sign up
1. Go to **https://aiven.io/**
2. Click **"Get started for free"** (no credit card required for free trial).
3. Sign up with Google, GitHub, or email.
4. Verify your email.

### Step 2 — Create MySQL Service
1. From the dashboard, click **"+ Create service"**.
2. Choose **MySQL** as the service type.
3. Select **Free plan** (Hobbyist — 1 month free).
4. Choose a cloud provider (e.g., **AWS / Google Cloud**) and a region **closest to you** (e.g., `asia-southeast1` for the Philippines).
5. Name your service: `water-market-db`
6. Click **"Create service"**.

⏳ Wait 2–5 minutes for the service to provision (status will change from `Rebuilding` → `Running`).

---

## 2. Get Connection Details

Once the service is **Running**:

1. Click on your `water-market-db` service.
2. Go to the **"Overview"** tab.
3. You'll see **Connection Information**:

```
Host:      mysql-water-market-xxxxx.aivencloud.com
Port:      12345
User:      avnadmin
Password:  AVNS_xxxxxxxxxxxxxxxxxxxx
Database:  defaultdb
SSL Mode:  REQUIRED
```

💾 **Save these credentials** — you'll need them for both Workbench and your backend.

You can also download the **CA certificate** (`ca.pem`) from the same page — required for SSL connections.

---

## 3. Install MySQL Workbench

### Windows
1. Download from: **https://dev.mysql.com/downloads/workbench/**
2. Run the installer → choose **Full** setup.
3. Skip the "Sign in to Oracle" step (Click "No thanks, just start my download").

### macOS
```bash
brew install --cask mysqlworkbench
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-workbench
```

---

## 4. Connect Workbench to Aiven

### Step 1 — Open Workbench & Create New Connection
1. Open **MySQL Workbench**.
2. On the Home screen, click the **➕ (plus)** icon next to "MySQL Connections".

### Step 2 — Fill Connection Settings

| Field | Value |
|-------|-------|
| **Connection Name** | `Water Market — Aiven` |
| **Connection Method** | Standard (TCP/IP) |
| **Hostname** | `mysql-water-market-xxxxx.aivencloud.com` (from Aiven) |
| **Port** | `12345` (your specific port from Aiven) |
| **Username** | `avnadmin` |
| **Password** | Click "Store in Vault" → paste your Aiven password |
| **Default Schema** | `defaultdb` |

### Step 3 — Enable SSL (REQUIRED for Aiven)
1. Switch to the **"SSL"** tab.
2. Set **"Use SSL"** to **`Require`**.
3. **"SSL CA File"** → click the `...` button → select the `ca.pem` file you downloaded from Aiven.
4. Leave SSL Cert & SSL Key blank.

### Step 4 — Test & Save
1. Click **"Test Connection"** → should show **"Successfully made the MySQL connection"** ✅
2. If you get a warning about version mismatch, click **"Continue Anyway"**.
3. Click **"OK"** to save.
4. Double-click your saved connection to open it.

---

## 5. Import the Database Schema

### Method A — Run SQL Script (Recommended)
1. In MySQL Workbench, open the connected database.
2. Click **File → Open SQL Script** → select `database_schema.sql` (provided in the project root).
3. Click the **⚡ lightning bolt** icon (Execute) — or press `Ctrl+Shift+Enter` (Windows) / `Cmd+Shift+Return` (Mac).
4. You should see **"6 row(s) affected"** in the output panel.

### Method B — Copy-Paste
1. Open a new query tab in Workbench.
2. Copy the contents of `database_schema.sql`.
3. Paste and click **Execute**.

### Verify Setup
Click **"Refresh"** in the SCHEMAS sidebar. You should see:
```
📁 water_market_db
   📂 Tables
      📋 users           (2 rows — admin & staff)
      📋 products        (1 row — Purified Water)
      📋 orders          (empty)
      📋 order_items     (empty)
```

Run a quick test:
```sql
USE water_market_db;
SELECT * FROM users;
SELECT * FROM products;
```

---

## 6. Build the Node.js Backend

You need a backend API to connect your React app to MySQL (the browser cannot connect to MySQL directly).

### Step 1 — Create Backend Folder
```bash
mkdir water-market-backend
cd water-market-backend
npm init -y
npm install express mysql2 cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

### Step 2 — Create `.env` file
```env
DB_HOST=mysql-water-market-xxxxx.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=AVNS_xxxxxxxxxxxxxxxxxxxx
DB_NAME=water_market_db
DB_SSL_CA=./ca.pem
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
```

Put the `ca.pem` file from Aiven in the backend root.

### Step 3 — Create `db.js`
```js
import mysql from 'mysql2/promise';
import fs from 'fs';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { ca: fs.readFileSync(process.env.DB_SSL_CA) },
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection
pool.getConnection()
  .then(() => console.log('✅ Connected to Aiven MySQL'))
  .catch(err => console.error('❌ DB connection failed:', err.message));
```

### Step 4 — Create `server.js`
```js
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For GCash receipt images

// ===== AUTH =====
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
  const user = rows[0];
  // For production: use bcrypt.compare(password, user.password)
  if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, barangay: user.barangay });
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, contact_number, barangay } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, contact_number, barangay, role) VALUES (?, ?, ?, ?, ?, "customer")',
      [name, email, password, contact_number, barangay]
    );
    res.json({ id: result.insertId, name, email, role: 'customer', barangay });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== USERS =====
app.get('/api/users', async (_, res) => {
  const [rows] = await pool.query('SELECT id, name, email, contact_number, barangay, role, created_at FROM users');
  res.json(rows);
});

app.post('/api/users', async (req, res) => {
  const { name, email, password, contact_number, barangay, role } = req.body;
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, contact_number, barangay, role) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, password, contact_number, barangay, role]
  );
  res.json({ id: result.insertId });
});

app.put('/api/users/:id', async (req, res) => {
  const { name, email, contact_number, barangay, role } = req.body;
  await pool.query(
    'UPDATE users SET name=?, email=?, contact_number=?, barangay=?, role=? WHERE id=?',
    [name, email, contact_number, barangay, role, req.params.id]
  );
  res.json({ success: true });
});

app.delete('/api/users/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== ORDERS =====
app.get('/api/orders', async (req, res) => {
  const { barangay } = req.query;
  const sql = barangay && barangay !== 'All' 
    ? 'SELECT * FROM orders WHERE barangay = ? ORDER BY created_at DESC'
    : 'SELECT * FROM orders ORDER BY created_at DESC';
  const [rows] = await pool.query(sql, barangay && barangay !== 'All' ? [barangay] : []);
  res.json(rows);
});

app.post('/api/orders', async (req, res) => {
  const { user_id, customer_name, type, total, payment, paymentStatus, status, barangay, address, gcashReference, gcashReceipt, items } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO orders (user_id, customer_name_manual, order_type, total_amount, payment_method, payment_status, order_status, address, gcash_reference, gcash_receipt, barangay)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, customer_name, type, total, payment, paymentStatus, status, address, gcashReference, gcashReceipt, barangay]
    );
    const orderId = result.insertId;
    for (const item of items) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
    }
    await conn.commit();
    res.json({ id: orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  const { status, paymentStatus } = req.body;
  await pool.query(
    'UPDATE orders SET order_status = COALESCE(?, order_status), payment_status = COALESCE(?, payment_status) WHERE id = ?',
    [status, paymentStatus, req.params.id]
  );
  res.json({ success: true });
});

app.delete('/api/orders/:id', async (req, res) => {
  await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== REPORTS =====
app.get('/api/reports/stats', async (req, res) => {
  const { barangay } = req.query;
  const where = barangay && barangay !== 'All' ? 'WHERE barangay = ?' : '';
  const params = barangay && barangay !== 'All' ? [barangay] : [];

  const [[{ todayRevenue }]] = await pool.query(
    `SELECT COALESCE(SUM(total_amount),0) AS todayRevenue FROM orders ${where ? where + ' AND' : 'WHERE'} DATE(created_at)=CURDATE() AND payment_status='paid'`, params
  );
  const [[{ monthlyRevenue }]] = await pool.query(
    `SELECT COALESCE(SUM(total_amount),0) AS monthlyRevenue FROM orders ${where ? where + ' AND' : 'WHERE'} MONTH(created_at)=MONTH(CURDATE()) AND payment_status='paid'`, params
  );
  const [[{ pendingOrders }]] = await pool.query(
    `SELECT COUNT(*) AS pendingOrders FROM orders ${where ? where + ' AND' : 'WHERE'} order_status IN ('pending','verifying')`, params
  );
  res.json({ todayRevenue, monthlyRevenue, pendingOrders });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
```

### Step 5 — Update `package.json`
```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

### Step 6 — Run the backend
```bash
npm run dev
```

You should see:
```
✅ Connected to Aiven MySQL
🚀 API running on http://localhost:5000
```

Test it: open **http://localhost:5000/api/users** in your browser. You should see JSON output.

---

## 7. Connect React Frontend

### Step 1 — Update `database_schema.sql`
Make sure your orders table supports GCash fields. Add to `database_schema.sql`:

```sql
ALTER TABLE orders 
  ADD COLUMN gcash_reference VARCHAR(50),
  ADD COLUMN gcash_receipt LONGTEXT,
  ADD COLUMN barangay VARCHAR(100);
```

### Step 2 — Create `src/api.ts` in your React project
```ts
const API_URL = 'http://localhost:5000/api';

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  // Users
  getUsers: () => fetch(`${API_URL}/users`).then(r => r.json()),
  createUser: (user: any) =>
    fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).then(r => r.json()),
  updateUser: (id: string, user: any) =>
    fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).then(r => r.json()),
  deleteUser: (id: string) =>
    fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Orders
  getOrders: (barangay?: string) =>
    fetch(`${API_URL}/orders?barangay=${barangay || ''}`).then(r => r.json()),
  createOrder: (order: any) =>
    fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).then(r => r.json()),
  updateOrder: (id: string, updates: any) =>
    fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then(r => r.json()),
  deleteOrder: (id: string) =>
    fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Reports
  getStats: (barangay?: string) =>
    fetch(`${API_URL}/reports/stats?barangay=${barangay || ''}`).then(r => r.json()),
};
```

### Step 3 — Update `DataContext.tsx`
Replace localStorage with API calls:

```tsx
// Inside DataProvider useEffect
useEffect(() => {
  api.getUsers().then(setUsers);
  api.getOrders().then(setOrders);
}, []);

const addUser = async (user) => {
  const result = await api.createUser(user);
  setUsers([...users, { ...user, id: result.id }]);
};

const addOrder = async (order) => {
  const result = await api.createOrder(order);
  setOrders([{ ...order, id: result.id }, ...orders]);
};
// ... and so on for update/delete
```

### Step 4 — Update React App `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5 — Run both servers
```bash
# Terminal 1 — Backend
cd water-market-backend
npm run dev

# Terminal 2 — Frontend
cd water-market-frontend
npm run dev
```

🎉 Your React app now reads/writes from Aiven MySQL!

---

## 8. Troubleshooting

### ❌ "Access Denied" in Workbench
- Double-check the username (`avnadmin`, not `root`).
- Re-copy the password from Aiven (no extra spaces).
- Verify your IP is allowed: in Aiven → "Allowed IP Addresses" → add `0.0.0.0/0` to allow all (for development only).

### ❌ "SSL connection error"
- Re-download `ca.pem` from Aiven and re-select it in Workbench SSL tab.
- Make sure "Use SSL" is set to `Require`, not `Disable`.

### ❌ "Connection timeout"
- Check your firewall — port 12345 (or your Aiven port) must be open outbound.
- Try a different network (corporate networks often block non-standard ports).

### ❌ Backend: "ER_NOT_SUPPORTED_AUTH_MODE"
- This means you're using `mysql` instead of `mysql2`. Make sure you installed `mysql2`.

### ❌ CORS error in browser
- Make sure `cors` is installed and `app.use(cors())` is called BEFORE your routes.

### ❌ "Too many connections"
- Aiven free tier has a connection limit. Make sure you use a connection pool (as shown in `db.js`).

---

## 📌 Important Notes

- **Aiven Free Trial:** 1 month free. After that, the cheapest MySQL plan is ~$24/month.
- **Alternative:** Use **PlanetScale** (free tier available) or **Railway** (free $5/month credit).
- **Production Security:**
  - ⚠️ NEVER commit `.env` to Git — add it to `.gitignore`.
  - 🔒 Hash passwords with `bcrypt` (the example above stores plain text for simplicity).
  - 🔑 Use JWT tokens for authentication.
  - 🛡️ Restrict Aiven IPs to your production server's IP only.

---

## ✅ Final Checklist

- [ ] Aiven MySQL service is `Running`
- [ ] MySQL Workbench connects successfully (green ✓)
- [ ] `database_schema.sql` ran without errors
- [ ] You can see `users`, `products`, `orders`, `order_items` tables
- [ ] Backend logs `✅ Connected to Aiven MySQL`
- [ ] `http://localhost:5000/api/users` returns JSON
- [ ] React app loads users from the database

🌊 **Your Water Market system is now backed by a real cloud database!**
