import express from 'express';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { generateCanvas } from './routes/generate-canvas';
import { shortenTitle } from './routes/shorten-title';

// Load environment variables
dotenv.config();

// Import cron jobs
import './cron/index';

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
      instagramPost: 'Every 30 minutes'
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
        schedule: '*/30 * * * *',
        description: 'Posts queued content to Instagram'
      }
    ],
    categories: [
      'general', 'world', 'nation', 'business', 'technology',
      'entertainment', 'sports', 'science', 'health'
    ]
  });
});

// API Routes
app.post('/api/generate-canvas', generateCanvas);
app.post('/api/shorten-title', shortenTitle);

// Example cron job - runs every minute
cron.schedule('* * * * *', () => {
  console.log(`[${new Date().toISOString()}] Server heartbeat - running every minute`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Cron status available at http://localhost:${PORT}/cron-status`);
  console.log(`Canvas API available at http://localhost:${PORT}/api/generate-canvas`);
  console.log(`Title shortening API available at http://localhost:${PORT}/api/shorten-title`);
  console.log('News fetch cron: Every 6 hours');
  console.log('Instagram post cron: Every 30 minutes');
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