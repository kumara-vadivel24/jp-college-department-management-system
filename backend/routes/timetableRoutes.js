const express = require('express');
const db = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/timetable - Get timetable by year & section
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { year, section } = req.query;
    const y = year || 3;
    const s = section || 'A';

    const tt = await db.allAsync(`
      SELECT t.*, c.course_code, c.course_name, f.name as faculty_name
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      JOIN faculty f ON t.faculty_id = f.id
      WHERE t.year = ? AND t.section = ?
      ORDER BY t.period_number ASC
    `, [y, s]);

    return res.json(tt);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching timetable.' });
  }
});

// POST /api/timetable - HOD updates or adds a timetable period slot
router.post('/', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    const { year, section, day_of_week, period_number, course_id, faculty_id, room_no } = req.body;

    const existing = await db.getAsync(
      `SELECT id FROM timetable WHERE year=? AND section=? AND day_of_week=? AND period_number=?`,
      [year, section, day_of_week, period_number]
    );

    if (existing) {
      await db.runAsync(
        `UPDATE timetable SET course_id=?, faculty_id=?, room_no=? WHERE id=?`,
        [course_id, faculty_id, room_no || 'Lab-1', existing.id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO timetable (year, section, day_of_week, period_number, course_id, faculty_id, room_no) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [year, section, day_of_week, period_number, course_id, faculty_id, room_no || 'Lab-1']
      );
    }

    return res.json({ message: 'Timetable updated successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating timetable.' });
  }
});

module.exports = router;
