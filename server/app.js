const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

// Initialize DB connection
connectDB();
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const errorMiddleware = require('./middleware/errorMiddleware');

const {
  authRoutes,
  userRoutes,
  productRoutes,
  orderRoutes,
  adminRoutes,
  blogRoutes,
  galleryRoutes,
  messageRoutes
} = require('./routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Passport
app.use(passport.initialize());

// API Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/messages', messageRoutes);
} catch (err) {
  console.error('Error during route registration:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
