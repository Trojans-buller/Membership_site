document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('loginBtn');
    const messageEl = document.getElementById('loginMessage');
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    btn.disabled = true;
    btn.innerHTML = '⏳ Logging in...';
    messageEl.style.display = 'none';
    messageEl.className = '';
    messageEl.textContent = '';

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok && data.success) {
            // Store user data
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('username', data.user.username);
            
            // Check if user is paid
            if (data.user.is_paid) {
                localStorage.setItem('isPaid', 'true');
                messageEl.style.display = 'block';
                messageEl.className = 'success';
                messageEl.textContent = '✅ Login successful! Redirecting to dashboard...';
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                localStorage.setItem('isPaid', 'false');
                messageEl.style.display = 'block';
                messageEl.className = 'info';
                messageEl.textContent = '⚠️ Please pay 100 KSH to unlock dashboard. Redirecting to payment...';
                
                setTimeout(() => {
                    window.location.href = 'payment.html';
                }, 2000);
            }
        } else {
            messageEl.style.display = 'block';
            messageEl.className = 'error';
            messageEl.textContent = '❌ ' + (data.message || 'Invalid username or password');
            btn.disabled = false;
            btn.innerHTML = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        messageEl.style.display = 'block';
        messageEl.className = 'error';
        messageEl.textContent = '❌ Network error. Make sure server is running on port 5000';
        btn.disabled = false;
        btn.innerHTML = 'Login';
    }
});

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('userToken');
    if (token) {
        // Verify token
        fetch('http://localhost:5000/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.valid) {
                const isPaid = localStorage.getItem('isPaid');
                if (isPaid === 'true') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'payment.html';
                }
            }
        })
        .catch(() => {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userId');
            localStorage.removeItem('isPaid');
        });
    }
});
