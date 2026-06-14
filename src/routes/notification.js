const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user's notifications
router.get('/', authenticate, notificationController.list);

// Get unread count
router.get('/unread-count', authenticate, notificationController.unreadCount);

// Get notification with full case details
router.get('/:id', authenticate, notificationController.getById);

// Mark as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

module.exports = router;
