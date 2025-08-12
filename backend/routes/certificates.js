const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const certificateService = require('../services/certificateService');
const { authenticateToken, requireVerifiedInstitute } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Validation middleware
const validateCertificateData = [
  body('studentName').trim().isLength({ min: 2, max: 100 }).withMessage('Student name must be 2-100 characters'),
  body('courseName').trim().isLength({ min: 2, max: 200 }).withMessage('Course name must be 2-200 characters'),
  body('completionDate').isISO8601().withMessage('Invalid completion date'),
  body('issuerName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Issuer name must be 2-100 characters'),
  body('issuerOrganization').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Organization must be 2-200 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be under 500 characters'),
  body('grade').optional().trim().isLength({ max: 50 }).withMessage('Grade must be under 50 characters'),
  body('duration').optional().trim().isLength({ max: 100 }).withMessage('Duration must be under 100 characters'),
  body('certificateType').isIn(['course', 'training', 'achievement', 'participation', 'other']).withMessage('Invalid certificate type'),
  body('template').optional().isIn(['modern', 'classic']).withMessage('Invalid template'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
];

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Certificate Service',
    timestamp: new Date().toISOString()
  });
});

// Generate new certificate (requires institute authentication)
router.post('/', authenticateToken, requireVerifiedInstitute, validateCertificateData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const instituteId = req.user.instituteId;
    const result = await certificateService.createCertificate(req.body, instituteId);
    
    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: result.certificate,
      files: {
        pdf: `/api/certificates/${result.certificate.certificateId}/pdf`,
        image: `/api/certificates/${result.certificate.certificateId}/image`,
        qrCode: `/api/certificates/${result.certificate.certificateId}/qr`
      }
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate certificate'
    });
  }
});

// Get all certificates for an institute (with filters)
router.get('/', authenticateToken, requireVerifiedInstitute, async (req, res) => {
  try {
    const instituteId = req.user.instituteId;
    const filters = {
      search: req.query.search,
      status: req.query.status,
      template: req.query.template
    };

    const certificates = await certificateService.getAllCertificates(instituteId, filters);
    
    res.json({
      success: true,
      count: certificates.length,
      certificates: certificates
    });

  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch certificates'
    });
  }
});

// Get certificate by ID
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

// Download certificate PDF
router.get('/:certificateId/pdf', async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.certificateId);
    const filePath = path.join(__dirname, '../uploads', certificate.pdfPath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }
    
    res.download(filePath, `certificate_${certificate.certificateId}.pdf`, (err) => {
      if (err) {
        console.error('PDF download error:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to download PDF'
        });
      }
    });

  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Certificate not found'
    });
  }
});

// Download certificate image
router.get('/:certificateId/image', async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.certificateId);
    const filePath = path.join(__dirname, '../uploads', certificate.imagePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found'
      });
    }
    
    res.download(filePath, `certificate_${certificate.certificateId}.png`, (err) => {
      if (err) {
        console.error('Image download error:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to download image'
        });
      }
    });

  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Certificate not found'
    });
  }
});

// Download QR code
router.get('/:certificateId/qr', async (req, res) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.certificateId);
    const filePath = path.join(__dirname, '../uploads', certificate.qrCodePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'QR code file not found'
      });
    }
    
    res.download(filePath, `qr_${certificate.certificateId}.png`, (err) => {
      if (err) {
        console.error('QR code download error:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to download QR code'
        });
      }
    });

  } catch (error) {
    console.error('Error downloading QR code:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Certificate not found'
    });
  }
});

// Revoke certificate (requires institute authentication)
router.put('/:certificateId/revoke', authenticateToken, requireVerifiedInstitute, [
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Revocation reason must be 10-500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const instituteId = req.user.instituteId;
    const result = await certificateService.revokeCertificate(
      req.params.certificateId, 
      instituteId, 
      req.body.reason
    );
    
    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      certificate: result.certificate
    });

  } catch (error) {
    console.error('Certificate revocation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to revoke certificate'
    });
  }
});

// Get certificate statistics for institute
router.get('/stats/summary', authenticateToken, requireVerifiedInstitute, async (req, res) => {
  try {
    const instituteId = req.user.instituteId;
    const stats = await certificateService.getCertificateStats(instituteId);
    
    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics'
    });
  }
});

// Search certificates
router.get('/search/:query', authenticateToken, requireVerifiedInstitute, async (req, res) => {
  try {
    const instituteId = req.user.instituteId;
    const certificates = await certificateService.searchCertificates(req.params.query, instituteId);
    
    res.json({
      success: true,
      query: req.params.query,
      count: certificates.length,
      certificates: certificates
    });

  } catch (error) {
    console.error('Certificate search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Search failed'
    });
  }
});

module.exports = router;










