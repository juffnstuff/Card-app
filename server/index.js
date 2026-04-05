require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const dateRoutes = require('./routes/dates');
const cardRoutes = require('./routes/cards');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const { startNotificationCron } = require('./cron/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'CardKeeper API' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CardKeeper API running on http://localhost:${PORT}`);
  startNotificationCron();
});
