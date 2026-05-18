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

// MySQL Aiven Connection
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
});

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS current_time");
    res.json({ success: true, message: "Server running and DB connected", time: rows[0].current_time });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login API
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM accounts WHERE username=? AND password=?", [username, password]);
    if (rows.length) res.json({ success: true, user: rows[0] });
    else res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Orders API
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
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

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
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Order Status
app.put("/api/orders/:id", async (req, res) => {
  const { status, paymentStatus } = req.body;
  const { id } = req.params;
  try {
    await pool.query("UPDATE orders SET order_status=?, payment_status=? WHERE id=?", [status, paymentStatus, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// API fallback
app.use("/api", (req, res) => res.status(404).json({ success: false, message: "API route not found" }));

// React SPA fallback
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
