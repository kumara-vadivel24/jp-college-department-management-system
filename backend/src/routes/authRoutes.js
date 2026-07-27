const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/reset-password/:id', authenticateToken, authorizeRoles('hod'), authController.resetPassword);
router.post('/create-user', authenticateToken, authorizeRoles('hod'), authController.createUser);

module.exports = router;
