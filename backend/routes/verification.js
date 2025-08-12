const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const certificateService = require('../services/certificateService');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Verification Service',
    timestamp: new Date().toISOString()
  });
});

// Verify certificate by ID
router.post('/verify', [
  body('certificateId').trim().isLength({ min: 5, max: 50 }).withMessage('Certificate ID must be 5-50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { certificateId } = req.body;
    const result = await certificateService.verifyCertificate(certificateId);
    
    res.json({
      success: true,
      verification: result
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Verification failed'
    });
  }
});

// Get certificate details by ID (public route)
router.get('/:certificateId', async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.certificateId);
    
    res.json({
      success: true,
      certificate: certificate
    });

  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Certificate not found'
    });
  }
});

// Bulk verify multiple certificates
router.post('/bulk-verify', [
  body('certificateIds').isArray({ min: 1, max: 10 }).withMessage('Must provide 1-10 certificate IDs')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { certificateIds } = req.body;
    const results = [];

    for (const certificateId of certificateIds) {
      try {
        const result = await certificateService.verifyCertificate(certificateId);
        results.push({
          certificateId,
          ...result
        });
      } catch (error) {
        results.push({
          certificateId,
          isValid: false,
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      results: results,
      summary: {
        total: results.length,
        valid: results.filter(r => r.isValid).length,
        invalid: results.filter(r => !r.isValid).length
      }
    });

  } catch (error) {
    console.error('Bulk verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Bulk verification failed'
    });
  }
});

// Verify certificate by hash
router.post('/verify-hash', [
  body('hash').trim().isLength({ min: 64, max: 66 }).withMessage('Hash must be 64-66 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { hash } = req.body;
    
    // Search for certificate by hash
    const certificates = await certificateService.searchCertificates(hash);
    
    if (certificates.length === 0) {
      return res.json({
        success: true,
        isValid: false,
        message: 'No certificate found with this hash'
      });
    }

    const certificate = certificates[0];
    const result = await certificateService.verifyCertificate(certificate.certificateId);
    
    res.json({
      success: true,
      verification: result
    });

  } catch (error) {
    console.error('Hash verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Hash verification failed'
    });
  }
});

// Get blockchain status for a certificate
router.get('/:certificateId/blockchain-status', async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const blockchainStatus = await certificateService.verifyOnBlockchain(certificate);
    
    res.json({
      success: true,
      certificateId: certificate.certificateId,
      blockchainStatus: blockchainStatus,
      certificate: {
        hash: certificate.certificateHash,
        transactionHash: certificate.blockchainTxHash,
        blockNumber: certificate.blockNumber,
        blockchainAddress: certificate.blockchainAddress
      }
    });

  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get blockchain status'
    });
  }
});

// Deep verification with blockchain check
router.post('/deep-verify', [
  body('certificateId').trim().isLength({ min: 5, max: 50 }).withMessage('Certificate ID must be 5-50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { certificateId } = req.body;
    
    // Get certificate details
    const certificate = await certificateService.getCertificateById(certificateId);
    
    if (!certificate) {
      return res.json({
        success: true,
        isValid: false,
        message: 'Certificate not found'
      });
    }

    // Basic verification
    const basicVerification = await certificateService.verifyCertificate(certificateId);
    
    // Blockchain verification
    const blockchainVerification = await certificateService.verifyOnBlockchain(certificate);
    
    // Additional security checks
    const securityChecks = {
      hashIntegrity: certificate.certificateHash ? true : false,
      blockchainStored: certificate.blockchainTxHash && certificate.blockchainTxHash !== '0x0000000000000000000000000000000000000000',
      notRevoked: certificate.status !== 'revoked',
      instituteVerified: certificate.instituteId && certificate.instituteId.isVerified
    };

    const overallValid = basicVerification.isValid && 
                        blockchainVerification.verified && 
                        securityChecks.hashIntegrity && 
                        securityChecks.notRevoked;

    res.json({
      success: true,
      verification: {
        isValid: overallValid,
        message: overallValid ? 'Certificate is fully verified and secure' : 'Certificate verification failed',
        basicVerification: basicVerification,
        blockchainVerification: blockchainVerification,
        securityChecks: securityChecks,
        certificate: certificate
      }
    });

  } catch (error) {
    console.error('Deep verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Deep verification failed'
    });
  }
});

module.exports = router;










