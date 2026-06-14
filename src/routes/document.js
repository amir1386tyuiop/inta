const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Upload document/image for a case
router.post('/upload', authenticate, upload.single('file'), documentController.uploadDocument);

// List documents for a case
router.get('/case/:caseId', authenticate, documentController.listByCase);

// Get single document
router.get('/:id', authenticate, documentController.getById);

// AI: Analyze document image
router.post('/:id/analyze', authenticate, aiRateLimiter, documentController.analyzeDocument);

// Delete document
router.delete('/:id', authenticate, documentController.remove);

module.exports = router;
