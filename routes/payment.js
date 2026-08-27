const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const { body, validationResult } = require('express-validator');

// Initiate payment (simulated)
router.post('/initiate', [
    body('userId').notEmpty(),
    body('phoneNumber').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { userId, phoneNumber } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.is_paid) {
            return res.status(400).json({ success: false, message: 'User already paid' });
        }

        // Simulate payment (90% success)
        const paymentSuccess = Math.random() < 0.9;

        const transactionId = paymentSuccess 
            ? 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
            : 'FAIL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const payment = new Payment({
            user_id: user._id,
            phone_number: phoneNumber,
            amount: 100.00,
            status: paymentSuccess ? 'completed' : 'failed',
            transaction_id: transactionId,
            payment_date: paymentSuccess ? new Date() : null
        });

        await payment.save();

        if (paymentSuccess) {
            user.is_paid = true;
            user.payment_date = new Date();
            await user.save();

            res.json({
                success: true,
                message: '✅ Payment successful! Dashboard unlocked.',
                transactionId: transactionId,
                is_paid: true
            });
        } else {
            res.status(400).json({
                success: false,
                message: '❌ Payment failed. Please try again.'
            });
        }

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Check payment status
router.get('/status/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ is_paid: user.is_paid });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
