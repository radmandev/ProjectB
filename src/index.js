require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`Sendpulse-Bitrix24 Integration Server`);
  console.log(`===========================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===========================================`);
  console.log(`Webhook URLs:`);
  console.log(`- Sendpulse: ${process.env.WEBHOOK_BASE_URL || 'http://localhost:' + PORT}/webhook/sendpulse`);
  console.log(`- Bitrix24:  ${process.env.WEBHOOK_BASE_URL || 'http://localhost:' + PORT}/webhook/bitrix24`);
  console.log(`===========================================`);
  console.log(`Health check: ${process.env.WEBHOOK_BASE_URL || 'http://localhost:' + PORT}/health`);
  console.log(`Stats:        ${process.env.WEBHOOK_BASE_URL || 'http://localhost:' + PORT}/stats`);
  console.log(`===========================================`);
});

module.exports = app;
