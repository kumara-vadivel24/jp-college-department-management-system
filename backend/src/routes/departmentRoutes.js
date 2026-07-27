const express = require('express');
const departmentController = require('../controllers/departmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', departmentController.getDepartment);
router.get('/all', authenticateToken, authorizeRoles('superadmin', 'hod'), departmentController.getAllDepartments);
router.post('/', authenticateToken, authorizeRoles('superadmin'), departmentController.createDepartment);
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'hod'), departmentController.updateDepartment);
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), departmentController.deleteDepartment);

router.post('/transfer-faculty', authenticateToken, authorizeRoles('superadmin'), departmentController.transferFaculty);
router.post('/transfer-student', authenticateToken, authorizeRoles('superadmin'), departmentController.transferStudent);
router.get('/backup', authenticateToken, authorizeRoles('superadmin'), departmentController.backupDatabase);

module.exports = router;
