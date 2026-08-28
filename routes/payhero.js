const axios = require('axios');

const PAYHERO_BASE_URL = 'https://backend.payhero.co.ke/api/v2';
const PAYHERO_USERNAME = process.env.PAYHERO_USERNAME;
const PAYHERO_PASSWORD = process.env.PAYHERO_PASSWORD;
const PAYHERO_CHANNEL_ID = process.env.PAYHERO_CHANNEL_ID || '12023';

function getBasicAuth() {
    return Buffer.from(`${PAYHERO_USERNAME}:${PAYHERO_PASSWORD}`).toString('base64');
}

async function initiateSTKPush(phoneNumber, amount, accountRef) {
    try {
        const response = await axios.post(
            `${PAYHERO_BASE_URL}/payments`,
            {
                amount: amount,
                phone_number: phoneNumber,
                channel_id: parseInt(PAYHERO_CHANNEL_ID),
                provider: 'm-pesa',
                external_reference: accountRef,
                customer_name: 'Membership User',
                callback_url: 'https://membership-site-joyv.onrender.com/api/payment/callback'
            },
            {
                headers: {
                    'Authorization': `Basic ${getBasicAuth()}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('PayHero Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Payment initiation failed');
    }
}

async function checkPaymentStatus(reference) {
    try {
        const response = await axios.get(
            `${PAYHERO_BASE_URL}/payments/${reference}`,
            {
                headers: {
                    'Authorization': `Basic ${getBasicAuth()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Status Check Error:', error.response?.data || error.message);
        return { status: 'pending' };
    }
}

module.exports = { initiateSTKPush, checkPaymentStatus };
