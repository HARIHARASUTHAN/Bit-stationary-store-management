import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { isFirebaseConnected, db } from './config/firebase.js';
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
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      callback(null, true);
    },
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BIT Campus Stationery Backend API Server',
    message: 'Backend server is running successfully.',
    healthCheck: '/api/health',
    frontendPortal: CLIENT_ORIGIN,
    firebaseConnected: isFirebaseConnected,
    mode: isFirebaseConnected ? 'Live Cloud Firestore' : 'Local Demo/Mock Fallback',
  });
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
app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 BIT Stationery Backend running on port: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Allowed Client Origin: ${CLIENT_ORIGIN}`);
  console.log(`🔥 Firebase Mode: ${isFirebaseConnected ? 'LIVE (Firestore connected)' : 'DEMO (In-Memory fallback)'}`);
  console.log('====================================================');

  if (isFirebaseConnected && db) {
    db.collection('inventory').limit(1).get()
      .then((snap) => {
        console.log(`✅ [Firestore Verification] Connected to Cloud Firestore. Live inventory collection active (${snap.size} item checked).`);
      })
      .catch((err) => {
        console.error('❌ [Firestore Connection Warning]: Could not reach Cloud Firestore:', err.message);
      });
  }
});

export default app;
