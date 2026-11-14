const express = require('express');
const cors    = require('cors');
const path    = require('path');
const errorHandler = require('./middleware/errorHandler');

const authRoutes         = require('./routes/authRoutes');
const complaintRoutes    = require('./routes/complaintRoutes');
const staffRoutes        = require('./routes/staffRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const metaRoutes         = require('./routes/metaRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status:    'online',
    system:    'Smart College Complaint Management System API',
    database:  'MongoDB',
    db_state:  mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    db_name:   mongoose.connection.name,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth',          authRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/staff',         staffRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/meta',          metaRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all 404 for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route '${req.originalUrl}' does not exist.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
