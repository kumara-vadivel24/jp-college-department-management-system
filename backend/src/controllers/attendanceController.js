const db = require('../config/db');

exports.getSummary = async (req, res) => {
  try {
    const { year, section, course_id } = req.query;

    const students = await db.allAsync(
      `SELECT s.id, s.reg_no, s.name, s.year, s.section,
        COUNT(a.id) as total_classes,
        SUM(CASE WHEN a.status = 'Present' OR a.status = 'On Duty' THEN 1 ELSE 0 END) as present_classes
       FROM students s
       LEFT JOIN attendance a ON s.id = a.student_id ${course_id ? 'AND a.course_id = ' + Number(course_id) : ''}
       WHERE (${year ? 's.year = ' + Number(year) : '1=1'}) AND (${section ? "s.section = '" + section + "'" : '1=1'})
       GROUP BY s.id
       ORDER BY s.reg_no ASC`
    );

    const formatted = students.map((st) => {
      const total = st.total_classes || 1;
      const present = st.present_classes || 0;
      const pct = Math.round((present / total) * 100);
      return {
        ...st,
        attendance_pct: pct,
        is_shortage: pct < 75
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error('Attendance Summary Error:', err);
    return res.status(500).json({ message: 'Error retrieving attendance summary.' });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { course_id, date, period, attendance_records } = req.body;

    if (!course_id || !date || !attendance_records || !Array.isArray(attendance_records)) {
      return res.status(400).json({ message: 'course_id, date, and attendance_records array are required.' });
    }

    for (const record of attendance_records) {
      const existing = await db.getAsync(
        `SELECT id FROM attendance WHERE student_id = ? AND course_id = ? AND date = ? AND period = ?`,
        [record.student_id, course_id, date, period || 1]
      );

      if (existing) {
        await db.runAsync(`UPDATE attendance SET status = ? WHERE id = ?`, [record.status, existing.id]);
      } else {
        await db.runAsync(
          `INSERT INTO attendance (student_id, course_id, date, period, status) VALUES (?, ?, ?, ?, ?)`,
          [record.student_id, course_id, date, period || 1, record.status]
        );
      }

      const totalRes = await db.getAsync(
        `SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND course_id = ?`,
        [record.student_id, course_id]
      );
      const presentRes = await db.getAsync(
        `SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND course_id = ? AND status IN ('Present', 'On Duty')`,
        [record.student_id, course_id]
      );

      const total = totalRes ? totalRes.count : 1;
      const present = presentRes ? presentRes.count : 0;
      const newPct = Math.round((present / Math.max(total, 1)) * 100);

      await db.runAsync(
        `UPDATE marks SET attendance_pct = ? WHERE student_id = ? AND course_id = ?`,
        [newPct, record.student_id, course_id]
      );
    }

    return res.json({ message: `Attendance marked successfully for ${attendance_records.length} students!` });
  } catch (err) {
    console.error('Mark Attendance Error:', err);
    return res.status(500).json({ message: 'Error marking attendance.' });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const logs = await db.allAsync(
      `SELECT a.*, c.course_code, c.course_name
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.date DESC`,
      [req.params.studentId]
    );

    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching student attendance history.' });
  }
};
