const express = require('express');
const markController = require('../controllers/markController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, markController.getInternalMarks);
router.get('/semester', authenticateToken, markController.getSemesterMarks);
router.post('/semester/update', authenticateToken, authorizeRoles('hod', 'faculty'), markController.updateSemesterMarks);
router.post('/update', authenticateToken, authorizeRoles('hod', 'faculty'), markController.updateInternalMarks);
router.get('/export/excel', authenticateToken, authorizeRoles('hod', 'faculty'), markController.exportExcel);
router.get('/courses', authenticateToken, markController.getCourses);

module.exports = router;
