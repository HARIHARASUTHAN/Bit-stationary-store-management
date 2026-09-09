import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { isFirebaseConnected } from './config/firebase.js';
import authRoutes from './routes/authRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// CORS configuration
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-role'],
  })
);

// Body Parser
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BIT Campus Stationery Backend API',
    firebaseConnected: isFirebaseConnected,
    mode: isFirebaseConnected ? 'Live Cloud Firestore' : 'Local Demo/Mock Fallback',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/reports', reportRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `API endpoint '${req.method} ${req.originalUrl}' does not exist.`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 BIT Stationery Backend running on port: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Allowed Client Origin: ${CLIENT_ORIGIN}`);
  console.log(`🔥 Firebase Mode: ${isFirebaseConnected ? 'LIVE (Firestore connected)' : 'DEMO (In-Memory fallback)'}`);
  console.log('====================================================');
});

export default app;
