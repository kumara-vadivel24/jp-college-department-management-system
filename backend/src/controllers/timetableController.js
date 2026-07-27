const db = require('../config/db');

// GET /api/timetable - Get timetable by dept, year, semester, section, faculty, or room
exports.getTimetable = async (req, res) => {
  try {
    const { department_id, year, semester, section, faculty_id, room_no } = req.query;

    const targetDeptId = req.user.role === 'superadmin' ? (department_id || null) : req.user.department_id;
    const y = year || null;
    const s = section || null;
    const sem = semester || null;

    let query = `
      SELECT t.*, c.course_code, c.course_name, f.name as faculty_name, f.faculty_id as faculty_code, d.code as department_code
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      JOIN faculty f ON t.faculty_id = f.id
      JOIN departments d ON t.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (targetDeptId) {
      query += ` AND t.department_id = ?`;
      params.push(targetDeptId);
    }
    if (y) {
      query += ` AND t.year = ?`;
      params.push(y);
    }
    if (sem) {
      query += ` AND c.semester = ?`;
      params.push(sem);
    }
    if (s) {
      query += ` AND t.section = ?`;
      params.push(s);
    }
    if (faculty_id) {
      query += ` AND t.faculty_id = ?`;
      params.push(faculty_id);
    }
    if (room_no) {
      query += ` AND t.room_no LIKE ?`;
      params.push(`%${room_no}%`);
    }

    query += ` ORDER BY t.day_of_week ASC, t.period_number ASC`;

    const tt = await db.allAsync(query, params);
    return res.json(tt);
  } catch (err) {
    console.error('Fetch Timetable Error:', err);
    return res.status(500).json({ message: 'Error fetching timetable.' });
  }
};

// POST /api/timetable/check-conflicts - Validate schedule conflicts
exports.checkConflicts = async (req, res) => {
  try {
    const { slots, department_id } = req.body;
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Slots array is required for conflict check.' });
    }

    const conflicts = [];
    const deptId = department_id || req.user.department_id;

    for (const slot of slots) {
      const { day_of_week, period_number, faculty_id, room_no, year, section } = slot;
      if (!faculty_id || !day_of_week || !period_number) continue;

      // 1. Check Faculty Double-Booking (faculty assigned to another class at same day & period)
      const facultyConflict = await db.getAsync(
        `SELECT t.*, c.course_code, d.code as dept_code
         FROM timetable t
         JOIN courses c ON t.course_id = c.id
         JOIN departments d ON t.department_id = d.id
         WHERE t.faculty_id = ? AND t.day_of_week = ? AND t.period_number = ? AND NOT (t.year = ? AND t.section = ? AND t.department_id = ?)`,
        [faculty_id, day_of_week, period_number, year || 3, section || 'A', deptId]
      );

      if (facultyConflict) {
        conflicts.push({
          type: 'FACULTY_DOUBLE_BOOKING',
          day: day_of_week,
          period: period_number,
          message: `Faculty is already teaching ${facultyConflict.course_code} (${facultyConflict.dept_code} Yr ${facultyConflict.year}-${facultyConflict.section}) on ${day_of_week} Period ${period_number}.`
        });
      }

      // 2. Check Classroom Double-Booking
      if (room_no) {
        const roomConflict = await db.getAsync(
          `SELECT t.*, c.course_code, d.code as dept_code
           FROM timetable t
           JOIN courses c ON t.course_id = c.id
           JOIN departments d ON t.department_id = d.id
           WHERE LOWER(t.room_no) = LOWER(?) AND t.day_of_week = ? AND t.period_number = ? AND NOT (t.year = ? AND t.section = ? AND t.department_id = ?)`,
          [room_no.trim(), day_of_week, period_number, year || 3, section || 'A', deptId]
        );

        if (roomConflict) {
          conflicts.push({
            type: 'ROOM_DOUBLE_BOOKING',
            day: day_of_week,
            period: period_number,
            message: `Room ${room_no} is already booked by ${roomConflict.dept_code} (${roomConflict.course_code}) on ${day_of_week} Period ${period_number}.`
          });
        }
      }
    }

    return res.json({
      has_conflicts: conflicts.length > 0,
      conflicts
    });
  } catch (err) {
    console.error('Conflict Check Error:', err);
    return res.status(500).json({ message: 'Error checking schedule conflicts.' });
  }
};

// POST /api/timetable/batch-save - Batch save/update timetable grid
exports.batchSaveTimetable = async (req, res) => {
  try {
    const { department_id, year, section, slots } = req.body;

    const deptId = req.user.role === 'superadmin' ? (department_id || req.user.department_id || 1) : req.user.department_id;
    const y = Number(year || 3);
    const s = section || 'A';

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Slots array is required.' });
    }

    for (const slot of slots) {
      const { day_of_week, period_number, course_id, faculty_id, room_no } = slot;
      if (!day_of_week || !period_number) continue;

      const existing = await db.getAsync(
        `SELECT id FROM timetable WHERE department_id=? AND year=? AND section=? AND day_of_week=? AND period_number=?`,
        [deptId, y, s, day_of_week, period_number]
      );

      if (course_id && faculty_id) {
        if (existing) {
          await db.runAsync(
            `UPDATE timetable SET course_id=?, faculty_id=?, room_no=? WHERE id=?`,
            [course_id, faculty_id, room_no || 'Lab-1', existing.id]
          );
        } else {
          await db.runAsync(
            `INSERT INTO timetable (department_id, year, section, day_of_week, period_number, course_id, faculty_id, room_no)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [deptId, y, s, day_of_week, period_number, course_id, faculty_id, room_no || 'Lab-1']
          );
        }
      } else if (existing) {
        // Clear empty slot
        await db.runAsync(`DELETE FROM timetable WHERE id=?`, [existing.id]);
      }
    }

    return res.json({ message: `Timetable for Year ${y} Sec ${s} saved successfully!` });
  } catch (err) {
    console.error('Batch Save Timetable Error:', err);
    return res.status(500).json({ message: 'Failed to save timetable grid.' });
  }
};

