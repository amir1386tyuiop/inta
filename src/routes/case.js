const express = require('express');
const { body } = require('express-validator');
const caseController = require('../controllers/caseController');
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// List user's cases
router.get('/', authenticate, caseController.list);

// Get single case with full details
router.get('/:id', authenticate, caseController.getById);

// Create case
router.post('/', authenticate, [
  body('title').notEmpty().withMessage('عنوان پرونده الزامی است'),
  body('description').notEmpty().withMessage('شرح پرونده الزامی است'),
  body('caseType').notEmpty().withMessage('نوع پرونده الزامی است'),
], caseController.create);

// Update case
router.put('/:id', authenticate, caseController.update);

// AI: Analyze case
router.post('/:id/analyze', authenticate, aiRateLimiter, caseController.analyze);

// AI: Summarize case
router.post('/:id/summarize', authenticate, aiRateLimiter, caseController.summarize);

// Assign lawyer to case
router.patch('/:id/assign-lawyer', authenticate, [
  body('lawyerId').notEmpty().withMessage('شناسه وکیل الزامی است'),
], caseController.assignLawyer);

module.exports = router;
