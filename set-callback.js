const axios = require('axios');

const PAYHERO_BASE_URL = 'https://api.payhero.co.ke';
const USERNAME = 'rD3NuLUTcUtsBtHF3nOn';
const PASSWORD = 'WSJoM5NiyYtLFI281qtbJraWsaKoQFYAMwiepKR6';
const ACCOUNT_ID = '11868';

const auth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

async function setCallback() {
    try {
        const response = await axios.post(
            `${PAYHERO_BASE_URL}/api/v1/webhook/register`,
            {
                url: 'https://membership-site-joyv.onrender.com/api/payment/callback',
                events: ['payment.completed', 'payment.failed'],
                account: ACCOUNT_ID
            },
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ Callback set successfully:', response.data);
    } catch (error) {
        console.error('❌ Error setting callback:', error.response?.data || error.message);
    }
}

setCallback();
