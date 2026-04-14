try { require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); } catch {}
// In production (Railway), env vars are injected — dotenv is only for local dev

process.on('uncaughtException', (err) => { console.error('UNCAUGHT:', err); });
process.on('unhandledRejection', (err) => { console.error('UNHANDLED:', err); });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const prisma = require('./lib/prisma');

console.log('Loading routes...');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const dateRoutes = require('./routes/dates');
const cardRoutes = require('./routes/cards');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const subscriptionRoutes = require('./routes/subscription');
const webhookRoutes = require('./routes/webhook');
const importRoutes = require('./routes/import');
const cardImageRoutes = require('./routes/cardImage');
const { startNotificationCron } = require('./cron/notifications');
console.log('Routes loaded.');

const app = express();
const PORT = process.env.PORT || 8080;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // managed by frontend framework
  crossOriginEmbedderPolicy: false,
}));

// CORS — fail closed: require explicit FRONTEND_URL in production
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Stripe webhook needs raw body — mount before express.json()
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/import', importRoutes);
app.use('/api/card-image', cardImageRoutes);

// Health check — verify database connectivity
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', service: 'CardKeeper API' });
  } catch {
    res.status(503).json({ status: 'degraded', service: 'CardKeeper API', error: 'Database unreachable' });
  }
});

// Public config (safe keys only — no secrets)
app.get('/api/config', (req, res) => res.json({
  googleMapsKey: process.env.GOOGLE_MAPS_API_KEY || '',
}));

// DECISION: In production, serve the built React app from Express (single-service deploy)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global error handler — never leak internal details to clients
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  const status = err.status || 500;
  const message = status >= 500 ? 'Internal server error' : (err.message || 'Request failed');
  res.status(status).json({ error: message });
});

console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CardKeeper API running on 0.0.0.0:${PORT}`);
  startNotificationCron();
});
