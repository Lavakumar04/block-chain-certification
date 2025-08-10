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
  certificateHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  blockchainHash: {
    type: String,
    required: true,
    unique: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  pdfUrl: {
    type: String,
    default: null
  },
  qrCodeUrl: {
    type: String,
    default: null
  },
  verificationUrl: {
    type: String,
    required: true
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
certificateSchema.index({ certificateId: 1, status: 1 });
certificateSchema.index({ certificateHash: 1, status: 1 });
certificateSchema.index({ studentName: 1, courseName: 1 });
certificateSchema.index({ completionDate: 1 });

// Virtual for formatted completion date
certificateSchema.virtual('formattedCompletionDate').get(function() {
  return this.completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for certificate age
certificateSchema.virtual('age').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.completionDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to update updatedAt
certificateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find active certificates
certificateSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find by student name
certificateSchema.statics.findByStudent = function(studentName) {
  return this.find({ 
    studentName: { $regex: studentName, $options: 'i' },
    status: 'active'
  });
};

// Static method to find by course
certificateSchema.statics.findByCourse = function(courseName) {
  return this.find({ 
    courseName: { $regex: courseName, $options: 'i' },
    status: 'active'
  });
};

// Instance method to revoke certificate
certificateSchema.methods.revoke = function() {
  this.status = 'revoked';
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to check if valid
certificateSchema.methods.isValid = function() {
  return this.status === 'active';
};

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;






