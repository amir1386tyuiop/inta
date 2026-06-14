const express = require('express');
const { body } = require('express-validator');
const verdictController = require('../controllers/verdictController');
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// List verdicts for a case
router.get('/case/:caseId', authenticate, verdictController.listByCase);

// Get single verdict
router.get('/:id', authenticate, verdictController.getById);

// Create verdict
router.post('/', authenticate, [
  body('caseId').notEmpty().withMessage('شناسه پرونده الزامی است'),
  body('verdictText').notEmpty().withMessage('متن حکم الزامی است'),
], verdictController.create);

// Update verdict
router.put('/:id', authenticate, verdictController.update);

// AI: Analyze verdict
router.post('/:id/analyze', authenticate, aiRateLimiter, verdictController.analyze);

module.exports = router;
