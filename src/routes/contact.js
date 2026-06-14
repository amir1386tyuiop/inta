const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public - submit contact form
router.post('/', [
  body('fullName').notEmpty().withMessage('نام کامل الزامی است'),
  body('email').isEmail().withMessage('ایمیل معتبر وارد کنید'),
  body('subject').notEmpty().withMessage('موضوع الزامی است'),
  body('message').notEmpty().withMessage('پیام الزامی است'),
], contactController.submit);

// Admin - list messages
router.get('/', authenticate, authorize('admin'), contactController.list);

// Admin - reply
router.post('/:id/reply', authenticate, authorize('admin'), [
  body('reply').notEmpty().withMessage('پاسخ الزامی است'),
], contactController.reply);

module.exports = router;
