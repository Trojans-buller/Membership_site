document.getElementById('agreeTerms').addEventListener('change', function() {
    document.getElementById('registerBtn').disabled = !this.checked;
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('registerBtn');
    const msg = document.getElementById('message');
    
    btn.disabled = true;
    btn.textContent = '⏳ Creating...';
    msg.style.display = 'none';

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                phone: document.getElementById('phone').value,
                agree_terms: document.getElementById('agreeTerms').checked
            })
        });
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userToken', data.token);
            msg.className = 'success';
            msg.textContent = '✅ Registration successful! Redirecting...';
            msg.style.display = 'block';
            setTimeout(() => window.location.href = 'payment.html', 1500);
        } else {
            msg.className = 'error';
            msg.textContent = '❌ ' + (data.message || 'Registration failed');
            msg.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    } catch (err) {
        msg.className = 'error';
        msg.textContent = '❌ Network error';
        msg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
});
