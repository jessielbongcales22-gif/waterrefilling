import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ================================
// AIVEN MYSQL CONNECTION
// ================================
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false } // ensures secure connection to Aiven
});

// ================================
// TEST DATABASE CONNECTION
// ================================
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS current_time");
    res.json({
      success: true,
      message: "Server running and connected to Aiven MySQL",
      database: process.env.MYSQL_DATABASE,
      time: rows[0].current_time
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "DB connection failed", error: err.message });
  }
});

// ================================
// USERS API
// ================================
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, email, password, contact_number AS contact, barangay, role, DATE_FORMAT(created_at,'%Y-%m-%d') AS createdAt
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users", error: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, email, password, contact, barangay, role } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, contact_number, barangay, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, contact, barangay, role]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add user", error: err.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { name, email, password, contact, barangay, role } = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE users SET name=?, email=?, password=?, contact_number=?, barangay=?, role=? WHERE id=?`,
      [name, email, password, contact, barangay, role, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update user", error: err.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete user", error: err.message });
  }
});

// ================================
// PRODUCTS API
// ================================
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, price, stock_quantity AS stock, category, description
      FROM products
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch products", error: err.message });
  }
});

// ================================
// ORDERS API
// ================================
app.get("/api/orders", async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.id, o.user_id AS customerId, COALESCE(u.name,o.customer_name_manual,'Walk-in') AS customerName,
             o.order_type AS type, o.total_amount AS total, o.payment_method AS payment,
             o.payment_status AS paymentStatus, o.order_status AS status,
             o.barangay, o.address, o.gcash_reference AS gcashReference,
             o.gcash_receipt AS gcashReceipt, o.created_at AS createdAt,
             DATE_FORMAT(o.created_at,'%c/%e/%Y') AS date
      FROM orders o
      LEFT JOIN users u ON o.user_id=u.id
      ORDER BY o.created_at DESC
    `);

    // attach items for each order
    const finalOrders = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT oi.product_id AS productId, p.name, oi.price_at_time AS price, oi.quantity
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id=?`,
          [order.id]
        );
        return { ...order, id: String(order.id), total: Number(order.total), items };
      })
    );

    res.json(finalOrders);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  const { customerId, customerName, type, items, total, payment, paymentStatus, status, barangay, address, gcashReference, gcashReceipt } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, customer_name_manual, order_type, total_amount, payment_method, payment_status, order_status, barangay, address, gcash_reference, gcash_receipt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerId || null, customerId ? null : customerName, type, total, payment, paymentStatus, status, barangay, address, gcashReference, gcashReceipt]
    );

    const orderId = orderResult.insertId;

    for (const item of items || []) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );
      // Update stock
      await connection.query(
        `UPDATE products SET stock_quantity=GREATEST(stock_quantity-?,0) WHERE id=?`,
        [item.quantity, item.productId]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, id: String(orderId) });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: "Failed to save order", error: err.message });
  } finally {
    connection.release();
  }
});

// ================================
// LOGIN API
// ================================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM accounts WHERE username=? AND password=?", [username, password]);
    if (rows.length) res.json({ success: true, user: rows[0] });
    else res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
});

// ================================
// SERVE REACT FRONTEND
// ================================
app.use(express.static(path.join(__dirname, "dist")));

// API fallback
app.use("/api", (req, res) => res.status(404).json({ success: false, message: "API route not found" }));

// React fallback
app.use((req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
