const express = require('express');
const subjectController = require('../controllers/subjectController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, subjectController.getSubjects);
router.post('/', authenticateToken, authorizeRoles('superadmin', 'hod'), subjectController.createSubject);
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'hod'), subjectController.updateSubject);
router.put('/:id/toggle-active', authenticateToken, authorizeRoles('superadmin', 'hod'), subjectController.toggleSubjectActive);
router.delete('/:id', authenticateToken, authorizeRoles('superadmin', 'hod'), subjectController.deleteSubject);

module.exports = router;
