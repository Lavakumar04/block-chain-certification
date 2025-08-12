const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Import routes
const certificateRoutes = require('./routes/certificates');
const verificationRoutes = require('./routes/verification');
const instituteRoutes = require('./routes/institutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/institutes', instituteRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/verification', verificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Enhanced Certification API is running',
    timestamp: new Date().toISOString(),
    mode: 'enhanced',
    features: [
      'Dynamic Certificate Generation',
      'Blockchain-based Secure Storage',
      'Advanced Verification System',
      'Multi-format Download Options',
      'Institute Dashboard Access',
      'Customizable Certificate Templates',
      'Mobile-First Design'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Enhanced Blockchain Certification System API',
    version: '2.0.0',
    mode: 'enhanced',
    endpoints: {
      health: '/health',
      institutes: '/api/institutes',
      certificates: '/api/certificates',
      verification: '/api/verification'
    },
    features: {
      certificateGeneration: 'POST /api/certificates',
      certificateVerification: 'GET /api/verification/:id',
      instituteRegistration: 'POST /api/institutes/register',
      instituteLogin: 'POST /api/institutes/login',
      instituteProfile: 'GET /api/institutes/profile',
      certificateDownload: 'GET /api/certificates/:id/pdf',
      certificateImage: 'GET /api/certificates/:id/image',
      qrCodeDownload: 'GET /api/certificates/:id/qr'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      '/health',
      '/api/institutes',
      '/api/certificates',
      '/api/verification'
    ]
  });
});

// Database connection - make it optional for now
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certification_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log('MongoDB connection failed, running in mock mode:', error.message);
    console.log('API will work with mock data only');
    return false;
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Try to connect to database (optional)
    const dbConnected = await connectDB();
    
    // Start server regardless of database connection
    app.listen(PORT, () => {
      console.log('🚀 Enhanced Blockchain Certification System API Started!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: ${dbConnected ? 'Connected' : 'Mock Mode'}`);
      console.log(`⛓️  Blockchain: Mock Mode`);
      console.log('');
      console.log('✨ Enhanced Features Available:');
      console.log('   • Dynamic Certificate Generation');
      console.log('   • Blockchain-based Secure Storage');
      console.log('   • Advanced Verification System');
      console.log('   • Multi-format Download Options');
      console.log('   • Institute Dashboard Access');
      console.log('   • Customizable Certificate Templates');
      console.log('   • Mobile-First Design');
      console.log('');
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

