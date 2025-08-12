const express = require('express');
const { body, validationResult } = require('express-validator');
const instituteService = require('../services/instituteService');
const { authenticateToken, requireVerifiedInstitute } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation middleware
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Institute name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('organization')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Organization name must be between 2 and 200 characters')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Public routes
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const result = await instituteService.registerInstitute(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Institute registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const result = await instituteService.loginInstitute(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const profile = await instituteService.getInstituteProfile(req.institute.instituteId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const result = await instituteService.updateInstituteProfile(
      req.institute.instituteId,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const result = await instituteService.changePassword(
      req.institute.instituteId,
      currentPassword,
      newPassword
    );
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = await instituteService.getInstituteStats(req.institute.instituteId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// File upload routes
router.post('/upload-logo', authenticateToken, upload.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const logoUrl = `/uploads/${req.file.filename}`;
    
    // Update institute profile with logo URL
    await instituteService.updateInstituteProfile(req.institute.instituteId, {
      logo: logoUrl
    });

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logoUrl }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload-signature', authenticateToken, upload.single('signature'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const signatureUrl = `/uploads/${req.file.filename}`;
    
    // Update institute profile with signature URL
    await instituteService.updateInstituteProfile(req.institute.instituteId, {
      signature: signatureUrl
    });

    res.json({
      success: true,
      message: 'Signature uploaded successfully',
      data: { signatureUrl }
    });
  } catch (error) {
    next(error);
  }
});

// Health check for institute service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Institute service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
