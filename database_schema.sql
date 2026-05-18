-- ====================================================================
-- 🌊 Water Market Water Refilling Station - Database Schema
-- For Aiven MySQL / MySQL Workbench
-- ====================================================================
-- Instructions: Run this script in MySQL Workbench connected to your
-- Aiven instance. See AIVEN_SETUP_GUIDE.md for full setup.
-- ====================================================================

CREATE DATABASE IF NOT EXISTS water_market_db;
USE water_market_db;

-- --------------------------------------------------------------------
-- Table: users (Admin, Staff, Customer)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    barangay VARCHAR(100) DEFAULT 'Panalaron',
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_barangay (barangay)
);

-- --------------------------------------------------------------------
-- Table: products (Inventory)
-- --------------------------------------------------------------------
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Water',
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'container',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- Table: orders (Walk-in and Delivery)
-- --------------------------------------------------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    customer_name_manual VARCHAR(255), -- For walk-in customers without account
    order_type ENUM('Delivery', 'Walk-in') NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CASH', 'GCASH') NOT NULL,
    payment_status ENUM('pending', 'verifying', 'paid') DEFAULT 'pending',
    order_status ENUM(
        'pending', 
        'verifying', 
        'approved', 
        'out for delivery', 
        'completed', 
        'cancelled', 
        'rejected'
    ) DEFAULT 'pending',
    address TEXT,                       -- For delivery orders
    barangay VARCHAR(100) NOT NULL,     -- For barangay-scoped visibility
    gcash_reference VARCHAR(100),       -- GCash transaction reference
    gcash_receipt LONGTEXT,             -- Base64 encoded image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (order_status),
    INDEX idx_barangay (barangay),
    INDEX idx_payment (payment_status),
    INDEX idx_date (created_at)
);

-- --------------------------------------------------------------------
-- Table: order_items (Line items for each order)
-- --------------------------------------------------------------------
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ====================================================================
-- 🎯 SEED DATA
-- ====================================================================

-- Default Product
INSERT INTO products (name, category, description, price, stock_quantity, unit) VALUES 
('Purified Water', 'Water', 'High-quality purified water refill', 30.00, 500, 'container');

-- Default Accounts (CHANGE PASSWORDS IN PRODUCTION!)
INSERT INTO users (name, email, password, contact_number, barangay, role) VALUES 
('admin', 'admin@watermarket.com', 'admin123', '09171234567', 'All', 'admin'),
('staff1', 'staff1@watermarket.com', 'staff123', '09181234567', 'Panalaron', 'staff'),
('juan_delacruz', 'juan@email.com', 'juan123', '09191234567', 'Maliwanag', 'customer'),
('maria_santos', 'maria@email.com', 'maria123', '09201234567', 'Panalaron', 'customer'),
('pedro_reyes', 'pedro@email.com', 'pedro123', '09211234567', 'Pob. Lungsodaan', 'customer');

-- Sample Orders (for testing)
INSERT INTO orders (user_id, customer_name_manual, order_type, total_amount, payment_method, payment_status, order_status, barangay, address) VALUES 
(3, NULL, 'Delivery', 90.00, 'CASH', 'paid', 'completed', 'Maliwanag', 'Purok 1, Brgy. Maliwanag'),
(4, NULL, 'Delivery', 150.00, 'GCASH', 'paid', 'completed', 'Panalaron', 'Purok 2, Brgy. Panalaron'),
(NULL, 'Walk-in Customer', 'Walk-in', 120.00, 'CASH', 'paid', 'completed', 'Pob. Lungsodaan', NULL);

INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES 
(1, 1, 3, 30.00),
(2, 1, 5, 30.00),
(3, 1, 4, 30.00);

-- ====================================================================
-- ✅ VERIFY SETUP
-- ====================================================================
SELECT '✅ Setup complete!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_orders FROM orders;

-- ====================================================================
-- 📊 USEFUL QUERIES (for testing in Workbench)
-- ====================================================================

-- View all orders with customer name
-- SELECT o.id, COALESCE(u.name, o.customer_name_manual) AS customer, 
--        o.order_type, o.total_amount, o.payment_method, o.order_status, o.barangay
-- FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC;

-- Today's revenue
-- SELECT COALESCE(SUM(total_amount), 0) AS today_revenue 
-- FROM orders WHERE DATE(created_at) = CURDATE() AND payment_status = 'paid';

-- Pending GCash verifications
-- SELECT id, customer_name_manual, total_amount, gcash_reference 
-- FROM orders WHERE order_status = 'verifying';

-- Orders by barangay
-- SELECT barangay, COUNT(*) AS order_count, SUM(total_amount) AS revenue
-- FROM orders WHERE payment_status = 'paid' GROUP BY barangay;
