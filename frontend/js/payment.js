document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const isPaid = localStorage.getItem('isPaid');

    if (!userId) {
        document.getElementById('paymentStatus').style.display = 'block';
        document.getElementById('paymentStatus').className = 'error';
        document.getElementById('paymentStatus').textContent = '⚠️ Please register first!';
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 3000);
        return;
    }

    if (isPaid === 'true') {
        document.getElementById('paymentStatus').style.display = 'block';
        document.getElementById('paymentStatus').className = 'success';
        document.getElementById('paymentStatus').textContent = '✅ You are already paid!';
        document.getElementById('checkDashboard').style.display = 'block';
        document.getElementById('paymentForm').style.display = 'none';
    }
});

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('payBtn');
    const statusEl = document.getElementById('paymentStatus');
    const phoneNumber = document.getElementById('phoneNumber').value;
    const userId = localStorage.getItem('userId');

    if (!userId) {
        statusEl.style.display = 'block';
        statusEl.className = 'error';
        statusEl.textContent = '❌ Please register first!';
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 2000);
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '⏳ Sending STK Push...';
    statusEl.style.display = 'block';
    statusEl.className = 'info';
    statusEl.textContent = '⏳ Sending payment request to your phone...';

    try {
        const response = await fetch('/api/payment/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                phoneNumber: phoneNumber
            })
        });

        const data = await response.json();
        console.log('Payment initiation response:', data);

        if (!data.success) {
            statusEl.className = 'error';
            statusEl.textContent = '❌ ' + (data.message || 'Payment initiation failed');
            btn.disabled = false;
            btn.innerHTML = '💳 Pay 100 KSH';
            return;
        }

        statusEl.className = 'info';
        statusEl.textContent = '✅ ' + data.message + ' Waiting for confirmation...';
        btn.innerHTML = '⏳ Waiting for confirmation...';

        // Poll for payment status
        const transactionId = data.transactionId;
        let attempts = 0;
        const maxAttempts = 30; // 30 * 3s = 90 seconds

        const checkInterval = setInterval(async () => {
            attempts++;

            try {
                const statusRes = await fetch('/api/payment/check-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transactionId: transactionId,
                        userId: parseInt(userId)
                    })
                });

                const statusData = await statusRes.json();
                console.log('Status check:', attempts, statusData);

                if (statusData.success && statusData.status === 'completed') {
                    clearInterval(checkInterval);
                    localStorage.setItem('isPaid', 'true');
                    statusEl.className = 'success';
                    statusEl.textContent = '✅ Payment confirmed! Dashboard unlocked.';
                    document.getElementById('checkDashboard').style.display = 'block';
                    btn.disabled = false;
                    btn.innerHTML = '✅ Payment Complete';
                    return;
                }

                if (statusData.status === 'failed') {
                    clearInterval(checkInterval);
                    statusEl.className = 'error';
                    statusEl.textContent = '❌ ' + (statusData.message || 'Payment failed. Please try again.');
                    btn.disabled = false;
                    btn.innerHTML = '💳 Retry Payment';
                    return;
                }

                // Still pending
                if (attempts % 5 === 0) {
                    statusEl.textContent = `⏳ Waiting for confirmation... (${Math.floor(attempts * 3 / 60)} min ${attempts * 3 % 60} sec)`;
                }

                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    statusEl.className = 'error';
                    statusEl.textContent = '⏰ Payment not confirmed yet. Please check your M-Pesa and try again later.';
                    btn.disabled = false;
                    btn.innerHTML = '💳 Retry Payment';
                }

            } catch (err) {
                console.error('Status check error:', err);
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    statusEl.className = 'error';
                    statusEl.textContent = '⏰ Could not confirm payment. Please check your M-Pesa.';
                    btn.disabled = false;
                    btn.innerHTML = '💳 Retry Payment';
                }
            }
        }, 3000);

    } catch (error) {
        console.error('Payment error:', error);
        statusEl.className = 'error';
        statusEl.textContent = '❌ Network error. Make sure server is running.';
        btn.disabled = false;
        btn.innerHTML = '💳 Pay 100 KSH';
    }
});
