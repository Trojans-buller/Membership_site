const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment');
const { initiateSTKPush, checkPaymentStatus } = require('../services/payhero');
const { body, validationResult } = require('express-validator');

// Initiate real M-Pesa payment
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

        // Format phone number - remove leading 0 if present
        let formattedPhone = phoneNumber.replace(/\s/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = formattedPhone.substring(1);
        }
        // Add 254 if not present
        if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }

        const accountRef = `MEM-${userId}-${Date.now()}`;

        console.log('💳 Initiating PayHero STK Push:', { phone: formattedPhone, amount: 100, ref: accountRef });

        // Initiate STK Push via PayHero
        const paymentResult = await initiateSTKPush(formattedPhone, 100, accountRef);

        console.log('📋 PayHero Response:', paymentResult);

        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                message: paymentResult.message || 'Payment initiation failed'
            });
        }

        // Save payment record
        const payment = new Payment({
            user_id: user._id,
            phone_number: phoneNumber,
            amount: 100.00,
            status: 'pending',
            transaction_id: paymentResult.reference || paymentResult.CheckoutRequestID
        });
        await payment.save();

        res.json({
            success: true,
            message: 'STK Push sent. Please check your phone to complete payment.',
            transactionId: paymentResult.reference || paymentResult.CheckoutRequestID
        });

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
});

// Check payment status (polling)
router.post('/check-status', async (req, res) => {
    try {
        const { transactionId, userId } = req.body;

        if (!transactionId) {
            return res.status(400).json({ success: false, message: 'Transaction ID required' });
        }

        const payment = await Payment.findOne({ transaction_id: transactionId });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        if (payment.status === 'completed') {
            return res.json({ success: true, status: 'completed' });
        }
        if (payment.status === 'failed') {
            return res.json({ success: false, status: 'failed' });
        }

        // Check with PayHero API
        const statusResult = await checkPaymentStatus(transactionId);

        if (statusResult.status === 'completed' || statusResult.status === 'COMPLETED') {
            payment.status = 'completed';
            payment.payment_date = new Date();
            await payment.save();

            await User.findByIdAndUpdate(payment.user_id, { 
                is_paid: true, 
                payment_date: new Date() 
            });

            return res.json({ success: true, status: 'completed' });
        } else if (statusResult.status === 'failed' || statusResult.status === 'FAILED') {
            payment.status = 'failed';
            await payment.save();
            return res.json({ success: false, status: 'failed', message: 'Payment failed' });
        } else {
            return res.json({ success: false, status: 'pending' });
        }

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Simple status check
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
