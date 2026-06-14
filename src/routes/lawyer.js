const express = require('express');
const { body } = require('express-validator');
const lawyerController = require('../controllers/lawyerController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public - search lawyers
router.get('/', lawyerController.search);
router.get('/:id', lawyerController.getById);

// Lawyer - create/update own profile
router.post('/profile', authenticate, authorize('lawyer'), [
  body('licenseNumber').notEmpty().withMessage('شماره پروانه الزامی است'),
  body('specializations').notEmpty().withMessage('تخصص‌ها الزامی است'),
  body('city').notEmpty().withMessage('شهر الزامی است'),
  body('province').notEmpty().withMessage('استان الزامی است'),
], lawyerController.createProfile);

router.put('/profile', authenticate, authorize('lawyer'), lawyerController.updateProfile);

// Admin - verify lawyer
router.patch('/:id/verify', authenticate, authorize('admin'), lawyerController.verify);

module.exports = router;
