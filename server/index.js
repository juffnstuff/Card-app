try { require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') }); } catch {}
// In production (Railway), env vars are injected — dotenv is only for local dev

process.on('uncaughtException', (err) => { console.error('UNCAUGHT:', err); });
process.on('unhandledRejection', (err) => { console.error('UNHANDLED:', err); });

const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('Loading routes...');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const dateRoutes = require('./routes/dates');
const cardRoutes = require('./routes/cards');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const subscriptionRoutes = require('./routes/subscription');
const webhookRoutes = require('./routes/webhook');
const { startNotificationCron } = require('./cron/notifications');
console.log('Routes loaded.');

const app = express();
const PORT = process.env.PORT || 8080;

// DECISION: Allow same-origin in production (served from Express) and configurable origin for dev
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));

// Stripe webhook needs raw body — mount before express.json()
app.use('/api/webhook', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'CardKeeper API' }));

// DECISION: In production, serve the built React app from Express (single-service deploy)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CardKeeper API running on 0.0.0.0:${PORT}`);
  startNotificationCron();
});
