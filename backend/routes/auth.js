const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// Registration
router.post('/register', [
    body('full_name').notEmpty().withMessage('Full name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('agree_terms').isBoolean().withMessage('Must agree to terms')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: errors.array() 
            });
        }

        const { full_name, email, username, password, phone, agree_terms } = req.body;

        // Check if user exists
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ 
                success: false,
                message: 'Email already registered' 
            });
        }

        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ 
                success: false,
                message: 'Username already taken' 
            });
        }

        // Create user
        const result = await User.create({ 
            full_name, 
            email, 
            username, 
            password, 
            phone: phone || null, 
            agree_terms: agree_terms === true || agree_terms === 'true'
        });
        
        // Generate token for auto-login
        const token = jwt.sign(
            { id: result.insertId, role: 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('✅ User registered:', { id: result.insertId, username, email });
        
        res.status(201).json({ 
            success: true,
            message: 'Registration successful! Please pay 100 KSH to unlock dashboard',
            userId: result.insertId,
            token: token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration' 
        });
    }
});

// Login
router.post('/login', [
    body('username').notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { username, password } = req.body;
        
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, is_paid: user.is_paid },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                username: user.username,
                role: user.role,
                is_paid: user.is_paid === 1
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login' 
        });
    }
});

// Verify token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ valid: false });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ valid: false });
        }
        
        res.json({
            valid: true,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                username: user.username,
                role: user.role,
                is_paid: user.is_paid === 1
            }
        });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

module.exports = router;
