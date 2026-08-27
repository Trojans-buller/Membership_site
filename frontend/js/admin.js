document.getElementById('adminLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('adminLoginMessage');
    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('adminUsername').value,
                password: document.getElementById('adminPassword').value
            })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            document.getElementById('adminLoginForm').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            loadAdminData();
        } else {
            msg.textContent = '❌ Invalid credentials';
            msg.style.color = 'red';
        }
    } catch (err) {
        msg.textContent = '❌ Network error';
        msg.style.color = 'red';
    }
});

async function loadAdminData() {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
        const res = await fetch('/api/admin/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.stats) {
            document.getElementById('totalUsers').textContent = data.stats.total;
            document.getElementById('paidUsers').textContent = data.stats.paid;
            document.getElementById('unpaidUsers').textContent = data.stats.unpaid;
            document.getElementById('totalRevenue').textContent = 'KSH ' + data.stats.revenue;
        }
        const tbody = document.getElementById('membersBody');
        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>${u._id.slice(-4)}</td>
                <td>${u.full_name}</td>
                <td>${u.email}</td>
                <td>${u.username}</td>
                <td>${u.phone || '-'}</td>
                <td>${u.is_paid ? '✅ Paid' : '❌ Unpaid'}</td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    location.reload();
}

async function exportCSV() {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    window.open('/api/admin/export?token=' + token);
}

// Auto-load if already logged in
if (localStorage.getItem('adminToken')) {
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAdminData();
}
