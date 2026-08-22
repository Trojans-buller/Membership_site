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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/members', require('./routes/members'));

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
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
});
