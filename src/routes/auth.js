const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('ایمیل معتبر وارد کنید'),
  body('password').isLength({ min: 6 }).withMessage('رمز عبور حداقل ۶ کاراکتر'),
  body('fullName').notEmpty().withMessage('نام کامل الزامی است'),
  body('role').optional().isIn(['client', 'lawyer']).withMessage('نقش نامعتبر'),
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('ایمیل معتبر وارد کنید'),
  body('password').notEmpty().withMessage('رمز عبور الزامی است'),
], authController.login);

router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);

module.exports = router;
