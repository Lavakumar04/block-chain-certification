const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mock data storage
let certificates = [];

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Minimal server is running',
    timestamp: new Date().toISOString()
  });
});

// Generate certificate
app.post('/api/certificates', (req, res) => {
  try {
    const { studentName, courseName, completionDate, issuerName, description, template = 'modern', ...otherFields } = req.body;
    
    if (!studentName || !courseName || !completionDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student name, course name, and completion date are required' 
      });
    }

    const certificateId = uuidv4();
    const certificateHash = uuidv4();
    const blockchainTxHash = `0x${uuidv4().replace(/-/g, '')}`;
    
    const certificate = {
      id: certificateId,
      certificateId,
      certificateHash,
      studentName,
      courseName,
      completionDate,
      issuerName: issuerName || 'Certification Authority',
      description,
      template,
      status: 'pending',
      blockchainTxHash,
      blockNumber: Math.floor(Math.random() * 1000000),
      createdAt: new Date().toISOString(),
      instituteId: 'mock-institute-id',
      instituteName: 'Mock Institute',
      ...otherFields
    };

    certificates.push(certificate);
    
    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate certificate' 
    });
  }
});

// Verify certificate
app.post('/api/verification/verify', (req, res) => {
  try {
    const { certificateId } = req.body;
    
    if (!certificateId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Certificate ID is required' 
      });
    }

    const certificate = certificates.find(c => c.certificateId === certificateId);
    
    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        error: 'Certificate not found' 
      });
    }

    // Add mock blockchain verification data
    const blockchainVerification = {
      verified: true,
      timestamp: new Date().toISOString(),
      network: 'Ethereum Testnet',
      isRevoked: false,
      lastVerified: new Date().toISOString()
    };

    if (certificate.status !== 'active' && certificate.status !== 'pending') {
      return res.json({
        success: true,
        verification: {
          isValid: false,
          message: 'Certificate is revoked or inactive',
          certificate: certificate,
          blockchainVerification
        }
      });
    }

    res.json({
      success: true,
      verification: {
        isValid: true,
        message: 'Certificate is valid',
        certificate: certificate,
        blockchainVerification
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed' 
    });
  }
});

// Get certificate by ID
app.get('/api/certificates/:certificateId', (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = certificates.find(c => c.certificateId === certificateId);
    
    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        error: 'Certificate not found' 
      });
    }

    res.json({
      success: true,
      certificate: certificate
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch certificate' 
    });
  }
});

// Get all certificates for an institute
app.get('/api/certificates', (req, res) => {
  try {
    // In real app, check authentication token
    const instituteId = req.query.instituteId || 'mock-institute-id';
    
    const instituteCertificates = certificates.filter(c => c.instituteId === instituteId);
    
    res.json({
      success: true,
      certificates: instituteCertificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch certificates' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

console.log('Starting minimal server...');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal server started on port ${PORT}`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Add error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

server.on('listening', () => {
  console.log(`Server is listening on port ${PORT}`);
});

console.log('Server setup complete');

module.exports = app;
