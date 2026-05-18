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
  ssl: {
    rejectUnauthorized: false
  }
});

// ================================
// TEST SERVER + DATABASE CONNECTION
// ================================
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS current_time");

    res.json({
      success: true,
      message: "Server is running and connected to Aiven MySQL",
      database: process.env.MYSQL_DATABASE,
      time: rows[0].current_time
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server is running but database connection failed",
      error: err.message
    });
  }
});

// ================================
// ROOMS API
// ================================
app.get("/api/rooms", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM rooms");
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rooms",
      error: err.message
    });
  }
});

app.post("/api/rooms", async (req, res) => {
  const { name, type, status, capacity, currentCapacity } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO rooms (name, type, status, capacity, currentCapacity) VALUES (?, ?, ?, ?, ?)",
      [
        name,
        type,
        status || "Available",
        capacity || 0,
        currentCapacity || 0
      ]
    );

    res.status(201).json({
      success: true,
      message: "Room added successfully",
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to add room",
      error: err.message
    });
  }
});

app.put("/api/rooms/:id", async (req, res) => {
  const { status, currentCapacity } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE rooms SET status = ?, currentCapacity = ? WHERE id = ?",
      [status, currentCapacity, id]
    );

    res.json({
      success: true,
      message: "Room updated successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: err.message
    });
  }
});

app.delete("/api/rooms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM rooms WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: err.message
    });
  }
});

// ================================
// REPORTS / MAINTENANCE API
// ================================
app.get("/api/reports", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reports ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: err.message
    });
  }
});

app.post("/api/reports", async (req, res) => {
  const { id, tenantId, title, details, category, status, date } = req.body;

  if (!title || !details || !category) {
    return res.status(400).json({
      success: false,
      message: "Title, details, and category are required"
    });
  }

  try {
    await pool.query(
      "INSERT INTO reports (id, tenantId, title, details, category, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id || null,
        tenantId || null,
        title,
        details,
        category,
        status || "Pending",
        date || new Date()
      ]
    );

    res.status(201).json({
      success: true,
      message: "Report saved successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to save report",
      error: err.message
    });
  }
});

app.put("/api/reports/:id", async (req, res) => {
  const { title, details, category, status, date } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE reports SET title = ?, details = ?, category = ?, status = ?, date = ? WHERE id = ?",
      [title, details, category, status, date, id]
    );

    res.json({
      success: true,
      message: "Report updated successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: err.message
    });
  }
});

app.delete("/api/reports/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM reports WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: err.message
    });
  }
});

// ================================
// ACCOUNTS / LOGIN API
// ================================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM accounts WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length > 0) {
      res.json({
        success: true,
        message: "Login successful",
        user: rows[0]
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message
    });
  }
});

// ================================
// SCHEDULES / CALENDAR API
// ================================
app.get("/api/schedules", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM schedules ORDER BY date ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedules",
      error: err.message
    });
  }
});

app.post("/api/schedules", async (req, res) => {
  const { title, description, date, time, status } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO schedules (title, description, date, time, status) VALUES (?, ?, ?, ?, ?)",
      [
        title,
        description || "",
        date,
        time || null,
        status || "Pending"
      ]
    );

    res.status(201).json({
      success: true,
      message: "Schedule saved successfully",
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to save schedule",
      error: err.message
    });
  }
});

app.put("/api/schedules/:id", async (req, res) => {
  const { title, description, date, time, status } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE schedules SET title = ?, description = ?, date = ?, time = ?, status = ? WHERE id = ?",
      [title, description, date, time, status, id]
    );

    res.json({
      success: true,
      message: "Schedule updated successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error: err.message
    });
  }
});

app.delete("/api/schedules/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM schedules WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Schedule deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
      error: err.message
    });
  }
});

// ================================
// SERVE REACT BUILD
// ================================
app.use(express.static(path.join(__dirname, "dist")));

// API fallback
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// React fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
