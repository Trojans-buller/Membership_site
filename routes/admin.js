const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretJWTKey123456789';

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
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username === 'admin' && password === 'admin123') {
            const token = jwt.sign(
                { id: 'admin', role: 'admin' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.json({
                success: true,
                token,
                admin: {
                    full_name: 'Administrator',
                    username: 'admin',
                    email: 'admin@site.com'
                }
            });
        }

        // Check if admin exists in DB
        const admin = await User.findOne({ username, role: 'admin' });
        if (admin) {
            const isValid = await admin.comparePassword(password);
            if (isValid) {
                const token = jwt.sign(
                    { id: admin._id, role: 'admin' },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                return res.json({
                    success: true,
                    token,
                    admin: {
                        full_name: admin.full_name,
                        username: admin.username,
                        email: admin.email
                    }
                });
            }
        }

        res.status(401).json({ message: 'Invalid admin credentials' });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ created_at: -1 });

        const total = await User.countDocuments();
        const paid = await User.countDocuments({ is_paid: true });

        res.json({
            users,
            stats: {
                total,
                paid,
                unpaid: total - paid,
                revenue: paid * 100
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export CSV
router.get('/export', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('full_name email username phone is_paid created_at');

        let csv = 'ID,Name,Email,Username,Phone,Paid,Joined\n';
        users.forEach((user, index) => {
            csv += `${index + 1},"${user.full_name}","${user.email}","${user.username}","${user.phone || ''}",${user.is_paid ? 'Yes' : 'No'},"${new Date(user.created_at).toLocaleDateString()}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
