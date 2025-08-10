const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const certificateRoutes = require('./routes/certificates');
const verificationRoutes = require('./routes/verification');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/certificates', certificateRoutes);
app.use('/api/verification', verificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Certification API is running',
    timestamp: new Date().toISOString(),
    mode: 'mock'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Blockchain Certification System API',
    version: '1.0.0',
    mode: 'mock',
    endpoints: {
      health: '/health',
      certificates: '/api/certificates',
      verification: '/api/verification'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
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
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Database: ${dbConnected ? 'Connected' : 'Mock Mode'}`);
      console.log(`Blockchain: Mock Mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

