// Enable register button when terms are checked
document.getElementById('agreeTerms').addEventListener('change', function() {
    document.getElementById('registerBtn').disabled = !this.checked;
});

// Handle registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('registerBtn');
    const messageEl = document.getElementById('message');
    
    btn.disabled = true;
    btn.innerHTML = '⏳ Creating Account...';
    messageEl.style.display = 'none';
    messageEl.className = '';
    messageEl.textContent = '';

    const formData = {
        full_name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value || '',
        agree_terms: document.getElementById('agreeTerms').checked
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Registration response:', data);
        
        if (response.ok && data.success) {
            // Store user data
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('isPaid', 'false');
            
            messageEl.style.display = 'block';
            messageEl.className = 'success';
            messageEl.textContent = '✅ Registration successful! Redirecting to payment...';
            
            btn.innerHTML = '✅ Success!';
            
            setTimeout(() => {
                window.location.href = 'payment.html';
            }, 1500);
        } else {
            let errorMsg = data.message || 'Registration failed';
            if (data.errors) {
                errorMsg = data.errors.map(e => e.msg).join(', ');
            }
            messageEl.style.display = 'block';
            messageEl.className = 'error';
            messageEl.textContent = '❌ ' + errorMsg;
            btn.disabled = false;
            btn.innerHTML = 'Create Account';
        }
    } catch (error) {
        console.error('Registration error:', error);
        messageEl.style.display = 'block';
        messageEl.className = 'error';
        messageEl.textContent = '❌ Network error. Make sure server is running';
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
    }
});
