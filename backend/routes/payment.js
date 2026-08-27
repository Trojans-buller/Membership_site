const express = require('express');
const router = express.Router();
const User = require('../models/User');
const db = require('../config/db');
const { body, validationResult } = require('express-validator');

// Initiate M-Pesa payment (Simulation)
router.post('/initiate', [
    body('userId').isInt().withMessage('User ID required'),
    body('phoneNumber').notEmpty().withMessage('Phone number required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { userId, phoneNumber } = req.body;
        
        // Check user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.is_paid === 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already paid' 
            });
        }

        // Generate unique transaction ID
        const transactionId = 'MPESA' + Date.now() + Math.floor(Math.random() * 1000);

        // Log payment attempt
        console.log(`📱 Sending STK Push to ${phoneNumber} for 100 KSH`);
        console.log(`📝 Transaction ID: ${transactionId}`);
        console.log(`👤 User: ${user.full_name} (${user.username})`);

        // Simulate payment processing (90% success rate for demo)
        const paymentSuccess = Math.random() < 0.9;

        if (paymentSuccess) {
            // Update user payment status
            await User.updatePaymentStatus(userId, true);
            
            // Record payment in database
            await db.execute(
                'INSERT INTO payments (user_id, phone_number, amount, status, transaction_id, payment_date) VALUES (?, ?, ?, ?, ?, NOW())',
                [userId, phoneNumber, 100.00, 'completed', transactionId]
            );

            console.log(`✅ Payment successful for ${user.username}`);

            res.json({
                success: true,
                message: '✅ Payment successful! Dashboard unlocked.',
                transactionId: transactionId,
                is_paid: true
            });
        } else {
            // Record failed payment
            await db.execute(
                'INSERT INTO payments (user_id, phone_number, amount, status, transaction_id) VALUES (?, ?, ?, ?, ?)',
                [userId, phoneNumber, 100.00, 'failed', transactionId]
            );

            console.log(`❌ Payment failed for ${user.username}`);

            res.status(400).json({
                success: false,
                message: '❌ Payment failed. Please try again.',
                transactionId: transactionId
            });
        }
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error processing payment' 
        });
    }
});

// Check payment status
router.get('/status/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            is_paid: user.is_paid === 1
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
