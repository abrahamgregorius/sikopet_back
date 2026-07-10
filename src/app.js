import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SIKOPET API',
    version: '1.0.0',
    description: 'Cooperative Management System Backend',
    documentation: '/api/docs',
  });
});

// API Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'SIKOPET API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

export default app;
