const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/faculty - List all faculty (HOD & Faculty)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const facultyList = await db.allAsync(`SELECT f.*, u.email FROM faculty f JOIN users u ON f.user_id = u.id ORDER BY f.name ASC`);
    return res.json(facultyList);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching faculty list.' });
  }
});

// POST /api/faculty - Add new faculty (HOD only)
router.post('/', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    const { faculty_id, name, email, designation, phone } = req.body;
    if (!name || !email || !faculty_id) {
      return res.status(400).json({ message: 'Faculty ID, Name, and Email are required.' });
    }

    const passwordHash = await bcrypt.hash('password123', 10);
    const uRes = await db.runAsync(`INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'faculty')`, [email, passwordHash]);
    const fRes = await db.runAsync(
      `INSERT INTO faculty (user_id, faculty_id, name, email, designation, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [uRes.lastID, faculty_id, name, email, designation || 'Assistant Professor', phone || '']
    );

    return res.status(201).json({ message: 'Faculty created successfully.', facultyId: fRes.lastID });
  } catch (err) {
    return res.status(500).json({ message: 'Error creating faculty record.' });
  }
});

// DELETE /api/faculty/:id - Delete faculty (HOD only)
router.delete('/:id', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    const fac = await db.getAsync(`SELECT user_id FROM faculty WHERE id = ?`, [req.params.id]);
    if (fac) {
      await db.runAsync(`DELETE FROM users WHERE id = ?`, [fac.user_id]);
      await db.runAsync(`DELETE FROM faculty WHERE id = ?`, [req.params.id]);
    }
    return res.json({ message: 'Faculty member removed.' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting faculty record.' });
  }
});

module.exports = router;
