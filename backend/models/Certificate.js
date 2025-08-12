const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  completionDate: {
    type: Date,
    required: true
  },
  issuerName: {
    type: String,
    required: true,
    trim: true
  },
  issuerOrganization: {
    type: String,
    required: true,
    trim: true
  },
  instituteId: {
    type: String,
    required: true,
    ref: 'Institute'
  },
  instituteName: {
    type: String,
    required: true
  },
  certificateHash: {
    type: String,
    required: true,
    unique: true
  },
  blockchainTxHash: {
    type: String,
    default: null
  },
  blockchainBlockNumber: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  revocationReason: {
    type: String,
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokedBy: {
    type: String,
    default: null
  },
  template: {
    type: String,
    enum: ['modern', 'classic', 'elegant', 'professional'],
    default: 'modern'
  },
  metadata: {
    grade: String,
    duration: String,
    credits: Number,
    description: String,
    skills: [String],
    achievements: [String]
  },
  files: {
    pdf: String, // URL to PDF file
    image: String, // URL to image file
    qrCode: String // URL to QR code image
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  lastVerified: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique certificate ID
certificateSchema.statics.generateCertificateId = function() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CERT${timestamp}${random}`;
};

// Generate certificate hash
certificateSchema.statics.generateCertificateHash = function(data) {
  const crypto = require('crypto');
  const hashData = `${data.studentName}${data.courseName}${data.completionDate}${data.issuerName}${data.issuerOrganization}`;
  return crypto.createHash('sha256').update(hashData).digest('hex');
};

// Index for efficient queries
certificateSchema.index({ instituteId: 1, createdAt: -1 });
certificateSchema.index({ certificateHash: 1 });
certificateSchema.index({ status: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
