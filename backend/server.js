const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes - WITH DEBUG LOGGING
console.log('✅ Loading routes...');

try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ /api/auth loaded');
} catch(e) { console.error('❌ auth error:', e.message); }

try {
    app.use('/api/payment', require('./routes/payment'));
    console.log('✅ /api/payment loaded');
} catch(e) { console.error('❌ payment error:', e.message); }

try {
    app.use('/api/admin', require('./routes/admin'));
    console.log('✅ /api/admin loaded');
} catch(e) { console.error('❌ admin error:', e.message); }

try {
    app.use('/api/members', require('./routes/members'));
    console.log('✅ /api/members loaded');
} catch(e) { console.error('❌ members error:', e.message); }

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found: ' + req.url });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📝 Register: /register.html`);
    console.log(`🔐 Login: /login.html`);
    console.log(`💳 Payment: /payment.html`);
    console.log(`🎯 Dashboard: /dashboard.html`);
    console.log(`👑 Admin: /admin.html`);
    console.log(`🧪 Test API: /api/test`);
});
