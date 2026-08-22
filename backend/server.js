const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Catch-all: serve register.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📁 Serving: ${path.join(__dirname, '..', 'frontend')}`);
});
