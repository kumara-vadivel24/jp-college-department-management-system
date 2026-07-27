const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// GET /api/department - Active department info for header/branding
exports.getDepartment = async (req, res) => {
  try {
    const deptId = req.query.department_id || (req.user ? req.user.department_id : 1);
    const dept = await db.getAsync(`SELECT * FROM departments WHERE id = ? LIMIT 1`, [deptId]);
    return res.json(dept || {
      id: 1,
      college_name: 'J.P. College of Engineering',
      name: 'Department of Computer Science',
      code: 'CSE',
      address: 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852',
      logo_url: '/logo.png'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching department details.' });
  }
};

// GET /api/department/all - List all 7 engineering departments (Super Admin & HOD)
exports.getAllDepartments = async (req, res) => {
  try {
    const depts = await db.allAsync(`
      SELECT d.*,
             (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) as student_count,
             (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.id) as faculty_count,
             (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) as subject_count,
             (SELECT f.name FROM faculty f JOIN users u ON f.user_id = u.id WHERE u.role = 'hod' AND f.department_id = d.id LIMIT 1) as hod_name
      FROM departments d
      ORDER BY d.id ASC
    `);
    return res.json(depts);
  } catch (err) {
    console.error('Fetch All Departments Error:', err);
    return res.status(500).json({ message: 'Error retrieving departments list.' });
  }
};

// POST /api/department - Create new department (Super Admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { college_name, name, code, address, logo_url } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: 'Department Name and Department Code are required.' });
    }

    const existing = await db.getAsync(`SELECT id FROM departments WHERE code = ?`, [code.trim().toUpperCase()]);
    if (existing) {
      return res.status(400).json({ message: 'Department code must be unique.' });
    }

    const resDb = await db.runAsync(
      `INSERT INTO departments (college_name, name, code, address, logo_url) VALUES (?, ?, ?, ?, ?)`,
      [
        college_name || 'J.P. College of Engineering',
        name.trim(),
        code.trim().toUpperCase(),
        address || 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852',
        logo_url || '/logo.png'
      ]
    );

    return res.status(201).json({ message: 'Department created successfully!', departmentId: resDb.lastID });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create department.' });
  }
};

// PUT /api/department/:id - Update department details (Super Admin & HOD)
exports.updateDepartment = async (req, res) => {
  try {
    const { college_name, name, code, address, logo_url, is_active } = req.body;
    const deptId = req.params.id || 1;

    await db.runAsync(
      `UPDATE departments SET college_name=?, name=?, code=?, address=?, logo_url=?, is_active=? WHERE id=?`,
      [
        college_name || 'J.P. College of Engineering',
        name,
        code,
        address,
        logo_url || '/logo.png',
        is_active !== undefined ? Number(is_active) : 1,
        deptId
      ]
    );

    return res.json({ message: 'Department details updated successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update department settings.' });
  }
};

// DELETE /api/department/:id - Delete department (Super Admin only)
exports.deleteDepartment = async (req, res) => {
  try {
    const deptId = req.params.id;
    if (Number(deptId) === 1) {
      return res.status(400).json({ message: 'Cannot delete primary default CSE department.' });
    }

    await db.runAsync(`DELETE FROM departments WHERE id = ?`, [deptId]);
    await db.runAsync(`UPDATE users SET department_id = 1 WHERE department_id = ?`, [deptId]);
    await db.runAsync(`UPDATE students SET department_id = 1 WHERE department_id = ?`, [deptId]);
    await db.runAsync(`UPDATE faculty SET department_id = 1 WHERE department_id = ?`, [deptId]);

    return res.json({ message: 'Department deleted. Associated users moved to default CSE department.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete department.' });
  }
};

// POST /api/department/transfer-faculty - Transfer Faculty between departments (Super Admin)
exports.transferFaculty = async (req, res) => {
  try {
    const { faculty_id, target_department_id } = req.body;
    if (!faculty_id || !target_department_id) {
      return res.status(400).json({ message: 'faculty_id and target_department_id are required.' });
    }

    const fac = await db.getAsync(`SELECT * FROM faculty WHERE id = ?`, [faculty_id]);
    if (!fac) return res.status(404).json({ message: 'Faculty record not found.' });

    await db.runAsync(`UPDATE faculty SET department_id = ? WHERE id = ?`, [target_department_id, faculty_id]);
    await db.runAsync(`UPDATE users SET department_id = ? WHERE id = ?`, [target_department_id, fac.user_id]);

    return res.json({ message: `Faculty ${fac.name} transferred successfully to new department.` });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to transfer faculty member.' });
  }
};

// POST /api/department/transfer-student - Transfer Student between departments (Super Admin)
exports.transferStudent = async (req, res) => {
  try {
    const { student_id, target_department_id } = req.body;
    if (!student_id || !target_department_id) {
      return res.status(400).json({ message: 'student_id and target_department_id are required.' });
    }

    const student = await db.getAsync(`SELECT * FROM students WHERE id = ?`, [student_id]);
    if (!student) return res.status(404).json({ message: 'Student record not found.' });

    await db.runAsync(`UPDATE students SET department_id = ? WHERE id = ?`, [target_department_id, student_id]);
    await db.runAsync(`UPDATE users SET department_id = ? WHERE id = ?`, [target_department_id, student.user_id]);

    return res.json({ message: `Student ${student.name} transferred successfully to new department.` });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to transfer student.' });
  }
};

// GET /api/department/backup - Backup Database Dump JSON (Super Admin)
exports.backupDatabase = async (req, res) => {
  try {
    const departments = await db.allAsync(`SELECT * FROM departments`);
    const users = await db.allAsync(`SELECT id, login_id, email, role, department_id, first_login FROM users`);
    const faculty = await db.allAsync(`SELECT * FROM faculty`);
    const students = await db.allAsync(`SELECT * FROM students`);
    const courses = await db.allAsync(`SELECT * FROM courses`);
    const marks = await db.allAsync(`SELECT * FROM marks`);
    const semester_marks = await db.allAsync(`SELECT * FROM semester_marks`);
    const predictions = await db.allAsync(`SELECT * FROM predictions`);
    const timetable = await db.allAsync(`SELECT * FROM timetable`);
    const notices = await db.allAsync(`SELECT * FROM notices`);

    const backupPayload = {
      timestamp: new Date().toISOString(),
      system: 'J.P. College of Engineering ERP Backup',
      version: '2.0.0',
      data: {
        departments,
        users,
        faculty,
        students,
        courses,
        marks,
        semester_marks,
        predictions,
        timetable,
        notices
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="JPCOE_ERP_Database_Backup.json"');
    return res.send(JSON.stringify(backupPayload, null, 2));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to generate database backup.' });
  }
};
