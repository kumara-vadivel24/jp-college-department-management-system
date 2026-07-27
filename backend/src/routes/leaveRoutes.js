const express = require('express');
const leaveController = require('../controllers/leaveController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, leaveController.getLeaves);
router.post('/', authenticateToken, leaveController.applyLeave);
router.put('/:id/status', authenticateToken, authorizeRoles('hod', 'faculty'), leaveController.updateLeaveStatus);

module.exports = router;
