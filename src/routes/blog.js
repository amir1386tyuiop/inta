const express = require('express');
const { body } = require('express-validator');
const blogController = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', blogController.list);
router.get('/:slug', blogController.getBySlug);

// Admin only
router.post('/', authenticate, authorize('admin'), [
  body('title').notEmpty().withMessage('عنوان الزامی است'),
  body('content').notEmpty().withMessage('محتوا الزامی است'),
  body('category').optional().isString(),
], blogController.create);

router.put('/:id', authenticate, authorize('admin'), blogController.update);
router.delete('/:id', authenticate, authorize('admin'), blogController.remove);

module.exports = router;
