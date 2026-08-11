const express = require('express');
const cors = require('cors');
const logger = require('./middlewares/logger');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express Backend API 🚀',
    healthCheck: '/api/health',
    users: '/api/users'
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
