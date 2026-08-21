const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Public route to get all members (no auth required)
router.get('/', async (req, res) => {
    try {
        const users = await User.getAllUsers();
        
        // Only return public info
        const publicUsers = users.map(user => ({
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            is_paid: user.is_paid === 1,
            created_at: user.created_at
        }));
        
        res.json({ users: publicUsers });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single member by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return public info only
        res.json({
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            is_paid: user.is_paid === 1,
            created_at: user.created_at
        });
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
