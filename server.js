const express = require('express');
const cron = require('node-cron');

// Import cron jobs
require('./cron/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Express Cron Service is running!',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cronJobs: {
      newsFetch: 'Every 6 hours',
      instagramPost: 'Every 15 minutes'
    }
  });
});

// Cron status endpoint
app.get('/cron-status', (req, res) => {
  res.json({
    jobs: [
      {
        name: 'News Fetch',
        schedule: '0 */6 * * *',
        description: 'Fetches news from GNews API and updates cache'
      },
      {
        name: 'Instagram Auto Post',
        schedule: '*/15 * * * *',
        description: 'Posts queued content to Instagram'
      }
    ],
    categories: [
      'general', 'world', 'nation', 'business', 'technology',
      'entertainment', 'sports', 'science', 'health'
    ]
  });
});

// Example cron job - runs every minute
cron.schedule('* * * * *', () => {
  console.log(`[${new Date().toISOString()}] Server heartbeat - running every minute`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Cron status available at http://localhost:${PORT}/cron-status`);
  console.log('News fetch cron: Every 6 hours');
  console.log('Instagram post cron: Every 15 minutes');
  console.log('Server heartbeat cron: Every minute');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});