const db = require('../config/db');

// GET /api/subjects - List subjects (filtered by department, year, semester, active status)
exports.getSubjects = async (req, res) => {
  try {
    const { department_id, year, semester, is_active } = req.query;

    let targetDeptId = req.user.role === 'superadmin' ? (department_id || null) : req.user.department_id;

    let query = `
      SELECT c.*, d.name as department_name, d.code as department_code, f.name as faculty_name, f.faculty_id as faculty_code
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      LEFT JOIN faculty f ON c.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (targetDeptId) {
      query += ` AND c.department_id = ?`;
      params.push(targetDeptId);
    }
    if (year) {
      query += ` AND c.year = ?`;
      params.push(year);
    }
    if (semester) {
      query += ` AND c.semester = ?`;
      params.push(semester);
    }
    if (is_active !== undefined && is_active !== '') {
      query += ` AND c.is_active = ?`;
      params.push(Number(is_active));
    }

    query += ` ORDER BY c.year ASC, c.semester ASC, c.course_code ASC`;

    const subjects = await db.allAsync(query, params);
    return res.json(subjects);
  } catch (err) {
    console.error('Fetch Subjects Error:', err);
    return res.status(500).json({ message: 'Error retrieving subjects list.' });
  }
};

// POST /api/subjects - Add new subject (HOD & SuperAdmin)
exports.createSubject = async (req, res) => {
  try {
    const { course_code, course_name, year, semester, credits, faculty_id, department_id, is_active } = req.body;

    if (!course_code || !course_name || !year || !semester) {
      return res.status(400).json({ message: 'Subject Code, Name, Year, and Semester are required.' });
    }

    const deptId = req.user.role === 'superadmin' ? (department_id || req.user.department_id || 1) : req.user.department_id;

    const existing = await db.getAsync(`SELECT id FROM courses WHERE course_code = ?`, [course_code.trim()]);
    if (existing) {
      return res.status(400).json({ message: 'A subject with this Subject Code already exists.' });
    }

    const resDb = await db.runAsync(
      `INSERT INTO courses (course_code, course_name, year, semester, credits, department_id, faculty_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_code.trim().toUpperCase(),
        course_name.trim(),
        Number(year),
        Number(semester),
        Number(credits || 3),
        deptId,
        faculty_id || null,
        is_active !== undefined ? Number(is_active) : 1
      ]
    );

    return res.status(201).json({ message: 'Subject added successfully!', subjectId: resDb.lastID });
  } catch (err) {
    console.error('Create Subject Error:', err);
    return res.status(500).json({ message: 'Failed to create subject.' });
  }
};

// PUT /api/subjects/:id - Edit subject details (HOD & SuperAdmin)
exports.updateSubject = async (req, res) => {
  try {
    const { course_code, course_name, year, semester, credits, faculty_id, department_id, is_active } = req.body;

    const subject = await db.getAsync(`SELECT * FROM courses WHERE id = ?`, [req.params.id]);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    if (req.user.role !== 'superadmin' && subject.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'Access denied. You cannot edit subjects outside your department.' });
    }

    const deptId = req.user.role === 'superadmin' ? (department_id || subject.department_id) : subject.department_id;

    await db.runAsync(
      `UPDATE courses SET course_code=?, course_name=?, year=?, semester=?, credits=?, department_id=?, faculty_id=?, is_active=?
       WHERE id=?`,
      [
        (course_code || subject.course_code).trim().toUpperCase(),
        (course_name || subject.course_name).trim(),
        Number(year || subject.year),
        Number(semester || subject.semester),
        Number(credits || subject.credits || 3),
        deptId,
        faculty_id !== undefined ? faculty_id : subject.faculty_id,
        is_active !== undefined ? Number(is_active) : subject.is_active,
        req.params.id
      ]
    );

    return res.json({ message: 'Subject updated successfully!' });
  } catch (err) {
    console.error('Update Subject Error:', err);
    return res.status(500).json({ message: 'Failed to update subject details.' });
  }
};

// PUT /api/subjects/:id/toggle-active - Toggle Subject Active Status
exports.toggleSubjectActive = async (req, res) => {
  try {
    const subject = await db.getAsync(`SELECT * FROM courses WHERE id = ?`, [req.params.id]);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    if (req.user.role !== 'superadmin' && subject.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const newActiveState = subject.is_active === 1 ? 0 : 1;
    await db.runAsync(`UPDATE courses SET is_active = ? WHERE id = ?`, [newActiveState, req.params.id]);

    return res.json({
      message: `Subject ${subject.course_code} ${newActiveState === 1 ? 'activated' : 'deactivated'} successfully!`,
      is_active: newActiveState
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to toggle subject active status.' });
  }
};

// DELETE /api/subjects/:id - Delete subject (SuperAdmin & HOD)
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await db.getAsync(`SELECT * FROM courses WHERE id = ?`, [req.params.id]);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    if (req.user.role !== 'superadmin' && subject.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await db.runAsync(`DELETE FROM courses WHERE id = ?`, [req.params.id]);
    await db.runAsync(`DELETE FROM marks WHERE course_id = ?`, [req.params.id]);
    await db.runAsync(`DELETE FROM semester_marks WHERE course_id = ?`, [req.params.id]);
    await db.runAsync(`DELETE FROM attendance WHERE course_id = ?`, [req.params.id]);
    await db.runAsync(`DELETE FROM timetable WHERE course_id = ?`, [req.params.id]);

    return res.json({ message: `Subject ${subject.course_code} and linked records deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete subject.' });
  }
};
