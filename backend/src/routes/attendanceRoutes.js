const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', authenticateToken, attendanceController.getSummary);
router.post('/mark', authenticateToken, authorizeRoles('hod', 'faculty'), attendanceController.markAttendance);
router.get('/student/:studentId', authenticateToken, attendanceController.getStudentAttendance);

module.exports = router;
