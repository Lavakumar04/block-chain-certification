const crypto = require('crypto');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// const Certificate = require('../models/Certificate'); // Commented out for mock mode
const blockchainService = require('./blockchainService');

class CertificateService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadsDirectory();
    this.mockCertificates = new Map(); // In-memory storage for mock mode
    this.isMockMode = true;
  }

  ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  generateCertificateHash(certificateData) {
    const dataString = JSON.stringify({
      studentName: certificateData.studentName,
      courseName: certificateData.courseName,
      completionDate: certificateData.completionDate,
      issuerName: certificateData.issuerName,
      issuerOrganization: certificateData.issuerOrganization,
      timestamp: new Date().toISOString()
    });

    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  async generatePDF(certificateData, certificateId) {
    return new Promise((resolve, reject) => {
      try {
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

        const filename = `certificate_${certificateId}.pdf`;
        const filepath = path.join(this.uploadsDir, filename);
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Add background
        doc.rect(0, 0, doc.page.width, doc.page.height)
           .fill('#f8f9fa');

        // Add border
        doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
           .stroke('#dee2e6')
           .lineWidth(3);

        // Add inner border
        doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
           .stroke('#6c757d')
           .lineWidth(1);

        // Header
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fill('#495057')
           .text('CERTIFICATE OF COMPLETION', 0, 80, {
             align: 'center',
             width: doc.page.width
           });

        // Subtitle
        doc.fontSize(16)
           .font('Helvetica')
           .fill('#6c757d')
           .text('This is to certify that', 0, 130, {
             align: 'center',
             width: doc.page.width
           });

        // Student name
        doc.fontSize(32)
           .font('Helvetica-Bold')
           .fill('#212529')
           .text(certificateData.studentName, 0, 170, {
             align: 'center',
             width: doc.page.width
           });

        // Course completion text
        doc.fontSize(18)
           .font('Helvetica')
           .fill('#495057')
           .text('has successfully completed the course', 0, 220, {
             align: 'center',
             width: doc.page.width
           });

        // Course name
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fill('#212529')
           .text(certificateData.courseName, 0, 270, {
             align: 'center',
             width: doc.page.width
           });

        // Completion date
        doc.fontSize(16)
           .font('Helvetica')
           .fill('#6c757d')
           .text('on', 0, 320, {
             align: 'center',
             width: doc.page.width
           });

        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fill('#495057')
           .text(new Date(certificateData.completionDate).toLocaleDateString('en-US', {
             year: 'numeric',
             month: 'long',
             day: 'numeric'
           }), 0, 350, {
             align: 'center',
             width: doc.page.width
           });

        // Issuer information
        doc.fontSize(14)
           .font('Helvetica')
           .fill('#6c757d')
           .text('Issued by:', 0, 420, {
             align: 'center',
             width: doc.page.width
           });

        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fill('#495057')
           .text(certificateData.issuerName, 0, 450, {
             align: 'center',
             width: doc.page.width
           });

        doc.fontSize(14)
           .font('Helvetica')
           .fill('#6c757d')
           .text(certificateData.issuerOrganization, 0, 480, {
             align: 'center',
             width: doc.page.width
           });

        // Certificate ID
        doc.fontSize(12)
           .font('Helvetica')
           .fill('#6c757d')
           .text(`Certificate ID: ${certificateId}`, 0, 520, {
             align: 'center',
             width: doc.page.width
           });

        // Footer
        doc.fontSize(10)
           .font('Helvetica')
           .fill('#6c757d')
           .text('This certificate is digitally signed and verified on the blockchain', 0, 580, {
             align: 'center',
             width: doc.page.width
           });

        doc.end();

        stream.on('finish', () => {
          resolve(`/uploads/${filename}`);
        });

        stream.on('error', reject);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateQRCode(verificationUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  async createCertificate(certificateData) {
    try {
      // Generate certificate ID
      const certificateId = uuidv4();
      
      // Generate certificate hash
      const certificateHash = this.generateCertificateHash(certificateData);
      
      // Generate verification URL
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certificateId}`;
      
      // Generate PDF
      const pdfUrl = await this.generatePDF(certificateData, certificateId);
      
      // Generate QR code
      const qrCodeUrl = await this.generateQRCode(verificationUrl);
      
      // Register on blockchain (mock)
      const blockchainResult = await blockchainService.registerCertificate(certificateHash, JSON.stringify(certificateData));
      
      // Create certificate object
      const certificate = {
        certificateId,
        studentName: certificateData.studentName,
        courseName: certificateData.courseName,
        completionDate: new Date(certificateData.completionDate),
        issuerName: certificateData.issuerName,
        issuerOrganization: certificateData.issuerOrganization,
        certificateHash,
        blockchainHash: blockchainResult.transactionHash,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        status: 'active',
        metadata: certificateData,
        pdfUrl,
        qrCodeUrl,
        verificationUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in mock storage
      this.mockCertificates.set(certificateId, certificate);
      
      console.log('Certificate created successfully:', certificateId);
      
      return {
        certificate,
        pdfUrl,
        qrCodeUrl,
        verificationUrl,
        blockchainResult
      };
      
    } catch (error) {
      console.error('Failed to create certificate:', error);
      throw error;
    }
  }

  async getCertificate(certificateId) {
    try {
      if (this.isMockMode) {
        const certificate = this.mockCertificates.get(certificateId);
        if (!certificate) {
          throw new Error('Certificate not found');
        }
        return certificate;
      }

      // Real database implementation would go here
      // const certificate = await Certificate.findOne({ certificateId });
      // if (!certificate) {
      //   throw new Error('Certificate not found');
      // }
      // return certificate;
      
    } catch (error) {
      console.error('Failed to get certificate:', error);
      throw error;
    }
  }

  async verifyCertificate(certificateId) {
    try {
      // Get certificate
      const certificate = await this.getCertificate(certificateId);
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // Verify on blockchain
      const blockchainResult = await blockchainService.verifyCertificate(certificate.certificateHash);
      
      // Check if certificate exists in database
      const databaseResult = {
        exists: true,
        status: certificate.status,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate
      };
      
      return {
        certificateId,
        certificateHash: certificate.certificateHash,
        blockchainVerification: blockchainResult,
        databaseResult,
        overallValid: blockchainResult.isValid && databaseResult.status === 'active',
        verificationUrl: certificate.verificationUrl
      };
      
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      throw error;
    }
  }

  async getAllCertificates() {
    try {
      if (this.isMockMode) {
        return Array.from(this.mockCertificates.values());
      }

      // Real database implementation would go here
      // return await Certificate.find().sort({ createdAt: -1 });
      
    } catch (error) {
      console.error('Failed to get all certificates:', error);
      throw error;
    }
  }

  async searchCertificates(query) {
    try {
      if (this.isMockMode) {
        const certificates = Array.from(this.mockCertificates.values());
        
        return certificates.filter(cert => {
          if (query.studentName && !cert.studentName.toLowerCase().includes(query.studentName.toLowerCase())) {
            return false;
          }
          if (query.courseName && !cert.courseName.toLowerCase().includes(query.courseName.toLowerCase())) {
            return false;
          }
          if (query.issuerName && !cert.issuerName.toLowerCase().includes(query.issuerName.toLowerCase())) {
            return false;
          }
          return true;
        });
      }

      // Real database implementation would go here
      // const searchQuery = {};
      // if (query.studentName) searchQuery.studentName = { $regex: query.studentName, $options: 'i' };
      // if (query.courseName) searchQuery.courseName = { $regex: query.courseName, $options: 'i' };
      // if (query.issuerName) searchQuery.issuerName = { $regex: query.issuerName, $options: 'i' };
      // return await Certificate.find(searchQuery).sort({ createdAt: -1 });
      
    } catch (error) {
      console.error('Failed to search certificates:', error);
      throw error;
    }
  }

  async getCertificateByHash(hash) {
    try {
      if (this.isMockMode) {
        const certificates = Array.from(this.mockCertificates.values());
        return certificates.find(cert => cert.certificateHash === hash);
      }

      // Real database implementation would go here
      // return await Certificate.findOne({ certificateHash: hash });
      
    } catch (error) {
      console.error('Failed to get certificate by hash:', error);
      throw error;
    }
  }

  async revokeCertificate(certificateId) {
    try {
      if (this.isMockMode) {
        const certificate = this.mockCertificates.get(certificateId);
        if (!certificate) {
          throw new Error('Certificate not found');
        }
        
        certificate.status = 'revoked';
        certificate.updatedAt = new Date();
        this.mockCertificates.set(certificateId, certificate);
        
        return certificate;
      }

      // Real database implementation would go here
      // const certificate = await Certificate.findOne({ certificateId });
      // if (!certificate) {
      //   throw new Error('Certificate not found');
      // }
      // return await certificate.revoke();
      
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      throw error;
    }
  }
}

module.exports = new CertificateService();

