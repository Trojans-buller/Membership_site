const userId = localStorage.getItem('userId');
if (!userId) {
    document.getElementById('paymentStatus').className = 'error';
    document.getElementById('paymentStatus').textContent = '⚠️ Please register first';
    document.getElementById('paymentStatus').style.display = 'block';
    setTimeout(() => window.location.href = 'register.html', 2000);
}

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('payBtn');
    const msg = document.getElementById('paymentStatus');
    
    btn.disabled = true;
    btn.textContent = '⏳ Processing...';
    msg.style.display = 'none';

    try {
        const res = await fetch('/api/payment/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                phoneNumber: document.getElementById('phoneNumber').value
            })
        });
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('isPaid', 'true');
            msg.className = 'success';
            msg.textContent = '✅ ' + data.message;
            msg.style.display = 'block';
            document.getElementById('checkDashboard').style.display = 'block';
            btn.textContent = '✅ Complete';
        } else {
            msg.className = 'error';
            msg.textContent = '❌ ' + (data.message || 'Payment failed');
            msg.style.display = 'block';
            btn.disabled = false;
            btn.textContent = '💳 Pay 100 KSH';
        }
    } catch (err) {
        msg.className = 'error';
        msg.textContent = '❌ Network error';
        msg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = '💳 Pay 100 KSH';
    }
});
