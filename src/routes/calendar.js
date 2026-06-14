const express = require('express');
const { body } = require('express-validator');
const calendarController = require('../controllers/calendarController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user's calendar events
router.get('/', authenticate, calendarController.list);

// Get today's events
router.get('/today', authenticate, calendarController.today);

// Get events by date range
router.get('/range', authenticate, calendarController.byRange);

// Get single event with full case details
router.get('/:id', authenticate, calendarController.getById);

// Create event
router.post('/', authenticate, [
  body('title').notEmpty().withMessage('عنوان الزامی است'),
  body('eventDate').notEmpty().withMessage('تاریخ الزامی است'),
], calendarController.create);

// Update event
router.put('/:id', authenticate, calendarController.update);

// Delete event
router.delete('/:id', authenticate, calendarController.remove);

module.exports = router;
