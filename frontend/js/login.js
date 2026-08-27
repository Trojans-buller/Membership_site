document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('button[type="submit"]');
    const msg = document.getElementById('loginMessage');
    
    btn.disabled = true;
    btn.textContent = '⏳ Logging in...';
    msg.style.display = 'none';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('loginUsername').value,
                password: document.getElementById('loginPassword').value
            })
        });
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('isPaid', data.user.is_paid);
            
            if (data.user.is_paid) {
                window.location.href = 'dashboard.html';
            } else {
                msg.className = 'info';
                msg.textContent = '⚠️ Please pay 100 KSH to unlock dashboard';
                msg.style.display = 'block';
                setTimeout(() => window.location.href = 'payment.html', 1500);
            }
        } else {
            msg.className = 'error';
            msg.textContent = '❌ ' + (data.message || 'Invalid credentials');
            msg.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    } catch (err) {
        msg.className = 'error';
        msg.textContent = '❌ Network error';
        msg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Login';
    }
});

// Check if already logged in
const token = localStorage.getItem('userToken');
if (token) {
    fetch('/api/auth/verify', {
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => res.json()).then(data => {
        if (data.valid) {
            if (data.user.is_paid) window.location.href = 'dashboard.html';
            else window.location.href = 'payment.html';
        }
    });
}
