const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('hod', 'faculty'), studentController.getStudents);
router.get('/export/excel', authenticateToken, authorizeRoles('hod', 'faculty'), studentController.exportExcel);
router.post('/delete-bulk', authenticateToken, authorizeRoles('hod', 'faculty'), studentController.deleteBulk);
router.get('/:id', authenticateToken, studentController.getStudentById);
router.post('/', authenticateToken, authorizeRoles('hod'), studentController.createStudent);
router.post('/bulk-import', authenticateToken, authorizeRoles('hod'), studentController.uploadMiddleware, studentController.bulkImport);

module.exports = router;
