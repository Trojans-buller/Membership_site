const axios = require('axios');

const PAYHERO_BASE_URL = 'https://api.payhero.co.ke';
const PAYHERO_USERNAME = process.env.PAYHERO_USERNAME;
const PAYHERO_PASSWORD = process.env.PAYHERO_PASSWORD;
const PAYHERO_ACCOUNT_ID = process.env.PAYHERO_ACCOUNT_ID;

function getBasicAuth() {
    return Buffer.from(`${PAYHERO_USERNAME}:${PAYHERO_PASSWORD}`).toString('base64');
}

async function initiateSTKPush(phoneNumber, amount, accountRef) {
    try {
        const response = await axios.post(
            `${PAYHERO_BASE_URL}/api/v1/mpesa/stkpush`,
            {
                phone: phoneNumber,
                amount: amount,
                reference: accountRef,
                description: 'Membership Payment',
                account: PAYHERO_ACCOUNT_ID
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

async function checkPaymentStatus(transactionId) {
    try {
        const response = await axios.get(
            `${PAYHERO_BASE_URL}/api/v1/mpesa/status/${transactionId}`,
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
