const express = require('express');
const facultyController = require('../controllers/facultyController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authenticateToken, facultyController.getMyProfile);
router.put('/me', authenticateToken, facultyController.updateMyProfile);
router.get('/', authenticateToken, facultyController.getFaculty);
router.post('/', authenticateToken, authorizeRoles('hod', 'superadmin'), facultyController.createFaculty);
router.delete('/:id', authenticateToken, authorizeRoles('hod', 'superadmin'), facultyController.deleteFaculty);

module.exports = router;
