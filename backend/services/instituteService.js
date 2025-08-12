const Institute = require('../models/Institute');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

class InstituteService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    // In-memory stores for mock mode
    this.memoryInstitutesById = new Map();
    this.memoryInstitutesByEmail = new Map();
  }

  isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  async registerInstitute(instituteData) {
    try {
      if (!this.isDbConnected()) {
        // Mock mode: store in memory
        if (this.memoryInstitutesByEmail.has(instituteData.email)) {
          throw new Error('Email already registered');
        }
        const instituteId = Institute.generateInstituteId();
        const passwordHash = await bcrypt.hash(instituteData.password, 12);
        const institute = {
          instituteId,
          name: instituteData.name,
          email: instituteData.email,
          organization: instituteData.organization,
          address: instituteData.address || {},
          contact: instituteData.contact || {},
          logo: null,
          signature: null,
          isVerified: true, // auto-verify in mock mode
          isActive: true,
          certificateCount: 0,
          createdAt: new Date(),
          lastLogin: new Date(),
          password: passwordHash
        };
        this.memoryInstitutesById.set(instituteId, institute);
        this.memoryInstitutesByEmail.set(institute.email, institute);
        const token = this.generateToken(institute);
        return {
          success: true,
          institute: {
            instituteId: institute.instituteId,
            name: institute.name,
            email: institute.email,
            organization: institute.organization,
            isVerified: institute.isVerified
          },
          token
        };
      }

      // DB mode
      const existingInstitute = await Institute.findOne({ email: instituteData.email });
      if (existingInstitute) {
        throw new Error('Email already registered');
      }

      const instituteId = Institute.generateInstituteId();
      const institute = new Institute({
        ...instituteData,
        instituteId
      });

      await institute.save();
      const token = this.generateToken(institute);
      return {
        success: true,
        institute: {
          instituteId: institute.instituteId,
          name: institute.name,
          email: institute.email,
          organization: institute.organization,
          isVerified: institute.isVerified
        },
        token
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async loginInstitute(email, password) {
    try {
      if (!this.isDbConnected()) {
        // Mock mode
        const institute = this.memoryInstitutesByEmail.get(email);
        if (!institute) throw new Error('Invalid credentials');
        if (!institute.isActive) throw new Error('Account is deactivated');
        const isPasswordValid = await bcrypt.compare(password, institute.password);
        if (!isPasswordValid) throw new Error('Invalid credentials');
        institute.lastLogin = new Date();
        const token = this.generateToken(institute);
        return {
          success: true,
          institute: {
            instituteId: institute.instituteId,
            name: institute.name,
            email: institute.email,
            organization: institute.organization,
            isVerified: institute.isVerified,
            certificateCount: institute.certificateCount
          },
          token
        };
      }

      // DB mode
      const institute = await Institute.findOne({ email });
      if (!institute) {
        throw new Error('Invalid credentials');
      }
      if (!institute.isActive) {
        throw new Error('Account is deactivated');
      }
      const isPasswordValid = await institute.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      institute.lastLogin = new Date();
      await institute.save();
      const token = this.generateToken(institute);
      return {
        success: true,
        institute: {
          instituteId: institute.instituteId,
          name: institute.name,
          email: institute.email,
          organization: institute.organization,
          isVerified: institute.isVerified,
          certificateCount: institute.certificateCount
        },
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getInstituteProfile(instituteId) {
    try {
      if (!this.isDbConnected()) {
        const institute = this.memoryInstitutesById.get(instituteId);
        if (!institute) throw new Error('Institute not found');
        const { password, ...safe } = institute;
        return safe;
      }

      const institute = await Institute.findOne({ instituteId }).select('-password');
      if (!institute) {
        throw new Error('Institute not found');
      }
      return institute;
    } catch (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  }

  async updateInstituteProfile(instituteId, updateData) {
    try {
      if (!this.isDbConnected()) {
        const institute = this.memoryInstitutesById.get(instituteId);
        if (!institute) throw new Error('Institute not found');
        const allowedUpdates = ['name', 'organization', 'address', 'contact', 'logo', 'signature'];
        allowedUpdates.forEach(field => {
          if (updateData[field] !== undefined) {
            institute[field] = updateData[field];
          }
        });
        this.memoryInstitutesById.set(instituteId, institute);
        const { password, ...safe } = institute;
        return { success: true, ...safe };
      }

      const institute = await Institute.findOne({ instituteId });
      if (!institute) {
        throw new Error('Institute not found');
      }
      const allowedUpdates = ['name', 'organization', 'address', 'contact', 'logo', 'signature'];
      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          institute[field] = updateData[field];
        }
      });
      await institute.save();
      return {
        success: true,
        institute: {
          instituteId: institute.instituteId,
          name: institute.name,
          email: institute.email,
          organization: institute.organization,
          address: institute.address,
          contact: institute.contact,
          logo: institute.logo,
          signature: institute.signature
        }
      };
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  async changePassword(instituteId, currentPassword, newPassword) {
    try {
      if (!this.isDbConnected()) {
        const institute = this.memoryInstitutesById.get(instituteId);
        if (!institute) throw new Error('Institute not found');
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, institute.password);
        if (!isCurrentPasswordValid) throw new Error('Current password is incorrect');
        institute.password = await bcrypt.hash(newPassword, 12);
        this.memoryInstitutesById.set(instituteId, institute);
        return { success: true, message: 'Password changed successfully' };
      }

      const institute = await Institute.findOne({ instituteId });
      if (!institute) {
        throw new Error('Institute not found');
      }
      const isCurrentPasswordValid = await institute.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      institute.password = newPassword;
      await institute.save();
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  async getInstituteStats(instituteId) {
    try {
      if (!this.isDbConnected()) {
        // Minimal stats in mock mode
        return {
          success: true,
          stats: {
            totalCertificates: 0,
            activeCertificates: 0,
            revokedCertificates: 0,
            instituteName: this.memoryInstitutesById.get(instituteId)?.name || '',
            organization: this.memoryInstitutesById.get(instituteId)?.organization || '',
            memberSince: this.memoryInstitutesById.get(instituteId)?.createdAt || new Date()
          },
          recentActivity: []
        };
      }

      const institute = await Institute.findOne({ instituteId });
      if (!institute) {
        throw new Error('Institute not found');
      }
      const Certificate = require('../models/Certificate');
      const totalCertificates = await Certificate.countDocuments({ instituteId });
      const activeCertificates = await Certificate.countDocuments({ instituteId, status: 'active' });
      const revokedCertificates = await Certificate.countDocuments({ instituteId, status: 'revoked' });
      const recentCertificates = await Certificate.find({ instituteId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('studentName courseName completionDate status createdAt');
      return {
        success: true,
        stats: {
          totalCertificates,
          activeCertificates,
          revokedCertificates,
          instituteName: institute.name,
          organization: institute.organization,
          memberSince: institute.createdAt
        },
        recentActivity: recentCertificates
      };
    } catch (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  }

  generateToken(institute) {
    return jwt.sign(
      {
        instituteId: institute.instituteId,
        email: institute.email,
        name: institute.name
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async validateInstitute(instituteId) {
    try {
      if (!this.isDbConnected()) {
        return this.memoryInstitutesById.has(instituteId);
      }
      const institute = await Institute.findOne({ instituteId, isActive: true });
      return !!institute;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new InstituteService();
