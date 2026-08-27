const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all members (public)
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('full_name username email phone is_paid created_at role')
            .sort({ created_at: -1 });

        res.json({ users });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single member
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('full_name username email phone is_paid created_at');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
