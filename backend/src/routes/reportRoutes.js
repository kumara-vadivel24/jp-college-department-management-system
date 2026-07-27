const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', authenticateToken, authorizeRoles('hod', 'faculty'), reportController.getAnalytics);

module.exports = router;
