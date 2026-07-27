const express = require('express');
const timetableController = require('../controllers/timetableController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, timetableController.getTimetable);
router.post('/check-conflicts', authenticateToken, authorizeRoles('superadmin', 'hod'), timetableController.checkConflicts);
router.post('/batch-save', authenticateToken, authorizeRoles('superadmin', 'hod'), timetableController.batchSaveTimetable);
router.post('/copy', authenticateToken, authorizeRoles('superadmin', 'hod'), timetableController.copyTimetable);
router.delete('/', authenticateToken, authorizeRoles('superadmin', 'hod'), timetableController.clearTimetable);

module.exports = router;
