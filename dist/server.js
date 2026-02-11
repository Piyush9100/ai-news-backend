"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const dotenv_1 = __importDefault(require("dotenv"));
const generate_canvas_1 = require("./routes/generate-canvas");
const shorten_title_1 = require("./routes/shorten-title");
// Load environment variables
dotenv_1.default.config();
// Import cron jobs
require("./cron/index");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
            newsFetch: 'Every 15 minutes',
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
                schedule: '*/15 * * * *',
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
app.post('/api/generate-canvas', generate_canvas_1.generateCanvas);
app.post('/api/shorten-title', shorten_title_1.shortenTitle);
// Example cron job - runs every minute
node_cron_1.default.schedule('* * * * *', () => {
    console.log(`[${new Date().toISOString()}] Server heartbeat - running every minute`);
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`Cron status available at http://localhost:${PORT}/cron-status`);
    console.log(`Canvas API available at http://localhost:${PORT}/api/generate-canvas`);
    console.log(`Title shortening API available at http://localhost:${PORT}/api/shorten-title`);
    console.log('News fetch cron: Every 15 minutes');
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
//# sourceMappingURL=server.js.map