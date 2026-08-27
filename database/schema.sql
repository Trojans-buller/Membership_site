-- database/schema.sql
CREATE DATABASE membership_db;
USE membership_db;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_paid BOOLEAN DEFAULT FALSE,
    payment_date DATETIME,
    agree_terms BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    phone_number VARCHAR(20),
    amount DECIMAL(10,2) DEFAULT 100.00,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert admin user (password: admin123)
INSERT INTO users (full_name, email, username, password, role, agree_terms) 
VALUES ('Admin', 'admin@site.com', 'admin', '$2b$10$YourHashedPasswordHere', 'admin', TRUE);
