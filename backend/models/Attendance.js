const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Family member name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Family member age is required'],
    min: [0, 'Age cannot be negative']
  },
  isChild: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  emergencyContact: {
    type: String,
    trim: true
  }
});

const attendanceSchema = new mongoose.Schema({
  qrCodeData: {
    type: {
      type: String,
      required: true,
      enum: ['attendance'],
      default: 'attendance'
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    familyMembers: [familyMemberSchema]
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
attendanceSchema.index({ 'qrCodeData.date': 1, scannedAt: -1 });
attendanceSchema.index({ scannedBy: 1, scannedAt: -1 });
attendanceSchema.index({ status: 1 });

// Virtual for total family members
attendanceSchema.virtual('totalMembers').get(function() {
  return this.qrCodeData.familyMembers.length;
});

// Virtual for adults count
attendanceSchema.virtual('adultsCount').get(function() {
  return this.qrCodeData.familyMembers.filter(member => !member.isChild).length;
});

// Virtual for children count
attendanceSchema.virtual('childrenCount').get(function() {
  return this.qrCodeData.familyMembers.filter(member => member.isChild).length;
});

// Ensure virtual fields are serialized
attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate data
attendanceSchema.pre('save', function(next) {
  if (this.qrCodeData.familyMembers.length === 0) {
    return next(new Error('At least one family member is required'));
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema); 