const express = require('express');
const db = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/notices - List all active notices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role;
    const notices = await db.allAsync(
      `SELECT * FROM notices WHERE target_role = 'All' OR target_role = ? OR ? = 'hod' ORDER BY created_at DESC`,
      [role, role]
    );
    return res.json(notices);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching notices.' });
  }
});

// POST /api/notices - Create notice (HOD & Faculty)
router.post('/', authenticateToken, authorizeRoles('hod', 'faculty'), async (req, res) => {
  try {
    const { title, content, category, target_role } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const author = req.user.name || (req.user.role === 'hod' ? 'HOD Office' : 'Faculty');

    await db.runAsync(
      `INSERT INTO notices (title, content, category, target_role, author_name) VALUES (?, ?, ?, ?, ?)`,
      [title, content, category || 'General', target_role || 'All', author]
    );

    return res.status(201).json({ message: 'Notice posted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Error posting notice.' });
  }
});

// DELETE /api/notices/:id - Delete notice (HOD only)
router.delete('/:id', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    await db.runAsync(`DELETE FROM notices WHERE id = ?`, [req.params.id]);
    return res.json({ message: 'Notice deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting notice.' });
  }
});

module.exports = router;
