const express = require('express');
const noticeController = require('../controllers/noticeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, noticeController.getNotices);
router.post('/', authenticateToken, authorizeRoles('hod', 'faculty'), noticeController.createNotice);
router.delete('/:id', authenticateToken, authorizeRoles('hod'), noticeController.deleteNotice);

module.exports = router;
