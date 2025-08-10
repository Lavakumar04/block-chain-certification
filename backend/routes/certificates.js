const express = require('express');
const { body, validationResult } = require('express-validator');
const certificateService = require('../services/certificateService');
const { errorHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const validateCertificateData = [
  body('studentName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  body('courseName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Course name must be between 2 and 200 characters'),
  body('completionDate')
    .isISO8601()
    .withMessage('Completion date must be a valid ISO date'),
  body('issuerName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Issuer name must be between 2 and 100 characters'),
  body('issuerOrganization')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Issuer organization must be between 2 and 200 characters')
];

// Generate new certificate
router.post('/', validateCertificateData, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const certificateData = req.body;
    
    // Create certificate
    const result = await certificateService.createCertificate(certificateData);
    
    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: {
        certificateId: result.certificate.certificateId,
        certificate: result.certificate,
        pdfUrl: result.pdfUrl,
        qrCodeUrl: result.qrCodeUrl,
        verificationUrl: result.verificationUrl,
        blockchainResult: result.blockchainResult
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Get all certificates
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let certificates;
    
    if (search) {
      // Parse search query
      const searchQuery = {};
      if (search.studentName) searchQuery.studentName = search.studentName;
      if (search.courseName) searchQuery.courseName = search.courseName;
      if (search.issuerName) searchQuery.issuerName = search.issuerName;
      
      certificates = await certificateService.searchCertificates(searchQuery);
    } else {
      certificates = await certificateService.getAllCertificates();
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCertificates = certificates.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(certificates.length / limit);
    
    res.json({
      success: true,
      data: {
        certificates: paginatedCertificates,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCertificates: certificates.length,
          hasNextPage: endIndex < certificates.length,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Get certificate by ID
router.get('/:certificateId', async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await certificateService.getCertificate(certificateId);
    
    res.json({
      success: true,
      data: certificate
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

// Search certificates
router.get('/search', async (req, res, next) => {
  try {
    const { studentName, courseName, issuerName } = req.query;
    
    const searchQuery = {};
    if (studentName) searchQuery.studentName = studentName;
    if (courseName) searchQuery.courseName = courseName;
    if (issuerName) searchQuery.issuerName = issuerName;
    
    const certificates = await certificateService.searchCertificates(searchQuery);
    
    res.json({
      success: true,
      data: certificates
    });
    
  } catch (error) {
    next(error);
  }
});

// Download certificate PDF
router.get('/:certificateId/pdf', async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await certificateService.getCertificate(certificateId);
    
    if (!certificate.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found for this certificate'
      });
    }
    
    // Redirect to the PDF file
    res.redirect(certificate.pdfUrl);
    
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

// Download QR code
router.get('/:certificateId/qr', async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await certificateService.getCertificate(certificateId);
    
    if (!certificate.qrCodeUrl) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for this certificate'
      });
    }
    
    // Redirect to the QR code image
    res.redirect(certificate.qrCodeUrl);
    
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

// Revoke certificate
router.patch('/:certificateId/revoke', async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    
    const result = await certificateService.revokeCertificate(certificateId);
    
    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: result.certificate
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

// Get certificate statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    const certificates = await certificateService.getAllCertificates();
    
    const stats = {
      total: certificates.length,
      active: certificates.filter(c => c.status === 'active').length,
      revoked: certificates.filter(c => c.status === 'revoked').length,
      expired: certificates.filter(c => c.status === 'expired').length,
      thisMonth: certificates.filter(c => {
        const now = new Date();
        const certDate = new Date(c.createdAt);
        return certDate.getMonth() === now.getMonth() && 
               certDate.getFullYear() === now.getFullYear();
      }).length,
      thisYear: certificates.filter(c => {
        const now = new Date();
        const certDate = new Date(c.createdAt);
        return certDate.getFullYear() === now.getFullYear();
      }).length
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;



