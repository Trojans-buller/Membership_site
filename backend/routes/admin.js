const express = require('express');
const router = express.Router();
const User = require('../models/User');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// Admin middleware
const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
        }
        
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND role = "admin"',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
        
        const admin = users[0];
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(password, admin.password);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
        
        const token = jwt.sign(
            { id: admin.id, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                full_name: admin.full_name,
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users with stats
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.getAllUsers();
        
        const [total] = await db.execute('SELECT COUNT(*) as total FROM users');
        const [paid] = await db.execute('SELECT COUNT(*) as paid FROM users WHERE is_paid = 1');
        const [revenue] = await db.execute('SELECT SUM(amount) as total_revenue FROM payments WHERE status = "completed"');
        
        res.json({
            users,
            stats: {
                total: total[0].total || 0,
                paid: paid[0].paid || 0,
                unpaid: (total[0].total || 0) - (paid[0].paid || 0),
                revenue: revenue[0].total_revenue || 0
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export users as CSV
router.get('/export', isAdmin, async (req, res) => {
    try {
        const users = await User.getAllUsers();
        let csv = 'ID,Name,Email,Username,Phone,Paid,Joined\n';
        
        users.forEach(user => {
            csv += `${user.id},"${user.full_name}","${user.email}","${user.username}","${user.phone || ''}",${user.is_paid ? 'Yes' : 'No'},"${new Date(user.created_at).toLocaleDateString()}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
