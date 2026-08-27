const axios = require('axios');
require('dotenv').config();

const PAYHERO_BASE_URL = process.env.PAYHERO_BASE_URL || 'https://api.payhero.co.ke';
const PAYHERO_API_KEY = process.env.PAYHERO_API_KEY;
const PAYHERO_SECRET = process.env.PAYHERO_SECRET;

async function initiateSTKPush(phoneNumber, amount, accountRef) {
    try {
        const response = await axios.post(
            `${PAYHERO_BASE_URL}/api/v1/mpesa/stkpush`,
            {
                phone: phoneNumber,
                amount: amount,
                reference: accountRef,
                description: 'Membership Payment'
            },
            {
                headers: {
                    'Authorization': `Bearer ${PAYHERO_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('PayHero STK Push Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Payment initiation failed');
    }
}

// Check payment status using transaction ID
async function checkPaymentStatus(transactionId) {
    try {
        const response = await axios.get(
            `${PAYHERO_BASE_URL}/api/v1/mpesa/status/${transactionId}`,
            {
                headers: {
                    'Authorization': `Bearer ${PAYHERO_API_KEY}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('PayHero Status Check Error:', error.response?.data || error.message);
        return { status: 'pending' };
    }
}

module.exports = { initiateSTKPush, checkPaymentStatus };