// POST /api/timetable/copy - Duplicate/copy timetable from source to target
exports.copyTimetable = async (req, res) => {
  try {
    const { source_year, source_section, target_year, target_section, department_id } = req.body;

    const deptId = req.user.role === 'superadmin' ? (department_id || req.user.department_id || 1) : req.user.department_id;

    const sourceSlots = await db.allAsync(
      `SELECT * FROM timetable WHERE department_id=? AND year=? AND section=?`,
      [deptId, source_year, source_section]
    );

    if (sourceSlots.length === 0) {
      return res.status(404).json({ message: 'Source timetable has no period slots to copy.' });
    }

    // Clear target timetable first
    await db.runAsync(
      `DELETE FROM timetable WHERE department_id=? AND year=? AND section=?`,
      [deptId, target_year, target_section]
    );

    for (const slot of sourceSlots) {
      await db.runAsync(
        `INSERT INTO timetable (department_id, year, section, day_of_week, period_number, course_id, faculty_id, room_no)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [deptId, target_year, target_section, slot.day_of_week, slot.period_number, slot.course_id, slot.faculty_id, slot.room_no]
      );
    }

    return res.json({ message: `Successfully copied timetable from Year ${source_year}-${source_section} to Year ${target_year}-${target_section}!` });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to copy timetable.' });
  }
};

// DELETE /api/timetable - Clear timetable
exports.clearTimetable = async (req, res) => {
  try {
    const { department_id, year, section } = req.query;

    const deptId = req.user.role === 'superadmin' ? (department_id || req.user.department_id || 1) : req.user.department_id;

    await db.runAsync(
      `DELETE FROM timetable WHERE department_id=? AND year=? AND section=?`,
      [deptId, year || 3, section || 'A']
    );

    return res.json({ message: `Cleared timetable for Year ${year}-${section}.` });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to clear timetable.' });
  }
};
