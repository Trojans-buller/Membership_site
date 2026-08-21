// backend/models/User.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { full_name, email, username, password, phone, agree_terms } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, username, password, phone, agree_terms) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, email, username, hashedPassword, phone, agree_terms]
        );
        return result;
    }

    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async updatePaymentStatus(userId, status) {
        const [result] = await db.execute(
            'UPDATE users SET is_paid = ?, payment_date = NOW() WHERE id = ?',
            [status, userId]
        );
        return result;
    }

    static async getAllUsers() {
        const [rows] = await db.execute('SELECT id, full_name, email, username, phone, is_paid, created_at, role FROM users');
        return rows;
    }
}

module.exports = User;
