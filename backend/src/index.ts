import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import analysisRoutes from './routes/analysis';
import CoachRoutes from './routes/coach';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS must come FIRST (before routes)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-frontend-domain.com'
    : 'http://localhost:8080',
  credentials: true
}));


app.use((req, res, next) => {
  console.log(`🔍 Incoming: ${req.method} ${req.originalUrl}`);
  next();
});


// ✅ Other middleware BEFORE routes
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ Routes (choose ONE path for coach routes)
app.use('/api/analysis', analysisRoutes);
app.use('/api/coach', CoachRoutes);  // Keep this one, remove the other

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 OmniPass Backend running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Analysis endpoint: http://localhost:${PORT}/api/analysis/{address}`);
  console.log(`🤖 AI Coach endpoint: http://localhost:${PORT}/api/coach/ask`); // Added this
});
