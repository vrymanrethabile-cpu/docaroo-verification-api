/**
 * Express App Setup
 * Configures the Express application with middleware and routes
 */

const express = require('express');
const helmet = require('helmet');
const verificationRoutes = require('./routes/verificationRoutes');

const app = express();

// Security middleware
app.use(helmet());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1', verificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Docaroo Verification Intake & Compliance API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/v1/health',
      ingest: 'POST /api/v1/verifications/ingest'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

module.exports = app;
