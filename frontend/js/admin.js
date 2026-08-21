// Admin login
document.getElementById('adminLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const messageEl = document.getElementById('adminLoginMessage');

    try {
        const response = await fetch('http://localhost:5000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('adminToken', data.token);
            document.getElementById('adminLoginForm').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            loadDashboard();
        } else {
            messageEl.innerHTML = '<p style="color:red;text-align:center;">❌ Invalid credentials</p>';
        }
    } catch (error) {
        messageEl.innerHTML = '<p style="color:red;text-align:center;">❌ Network error</p>';
    }
});

// Load dashboard data
async function loadDashboard() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        document.getElementById('adminLoginForm').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
        return;
    }
    
    try {
        // Load users
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const usersData = await usersResponse.json();
        
        if (usersResponse.ok) {
            // Update stats
            if (usersData.stats) {
                document.getElementById('totalUsers').textContent = usersData.stats.total || 0;
                document.getElementById('paidUsers').textContent = usersData.stats.paid || 0;
                document.getElementById('unpaidUsers').textContent = usersData.stats.unpaid || 0;
                document.getElementById('totalRevenue').textContent = 'KSH ' + ((usersData.stats.paid || 0) * 100);
            }
            
            // Update table
            const tbody = document.getElementById('membersBody');
            if (usersData.users && usersData.users.length > 0) {
                tbody.innerHTML = usersData.users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.username}</td>
                        <td>${user.phone || '-'}</td>
                        <td>${user.is_paid ? '✅ Paid' : '❌ Unpaid'}</td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7">No members registered yet</td></tr>';
            }
        } else {
            // Token expired
            localStorage.removeItem('adminToken');
            document.getElementById('adminLoginForm').style.display = 'block';
            document.getElementById('adminPanel').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('membersBody').innerHTML = '<tr><td colspan="7">Error loading data</td></tr>';
    }
}

// Export CSV
async function exportCSV() {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/export', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'members.csv';
            a.click();
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        alert('Error exporting CSV');
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminToken');
    location.reload();
}

// Load dashboard on page load
if (localStorage.getItem('adminToken')) {
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadDashboard();
}
