const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get family members for current user
// @route   GET /api/family
// @access  Private
router.get('/', auth, async (req, res, next) => {
  try {
    // For now, we'll return a simple response
    // In a real implementation, you might have a separate Family model
    res.json({
      success: true,
      message: 'Family members endpoint - to be implemented with proper family model',
      data: {
        familyMembers: []
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Add family member
// @route   POST /api/family
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('age').isInt({ min: 0 }).withMessage('Valid age is required'),
  body('isChild').isBoolean().withMessage('isChild must be a boolean'),
  body('phone').optional().isMobilePhone().withMessage('Please include a valid phone number'),
  body('address').optional().trim(),
  body('emergencyContact').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, age, isChild, phone, address, emergencyContact } = req.body;

    // For now, we'll return a success response
    // In a real implementation, you would save to a Family model
    const familyMember = {
      id: Date.now().toString(),
      name,
      age: parseInt(age),
      isChild,
      phone,
      address,
      emergencyContact,
      userId: req.user.id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Family member added successfully',
      data: {
        familyMember
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Update family member
// @route   PUT /api/family/:id
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('age').optional().isInt({ min: 0 }).withMessage('Valid age is required'),
  body('isChild').optional().isBoolean().withMessage('isChild must be a boolean'),
  body('phone').optional().isMobilePhone().withMessage('Please include a valid phone number'),
  body('address').optional().trim(),
  body('emergencyContact').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // For now, we'll return a success response
    // In a real implementation, you would update the Family model
    res.json({
      success: true,
      message: 'Family member updated successfully',
      data: {
        familyMember: {
          id,
          ...updateData,
          updatedAt: new Date()
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Delete family member
// @route   DELETE /api/family/:id
// @access  Private
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // For now, we'll return a success response
    // In a real implementation, you would delete from the Family model
    res.json({
      success: true,
      message: 'Family member deleted successfully',
      data: {
        deletedId: id
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router; 