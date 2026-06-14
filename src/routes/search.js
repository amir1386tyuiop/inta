const express = require('express');
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Global search across all site data
router.get('/', authenticate, searchController.globalSearch);

module.exports = router;
