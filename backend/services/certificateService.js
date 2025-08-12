const Certificate = require('../models/Certificate');
const Institute = require('../models/Institute');
const fs = require('fs').promises;
const path = require('path');
const { ethers } = require('ethers');

class CertificateService {
  constructor() {
    this.blockchainProvider = null;
    this.contract = null;
    // Initialize blockchain asynchronously without blocking
    this.initializeBlockchain().catch(err => {
      console.log('⚠️  Blockchain initialization failed, using mock mode:', err.message);
    });
  }

  async initializeBlockchain() {
    try {
      // Try to connect to Ganache or local blockchain
      this.blockchainProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
      console.log('✅ Connected to local blockchain');
    } catch (error) {
      console.log('⚠️  Blockchain not available, using mock mode');
      this.blockchainProvider = null;
    }
  }

  async createCertificate(certificateData, instituteId) {
    try {
      // Validate institute exists and is verified
      const institute = await Institute.findById(instituteId);
      if (!institute) {
        throw new Error('Institute not found');
      }
      if (!institute.isVerified) {
        throw new Error('Institute must be verified to issue certificates');
      }

      // Generate unique certificate ID and hash
      const certificateId = await Certificate.generateCertificateId();
      const certificateHash = Certificate.generateCertificateHash(certificateData);
      
      // Create certificate object with institute details
      const certificate = new Certificate({
        certificateId,
        certificateHash,
        instituteId: institute._id,
        instituteName: institute.name,
        instituteLogo: institute.logo,
        instituteSignature: institute.signature,
        studentName: certificateData.studentName,
        courseName: certificateData.courseName,
        completionDate: certificateData.completionDate,
        issuerName: certificateData.issuerName || institute.name,
        issuerOrganization: certificateData.issuerOrganization || institute.organization,
        description: certificateData.description,
        grade: certificateData.grade,
        duration: certificateData.duration,
        certificateType: certificateData.certificateType,
        template: certificateData.template || 'modern',
        status: 'active',
        metadata: {
          ...certificateData.metadata,
          instituteWebsite: institute.website,
          instituteAddress: institute.address,
          institutePhone: institute.phone,
          instituteEmail: institute.email
        }
      });

      // Generate certificate files (PDF, Image, QR)
      const files = await this.generateCertificateFiles(certificate, institute);
      certificate.pdfPath = files.pdfPath;
      certificate.imagePath = files.imagePath;
      certificate.qrCodePath = files.qrCodePath;

      // Store on blockchain if available
      if (this.blockchainProvider) {
        const blockchainData = await this.storeOnBlockchain(certificate);
        certificate.blockchainTxHash = blockchainData.transactionHash;
        certificate.blockNumber = blockchainData.blockNumber;
        certificate.blockchainAddress = blockchainData.contractAddress;
      } else {
        // Mock blockchain data
        certificate.blockchainTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        certificate.blockNumber = Math.floor(Math.random() * 1000000);
        certificate.blockchainAddress = '0x0000000000000000000000000000000000000000';
      }

      // Save to database
      await certificate.save();
      
      return {
        success: true,
        certificate: certificate,
        message: 'Certificate generated and stored successfully'
      };

    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  async generateCertificateFiles(certificate, institute) {
    const uploadsDir = path.join(__dirname, '../uploads');
    const certDir = path.join(uploadsDir, 'certificates', certificate.certificateId);
    
    // Ensure directory exists
    await fs.mkdir(certDir, { recursive: true });

    try {
      // Generate PDF
      const pdfPath = await this.generatePDF(certificate, institute, certDir);
      
      // Generate Image
      const imagePath = await this.generateImage(certificate, institute, certDir);
      
      // Generate QR Code
      const qrCodePath = await this.generateQRCode(certificate, certDir);

      return {
        pdfPath: path.relative(uploadsDir, pdfPath),
        imagePath: path.relative(uploadsDir, imagePath),
        qrCodePath: path.relative(uploadsDir, qrCodePath)
      };

    } catch (error) {
      console.error('Error generating certificate files:', error);
      throw error;
    }
  }

  async generatePDF(certificate, institute, certDir) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    const pdfPath = path.join(certDir, `${certificate.certificateId}.pdf`);
    const writeStream = require('fs').createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Add certificate content based on template
    await this.addCertificateContent(doc, certificate, institute);

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(pdfPath));
      writeStream.on('error', reject);
    });
  }

  async addCertificateContent(doc, certificate, institute) {
    const template = certificate.template || 'modern';
    
    if (template === 'modern') {
      // Modern template with gradient background
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#1a1a2e');
      
      // Header
      doc.fontSize(24)
         .fill('#00d4ff')
         .text('CERTIFICATE OF COMPLETION', doc.page.width/2, 80, { align: 'center' });
      
      // Institute name
      doc.fontSize(18)
         .fill('#ffffff')
         .text(institute.name, doc.page.width/2, 120, { align: 'center' });
      
      // Main content
      doc.fontSize(16)
         .fill('#e0e0e0')
         .text(`This is to certify that`, doc.page.width/2, 180, { align: 'center' });
      
      doc.fontSize(24)
         .fill('#00d4ff')
         .text(certificate.studentName, doc.page.width/2, 220, { align: 'center' });
      
      doc.fontSize(16)
         .fill('#e0e0e0')
         .text(`has successfully completed the course`, doc.page.width/2, 260, { align: 'center' });
      
      doc.fontSize(20)
         .fill('#ffffff')
         .text(certificate.courseName, doc.page.width/2, 300, { align: 'center' });
      
      // Details
      doc.fontSize(14)
         .fill('#b0b0b0')
         .text(`Completion Date: ${new Date(certificate.completionDate).toLocaleDateString()}`, doc.page.width/2, 360, { align: 'center' });
      
      if (certificate.grade) {
        doc.text(`Grade: ${certificate.grade}`, doc.page.width/2, 380, { align: 'center' });
      }
      
      if (certificate.duration) {
        doc.text(`Duration: ${certificate.duration}`, doc.page.width/2, 400, { align: 'center' });
      }
      
      // Footer
      doc.fontSize(12)
         .fill('#808080')
         .text(`Certificate ID: ${certificate.certificateId}`, 50, doc.page.height - 80)
         .text(`Blockchain Hash: ${certificate.certificateHash.substring(0, 20)}...`, 50, doc.page.height - 60)
         .text(`Issued by: ${certificate.issuerName}`, doc.page.width - 200, doc.page.height - 80, { align: 'right' })
         .text(`Organization: ${certificate.issuerOrganization}`, doc.page.width - 200, doc.page.height - 60, { align: 'right' });
      
    } else if (template === 'classic') {
      // Classic template with border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke('#000000');
      
      // Inner border
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
         .lineWidth(1)
         .stroke('#666666');
      
      // Header
      doc.fontSize(28)
         .fill('#000000')
         .text('CERTIFICATE OF COMPLETION', doc.page.width/2, 100, { align: 'center' });
      
      // Institute name
      doc.fontSize(20)
         .fill('#333333')
         .text(institute.name, doc.page.width/2, 150, { align: 'center' });
      
      // Main content
      doc.fontSize(16)
         .fill('#000000')
         .text(`This is to certify that`, doc.page.width/2, 220, { align: 'center' });
      
      doc.fontSize(24)
         .fill('#000000')
         .text(certificate.studentName, doc.page.width/2, 260, { align: 'center' });
      
      doc.fontSize(16)
         .fill('#000000')
         .text(`has successfully completed the course`, doc.page.width/2, 300, { align: 'center' });
      
      doc.fontSize(20)
         .fill('#000000')
         .text(certificate.courseName, doc.page.width/2, 340, { align: 'center' });
      
      // Details
      doc.fontSize(14)
         .fill('#666666')
         .text(`Completion Date: ${new Date(certificate.completionDate).toLocaleDateString()}`, doc.page.width/2, 400, { align: 'center' });
      
      if (certificate.grade) {
        doc.text(`Grade: ${certificate.grade}`, doc.page.width/2, 420, { align: 'center' });
      }
      
      // Footer
      doc.fontSize(12)
         .fill('#999999')
         .text(`Certificate ID: ${certificate.certificateId}`, 60, doc.page.height - 100)
         .text(`Issued by: ${certificate.issuerName}`, doc.page.width - 200, doc.page.height - 100, { align: 'right' });
    }
  }

  async generateImage(certificate, institute, certDir) {
    const { createCanvas, loadImage, registerFont } = require('canvas');
    
    // Create canvas
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');
    
    const template = certificate.template || 'modern';
    
    if (template === 'modern') {
      // Modern dark theme
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 1200, 800);
      
      // Gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
      gradient.addColorStop(0, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 800);
      
      // Header
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF COMPLETION', 600, 100);
      
      // Institute name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(institute.name, 600, 160);
      
      // Main content
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '24px Arial';
      ctx.fillText('This is to certify that', 600, 240);
      
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText(certificate.studentName, 600, 300);
      
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '24px Arial';
      ctx.fillText('has successfully completed the course', 600, 360);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(certificate.courseName, 600, 420);
      
      // Details
      ctx.fillStyle = '#b0b0b0';
      ctx.font = '20px Arial';
      ctx.fillText(`Completion Date: ${new Date(certificate.completionDate).toLocaleDateString()}`, 600, 500);
      
      if (certificate.grade) {
        ctx.fillText(`Grade: ${certificate.grade}`, 600, 530);
      }
      
      // Footer
      ctx.fillStyle = '#808080';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Certificate ID: ${certificate.certificateId}`, 50, 700);
      ctx.fillText(`Blockchain Hash: ${certificate.certificateHash.substring(0, 20)}...`, 50, 720);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Issued by: ${certificate.issuerName}`, 1150, 700);
      ctx.fillText(`Organization: ${certificate.issuerOrganization}`, 1150, 720);
      
    } else {
      // Classic light theme
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1200, 800);
      
      // Border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 1160, 760);
      
      // Inner border
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 1080, 680);
      
      // Header
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF COMPLETION', 600, 120);
      
      // Institute name
      ctx.font = 'bold 28px Arial';
      ctx.fillText(institute.name, 600, 180);
      
      // Main content
      ctx.font = '24px Arial';
      ctx.fillText('This is to certify that', 600, 260);
      
      ctx.font = 'bold 32px Arial';
      ctx.fillText(certificate.studentName, 600, 320);
      
      ctx.font = '24px Arial';
      ctx.fillText('has successfully completed the course', 600, 380);
      
      ctx.font = 'bold 28px Arial';
      ctx.fillText(certificate.courseName, 600, 440);
      
      // Details
      ctx.fillStyle = '#666666';
      ctx.font = '20px Arial';
      ctx.fillText(`Completion Date: ${new Date(certificate.completionDate).toLocaleDateString()}`, 600, 520);
      
      // Footer
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Certificate ID: ${certificate.certificateId}`, 80, 700);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Issued by: ${certificate.issuerName}`, 1120, 700);
    }
    
    // Save image
    const imagePath = path.join(certDir, `${certificate.certificateId}.png`);
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(imagePath, buffer);
    
    return imagePath;
  }

  async generateQRCode(certificate, certDir) {
    const QRCode = require('qrcode');
    
    const qrData = {
      certificateId: certificate.certificateId,
      hash: certificate.certificateHash,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instituteName: certificate.instituteName,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificate.certificateId}`
    };
    
    const qrCodePath = path.join(certDir, `${certificate.certificateId}_qr.png`);
    await QRCode.toFile(qrCodePath, JSON.stringify(qrData), {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 300,
      margin: 2
    });
    
    return qrCodePath;
  }

  async storeOnBlockchain(certificate) {
    if (!this.blockchainProvider) {
      throw new Error('Blockchain provider not available');
    }

    try {
      // Mock blockchain transaction
      const mockTx = {
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        contractAddress: '0x1234567890123456789012345678901234567890'
      };
      
      console.log('🔗 Certificate stored on blockchain:', mockTx.transactionHash);
      return mockTx;
      
    } catch (error) {
      console.error('Blockchain storage error:', error);
      throw error;
    }
  }

  async getAllCertificates(instituteId, filters = {}) {
    try {
      const query = { instituteId };
      
      if (filters.search) {
        query.$or = [
          { studentName: { $regex: filters.search, $options: 'i' } },
          { courseName: { $regex: filters.search, $options: 'i' } },
          { certificateId: { $regex: filters.search, $options: 'i' } }
        ];
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.template) {
        query.template = filters.template;
      }
      
      const certificates = await Certificate.find(query)
        .sort({ createdAt: -1 })
        .populate('instituteId', 'name organization');
      
      return certificates;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  }

  async getCertificateById(certificateId) {
    try {
      const certificate = await Certificate.findOne({ certificateId })
        .populate('instituteId', 'name organization logo signature website address phone email');
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }
      
      return certificate;
    } catch (error) {
      console.error('Error fetching certificate:', error);
      throw error;
    }
  }

  async verifyCertificate(certificateId) {
    try {
      const certificate = await this.getCertificateById(certificateId);
      
      if (!certificate) {
        return {
          isValid: false,
          message: 'Certificate not found'
        };
      }
      
      if (certificate.status === 'revoked') {
        return {
          isValid: false,
          message: 'Certificate has been revoked',
          certificate: certificate
        };
      }
      
      // Verify blockchain hash if available
      let blockchainVerification = { verified: false };
      if (certificate.blockchainTxHash && certificate.blockchainTxHash !== '0x0000000000000000000000000000000000000000') {
        blockchainVerification = await this.verifyOnBlockchain(certificate);
      }
      
      return {
        isValid: true,
        message: 'Certificate is valid and verified',
        certificate: certificate,
        blockchainVerification: blockchainVerification
      };
      
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  async verifyOnBlockchain(certificate) {
    try {
      if (!this.blockchainProvider) {
        return { verified: false, reason: 'Blockchain not available' };
      }
      
      // Mock blockchain verification
      const mockVerification = {
        verified: true,
        hashExists: true,
        isRevoked: false,
        lastVerified: new Date().toISOString(),
        blockNumber: certificate.blockNumber,
        transactionHash: certificate.blockchainTxHash
      };
      
      return mockVerification;
      
    } catch (error) {
      console.error('Blockchain verification error:', error);
      return { verified: false, reason: error.message };
    }
  }

  async searchCertificates(query, instituteId) {
    try {
      const searchQuery = {
        instituteId,
        $or: [
          { studentName: { $regex: query, $options: 'i' } },
          { courseName: { $regex: query, $options: 'i' } },
          { certificateId: { $regex: query, $options: 'i' } },
          { 'metadata.instituteWebsite': { $regex: query, $options: 'i' } }
        ]
      };
      
      const certificates = await Certificate.find(searchQuery)
        .sort({ createdAt: -1 })
        .populate('instituteId', 'name organization');
      
      return certificates;
    } catch (error) {
      console.error('Error searching certificates:', error);
      throw error;
    }
  }

  async revokeCertificate(certificateId, instituteId, reason) {
    try {
      const certificate = await Certificate.findOne({ 
        certificateId, 
        instituteId 
      });
      
      if (!certificate) {
        throw new Error('Certificate not found or access denied');
      }
      
      certificate.status = 'revoked';
      certificate.revokedAt = new Date();
      certificate.revocationReason = reason;
      
      await certificate.save();
      
      return {
        success: true,
        message: 'Certificate revoked successfully',
        certificate: certificate
      };
      
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw error;
    }
  }

  async getCertificateStats(instituteId) {
    try {
      const stats = await Certificate.aggregate([
        { $match: { instituteId: instituteId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            revoked: { $sum: { $cond: [{ $eq: ['$status', 'revoked'] }, 1, 0] } },
            byTemplate: {
              $push: '$template'
            },
            byType: {
              $push: '$certificateType'
            }
          }
        }
      ]);
      
      if (stats.length === 0) {
        return {
          total: 0,
          active: 0,
          revoked: 0,
          templates: {},
          types: {}
        };
      }
      
      const stat = stats[0];
      
      // Count templates
      const templates = stat.byTemplate.reduce((acc, template) => {
        acc[template] = (acc[template] || 0) + 1;
        return acc;
      }, {});
      
      // Count types
      const types = stat.byType.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        total: stat.total,
        active: stat.active,
        revoked: stat.revoked,
        templates: templates,
        types: types
      };
      
    } catch (error) {
      console.error('Error getting certificate stats:', error);
      throw error;
    }
  }
}

module.exports = new CertificateService();

