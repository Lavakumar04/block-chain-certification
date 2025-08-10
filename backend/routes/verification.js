const express = require('express');
const { body, validationResult } = require('express-validator');
const certificateService = require('../services/certificateService');
const blockchainService = require('../services/blockchainService');
const { errorHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const validateVerificationData = [
  body('certificateId')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Certificate ID is required')
];

// Verify certificate by ID
router.post('/verify', validateVerificationData, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { certificateId } = req.body;
    
    // Verify certificate
    const result = await certificateService.verifyCertificate(certificateId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
});

// Verify certificate by hash
router.post('/verify-hash', async (req, res, next) => {
  try {
    const { hash } = req.body;
    
    if (!hash) {
      return res.status(400).json({
        success: false,
        message: 'Hash is required'
      });
    }
    
    // Verify on blockchain
    const blockchainResult = await blockchainService.verifyCertificate(hash);
    
    // Check if certificate exists in database
    const certificate = await certificateService.getCertificateByHash(hash);
    
    let databaseResult = null;
    if (certificate) {
      databaseResult = {
        exists: true,
        status: certificate.status,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate
      };
    }
    
    res.json({
      success: true,
      data: {
        hash,
        blockchainVerification: blockchainResult,
        databaseResult,
        overallValid: blockchainResult.isValid && 
                     (!databaseResult || databaseResult.status === 'active')
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Get verification page data
router.get('/:certificateId', async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    
    // Get certificate details
    const certificate = await certificateService.getCertificate(certificateId);
    
    // Get blockchain info
    const networkInfo = await blockchainService.getNetworkInfo();
    
    res.json({
      success: true,
      data: {
        certificate,
        networkInfo,
        verificationUrl: certificate.verificationUrl
      }
    });
    
  } catch (error) {
    if (error.message === 'Certificate not found') {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    next(error);
  }
});

// Bulk verification
router.post('/bulk-verify', async (req, res, next) => {
  try {
    const { certificateIds } = req.body;
    
    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Certificate IDs array is required'
      });
    }
    
    if (certificateIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 certificates can be verified at once'
      });
    }
    
    const results = [];
    
    for (const certificateId of certificateIds) {
      try {
        const result = await certificateService.verifyCertificate(certificateId);
        results.push({
          certificateId,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          certificateId,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        total: certificateIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Get blockchain network status
router.get('/status/blockchain', async (req, res, next) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    const signerBalance = await blockchainService.getSignerBalance();
    
    res.json({
      success: true,
      data: {
        network: networkInfo,
        signerBalance,
        status: 'connected'
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      data: {
        status: 'disconnected',
        error: error.message
      }
    });
  }
});

// Verify certificate authenticity (deep verification)
router.post('/deep-verify/:certificateId', async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    
    // Get certificate from database
    const certificate = await certificateService.getCertificate(certificateId);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // Verify on blockchain
    const blockchainVerification = await blockchainService.verifyCertificate(
      certificate.certificateHash
    );
    
    // Get certificate details from blockchain
    const blockchainDetails = await blockchainService.getCertificateDetails(
      certificate.certificateHash
    );
    
    // Check if certificate is still valid in database
    const isDatabaseValid = certificate.status === 'active';
    
    // Compare hashes
    const isHashValid = certificate.certificateHash === certificate.blockchainHash;
    
    // Check if blockchain data matches database data
    const isDataConsistent = blockchainDetails.certificateHash === certificate.certificateHash;
    
    const isValid = blockchainVerification.isValid && 
                   isDatabaseValid && 
                   isHashValid && 
                   isDataConsistent;
    
    const verificationScore = [
      blockchainVerification.isValid,
      isDatabaseValid,
      isHashValid,
      isDataConsistent
    ].filter(Boolean).length / 4 * 100;
    
    res.json({
      success: true,
      data: {
        certificateId,
        isValid,
        verificationScore: Math.round(verificationScore),
        verificationDetails: {
          blockchainValid: blockchainVerification.isValid,
          databaseValid: isDatabaseValid,
          hashValid: isHashValid,
          dataConsistent: isDataConsistent,
          timestamp: blockchainVerification.timestamp,
          issuer: blockchainVerification.issuer,
          blockNumber: certificate.blockNumber,
          transactionHash: certificate.transactionHash
        },
        blockchainData: blockchainDetails,
        databaseData: {
          status: certificate.status,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          completionDate: certificate.completionDate,
          issuerName: certificate.issuerName,
          issuerOrganization: certificate.issuerOrganization
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;




