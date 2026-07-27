const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const db = require('../config/db');

exports.uploadMiddleware = multer({ dest: 'uploads/' }).single('file');

exports.getStudents = async (req, res) => {
  try {
    const { year, section, search, department_id } = req.query;

    const targetDeptId = req.user.role === 'superadmin' ? (department_id || null) : req.user.department_id;

    let query = `
      SELECT s.*, d.code as department_code, d.name as department_name, u.login_id, u.email, u.first_login, p.predicted_result, p.confidence_score, p.pass_probability, p.risk_level
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN predictions p ON s.id = p.student_id
      WHERE 1=1
    `;
    const params = [];

    if (targetDeptId) {
      query += ` AND s.department_id = ?`;
      params.push(targetDeptId);
    }
    if (year) {
      query += ` AND s.year = ?`;
      params.push(year);
    }
    if (section) {
      query += ` AND s.section = ?`;
      params.push(section);
    }
    if (search) {
      query += ` AND (s.name LIKE ? OR s.reg_no LIKE ? OR s.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY s.reg_no ASC`;

    const students = await db.allAsync(query, params);
    return res.json(students);
  } catch (err) {
    console.error('Fetch Students Error:', err);
    return res.status(500).json({ message: 'Error retrieving student records.' });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const targetDeptId = req.user.role === 'superadmin' ? (req.query.department_id || null) : req.user.department_id;

    let query = `
      SELECT s.reg_no as "Register Number", s.name as "Student Name", d.code as "Department", s.email as "Email",
             s.year as "Year", s.section as "Section", s.phone as "Contact Phone",
             s.parent_name as "Parent Name", s.parent_phone as "Parent Phone",
             p.predicted_result as "ML Prediction", p.confidence_score as "Confidence %"
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN predictions p ON s.id = p.student_id
      WHERE 1=1
    `;
    const params = [];

    if (targetDeptId) {
      query += ` AND s.department_id = ?`;
      params.push(targetDeptId);
    }

    query += ` ORDER BY s.reg_no ASC`;

    const students = await db.allAsync(query, params);

    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Directory');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="JPCOE_Student_Directory.xlsx"');
    return res.send(buffer);
  } catch (err) {
    console.error('Excel Export Error:', err);
    return res.status(500).json({ message: 'Failed to export student list to Excel.' });
  }
};

exports.deleteBulk = async (req, res) => {
  try {
    const { student_ids } = req.body;
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ message: 'Please select at least one student to delete.' });
    }

    for (const id of student_ids) {
      const student = await db.getAsync(`SELECT user_id, department_id FROM students WHERE id = ?`, [id]);
      if (student) {
        if (req.user.role !== 'superadmin' && student.department_id !== req.user.department_id) {
          continue; // Skip deleting students outside assigned department
        }
        await db.runAsync(`DELETE FROM users WHERE id = ?`, [student.user_id]);
        await db.runAsync(`DELETE FROM students WHERE id = ?`, [id]);
        await db.runAsync(`DELETE FROM attendance WHERE student_id = ?`, [id]);
        await db.runAsync(`DELETE FROM marks WHERE student_id = ?`, [id]);
        await db.runAsync(`DELETE FROM semester_marks WHERE student_id = ?`, [id]);
        await db.runAsync(`DELETE FROM predictions WHERE student_id = ?`, [id]);
      }
    }

    return res.json({ message: `Successfully deleted selected student record(s) and associated logins.` });
  } catch (err) {
    console.error('Bulk Delete Error:', err);
    return res.status(500).json({ message: 'Failed to delete selected students.' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await db.getAsync(
      `SELECT s.*, d.code as department_code, d.name as department_name, u.login_id, u.email, u.first_login, p.predicted_result, p.confidence_score, p.pass_probability, p.risk_level, p.recommended_action, p.focus_areas
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       LEFT JOIN predictions p ON s.id = p.student_id
       WHERE s.id = ? OR s.user_id = ?`,
      [req.params.id, req.params.id]
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const marks = await db.allAsync(
      `SELECT m.*, c.course_code, c.course_name FROM marks m JOIN courses c ON m.course_id = c.id WHERE m.student_id = ?`,
      [student.id]
    );

    const semMarks = await db.allAsync(
      `SELECT sm.*, c.course_code, c.course_name FROM semester_marks sm JOIN courses c ON sm.course_id = c.id WHERE sm.student_id = ?`,
      [student.id]
    );

    const dept = await db.getAsync(`SELECT * FROM departments WHERE id = ?`, [student.department_id || 1]);

    return res.json({ student, marks, semester_marks: semMarks, department: dept });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching student details.' });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { reg_no, name, email, dob, gender, year, semester, section, phone, address, parent_name, parent_phone, department_id } = req.body;

    if (!reg_no || !name) {
      return res.status(400).json({ message: 'Register Number and Name are required.' });
    }

    const deptId = req.user.role === 'superadmin' ? (department_id || req.user.department_id || 1) : req.user.department_id;
    const passwordHash = await bcrypt.hash('123', 10);
    const userEmail = email || `${reg_no.toLowerCase()}@jpcoe.ac.in`;

    const uRes = await db.runAsync(
      `INSERT INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, 'student', ?, 1)`,
      [reg_no.trim(), userEmail, passwordHash, deptId]
    );

    const sRes = await db.runAsync(
      `INSERT INTO students (user_id, reg_no, name, email, dob, gender, year, semester, section, phone, address, parent_name, parent_phone, department_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uRes.lastID, reg_no.trim(), name, userEmail, dob, gender, year || 3, semester || 5, section || 'A', phone, address, parent_name, parent_phone, deptId]
    );

    return res.status(201).json({ message: 'Student created successfully with default password "123".', studentId: sRes.lastID });
  } catch (err) {
    console.error('Create Student Error:', err);
    return res.status(500).json({ message: 'Error adding student. Reg No must be unique.' });
  }
};

exports.bulkImport = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file.' });
  }

  const deptId = req.user.role === 'superadmin' ? (req.body.department_id || req.user.department_id || 1) : req.user.department_id;

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      let importedCount = 0;
      const passwordHash = await bcrypt.hash('123', 10);

      for (const row of results) {
        try {
          const reg_no = (row.reg_no || row.RegNo || row['Register Number'] || '').trim();
          const name = row.name || row.Name;
          const email = row.email || row.Email || `${reg_no.toLowerCase()}@jpcoe.ac.in`;
          const year = row.year || row.Year || 3;
          const semester = row.semester || row.Semester || 5;
          const section = row.section || row.Section || 'A';

          if (reg_no && name) {
            const uRes = await db.runAsync(
              `INSERT OR IGNORE INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, 'student', ?, 1)`,
              [reg_no, email, passwordHash, deptId]
            );
            if (uRes.lastID) {
              await db.runAsync(
                `INSERT OR IGNORE INTO students (user_id, reg_no, name, email, year, semester, section, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [uRes.lastID, reg_no, name, email, year, semester, section, deptId]
              );
              importedCount++;
            }
          }
        } catch (e) {}
      }

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.json({ message: `Bulk import completed! ${importedCount} students added with default password "123".` });
    });
};
