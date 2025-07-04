const express = require('express');
const { body, validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @desc    Log attendance from QR code scan
// @route   POST /api/attendance/scan
// @access  Private (Staff/Admin)
router.post('/scan', [
  auth,
  body('qrCodeData').isObject().withMessage('QR code data is required'),
  body('qrCodeData.type').equals('attendance').withMessage('Invalid QR code type'),
  body('qrCodeData.date').notEmpty().withMessage('Date is required'),
  body('qrCodeData.time').notEmpty().withMessage('Time is required'),
  body('qrCodeData.familyMembers').isArray({ min: 1 }).withMessage('At least one family member is required'),
  body('qrCodeData.familyMembers.*.name').notEmpty().withMessage('Family member name is required'),
  body('qrCodeData.familyMembers.*.age').isInt({ min: 0 }).withMessage('Valid age is required'),
], async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { qrCodeData, location, notes } = req.body;
    const userId = req.user.id;

    // Get device info
    const deviceInfo = {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    // Create attendance record
    const attendance = await Attendance.create({
      qrCodeData,
      scannedBy: userId,
      location,
      deviceInfo,
      notes
    });

    // Populate scanner info
    await attendance.populate('scannedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Attendance logged successfully',
      data: {
        attendance,
        summary: {
          totalMembers: attendance.totalMembers,
          adultsCount: attendance.adultsCount,
          childrenCount: attendance.childrenCount,
          scannedAt: attendance.scannedAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Staff/Admin)
router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, date, status } = req.query;
    
    // Build filter
    const filter = {};
    if (date) filter['qrCodeData.date'] = date;
    if (status) filter.status = status;

    const attendances = await Attendance.find(filter)
      .populate('scannedBy', 'name email role')
      .sort({ scannedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      data: {
        attendances,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private (Staff/Admin)
router.get('/stats', auth, async (req, res, next) => {
  try {
    const { date } = req.query;
    
    const filter = {};
    if (date) filter['qrCodeData.date'] = date;

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalScans: { $sum: 1 },
          totalMembers: { $sum: { $size: '$qrCodeData.familyMembers' } },
          totalAdults: {
            $sum: {
              $size: {
                $filter: {
                  input: '$qrCodeData.familyMembers',
                  cond: { $eq: ['$$this.isChild', false] }
                }
              }
            }
          },
          totalChildren: {
            $sum: {
              $size: {
                $filter: {
                  input: '$qrCodeData.familyMembers',
                  cond: { $eq: ['$$this.isChild', true] }
                }
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalScans: 0,
      totalMembers: 0,
      totalAdults: 0,
      totalChildren: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private (Staff/Admin)
router.get('/:id', auth, async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('scannedBy', 'name email role');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Update attendance status
// @route   PUT /api/attendance/:id/status
// @access  Private (Admin)
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'confirmed', 'rejected']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    ).populate('scannedBy', 'name email role');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance status updated successfully',
      data: attendance
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 