const express = require('express');
const { body } = require('express-validator');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Chat with AI
router.post('/chat', authenticate, aiRateLimiter, [
  body('message').notEmpty().withMessage('پیام الزامی است'),
  body('sessionId').optional().isString(),
], aiController.chat);

// Get chat sessions
router.get('/sessions', authenticate, aiController.getSessions);

// Get chat session messages
router.get('/sessions/:sessionId', authenticate, aiController.getSessionMessages);

// Search site data using AI
router.post('/search', authenticate, aiRateLimiter, [
  body('query').notEmpty().withMessage('عبارت جستجو الزامی است'),
], aiController.searchWithAI);

module.exports = router;
