const express = require('express');
const db = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/department - Public header/footer branding & config info
router.get('/', async (req, res) => {
  try {
    const dept = await db.getAsync(`SELECT * FROM departments LIMIT 1`);
    return res.json(dept || {
      college_name: 'J.P. College of Engineering',
      name: 'Department of Computer Science',
      code: 'CSE',
      address: 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852',
      logo_url: '/logo.png'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching department details.' });
  }
});

// PUT /api/department - HOD updates department name / college branding (Configurable!)
router.put('/', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    const { college_name, name, code, address, logo_url } = req.body;

    await db.runAsync(
      `UPDATE departments SET college_name=?, name=?, code=?, address=?, logo_url=? WHERE id=1`,
      [college_name, name, code, address, logo_url || '/logo.png']
    );

    return res.json({ message: 'Department details updated successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update department settings.' });
  }
});

module.exports = router;
