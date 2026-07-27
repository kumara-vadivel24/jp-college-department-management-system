const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');
const db = require('../database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET /api/students - List all students (HOD & Faculty access)
router.get('/', authenticateToken, authorizeRoles('hod', 'faculty'), async (req, res) => {
  try {
    const { year, section, search } = req.query;
    let query = `
      SELECT s.*, u.login_id, u.email, u.first_login, p.predicted_result, p.confidence_score, p.pass_probability, p.risk_level
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN predictions p ON s.id = p.student_id
      WHERE 1=1
    `;
    const params = [];

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
});

// GET /api/students/export/excel - Export Student List to Excel (.xlsx)
router.get('/export/excel', authenticateToken, authorizeRoles('hod', 'faculty'), async (req, res) => {
  try {
    const students = await db.allAsync(`
      SELECT s.reg_no as "Register Number", s.name as "Student Name", s.email as "Email",
             s.year as "Year", s.section as "Section", s.phone as "Contact Phone",
             s.parent_name as "Parent Name", s.parent_phone as "Parent Phone",
             p.predicted_result as "ML Prediction", p.confidence_score as "Confidence %"
      FROM students s
      LEFT JOIN predictions p ON s.id = p.student_id
      ORDER BY s.reg_no ASC
    `);

    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Directory');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="JPCOE_CSE_Student_List.xlsx"');
    return res.send(buffer);
  } catch (err) {
    console.error('Excel Export Error:', err);
    return res.status(500).json({ message: 'Failed to export student list to Excel.' });
  }
});

// POST /api/students/delete-bulk - Delete Selected Students (HOD & Faculty)
router.post('/delete-bulk', authenticateToken, authorizeRoles('hod', 'faculty'), async (req, res) => {
  try {
    const { student_ids } = req.body;
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ message: 'Please select at least one student to delete.' });
    }

    for (const id of student_ids) {
      const student = await db.getAsync(`SELECT user_id FROM students WHERE id = ?`, [id]);
      if (student) {
        await db.runAsync(`DELETE FROM users WHERE id = ?`, [student.user_id]);
        await db.runAsync(`DELETE FROM students WHERE id = ?`, [id]);
        await db.runAsync(`DELETE FROM attendance WHERE student_id = ?`, [id]);
        await db.runAsync(`DELETE FROM marks WHERE student_id = ?`, [id]);
        await db.runAsync(`DELETE FROM semester_marks WHERE student_id = ?`, [id]);
        await db.runAsync(`DELETE FROM predictions WHERE student_id = ?`, [id]);
      }
    }

    return res.json({ message: `Successfully deleted ${student_ids.length} student record(s) and associated logins.` });
  } catch (err) {
    console.error('Bulk Delete Error:', err);
    return res.status(500).json({ message: 'Failed to delete selected students.' });
  }
});

// GET /api/students/:id - Single student
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await db.getAsync(
      `SELECT s.*, u.login_id, u.email, u.first_login, p.predicted_result, p.confidence_score, p.pass_probability, p.risk_level, p.recommended_action, p.focus_areas
       FROM students s
       JOIN users u ON s.user_id = u.id
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

    const dept = await db.getAsync(`SELECT * FROM departments LIMIT 1`);

    return res.json({ student, marks, semester_marks: semMarks, department: dept });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching student details.' });
  }
});

// POST /api/students - Add student (Default password '123')
router.post('/', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    const { reg_no, name, email, dob, gender, year, section, phone, address, parent_name, parent_phone } = req.body;

    if (!reg_no || !name) {
      return res.status(400).json({ message: 'Register Number and Name are required.' });
    }

    const passwordHash = await bcrypt.hash('123', 10);
    const userEmail = email || `${reg_no.toLowerCase()}@jpcoe.ac.in`;

    const uRes = await db.runAsync(
      `INSERT INTO users (login_id, email, password_hash, role, first_login) VALUES (?, ?, ?, 'student', 1)`,
      [reg_no.trim(), userEmail, passwordHash]
    );

    const sRes = await db.runAsync(
      `INSERT INTO students (user_id, reg_no, name, email, dob, gender, year, section, phone, address, parent_name, parent_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uRes.lastID, reg_no.trim(), name, userEmail, dob, gender, year || 3, section || 'A', phone, address, parent_name, parent_phone]
    );

    return res.status(201).json({ message: 'Student created successfully with default password "123".', studentId: sRes.lastID });
  } catch (err) {
    console.error('Create Student Error:', err);
    return res.status(500).json({ message: 'Error adding student. Reg No must be unique.' });
  }
});

// POST /api/students/bulk-import - CSV Bulk Import
router.post('/bulk-import', authenticateToken, authorizeRoles('hod'), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file.' });
  }

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
          const section = row.section || row.Section || 'A';

          if (reg_no && name) {
            const uRes = await db.runAsync(
              `INSERT OR IGNORE INTO users (login_id, email, password_hash, role, first_login) VALUES (?, ?, ?, 'student', 1)`,
              [reg_no, email, passwordHash]
            );
            if (uRes.lastID) {
              await db.runAsync(
                `INSERT OR IGNORE INTO students (user_id, reg_no, name, email, year, section) VALUES (?, ?, ?, ?, ?, ?)`,
                [uRes.lastID, reg_no, name, email, year, section]
              );
              importedCount++;
            }
          }
        } catch (e) {}
      }

      fs.unlinkSync(req.file.path);
      return res.json({ message: `Bulk import completed! ${importedCount} students added with default password "123".` });
    });
});

module.exports = router;
