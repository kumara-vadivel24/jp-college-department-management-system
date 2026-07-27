const express = require('express');
const mlController = require('../controllers/mlController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/at-risk', authenticateToken, authorizeRoles('hod', 'faculty'), mlController.getAtRisk);
router.get('/metrics', authenticateToken, authorizeRoles('hod'), mlController.getMetrics);
router.post('/predict-all', authenticateToken, authorizeRoles('hod', 'faculty'), mlController.predictAll);
router.post('/retrain', authenticateToken, authorizeRoles('hod'), mlController.retrainModel);

module.exports = router;
