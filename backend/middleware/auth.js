const instituteService = require('../services/instituteService');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = instituteService.verifyToken(token);
    
    // Validate institute
    const isValidInstitute = await instituteService.validateInstitute(decoded.instituteId);
    if (!isValidInstitute) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive institute account'
      });
    }

    // Add institute info to request
    req.institute = {
      instituteId: decoded.instituteId,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

const requireVerifiedInstitute = async (req, res, next) => {
  try {
    if (!req.institute) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if institute is verified
    const institute = await instituteService.getInstituteProfile(req.institute.instituteId);
    if (!institute.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Institute account must be verified to perform this action'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to verify institute status'
    });
  }
};

module.exports = {
  authenticateToken,
  requireVerifiedInstitute
};
