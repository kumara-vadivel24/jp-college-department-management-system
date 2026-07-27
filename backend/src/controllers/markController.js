const axios = require('axios');
const XLSX = require('xlsx');
const db = require('../config/db');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

function calculateGrade(i1, i2, i3, assignment, attendance) {
  const avgInternal = (i1 + i2 + i3) / 3;
  const composite = 0.6 * avgInternal + 0.25 * assignment + 0.15 * attendance;
  if (composite >= 90) return 'O';
  if (composite >= 80) return 'A+';
  if (composite >= 70) return 'A';
  if (composite >= 60) return 'B+';
  if (composite >= 50) return 'B';
  return 'RA';
}

exports.getInternalMarks = async (req, res) => {
  try {
    const { course_id, year, section } = req.query;

    let query = `
      SELECT m.*, s.reg_no, s.name, s.year, s.section, c.course_code, c.course_name, p.predicted_result, p.confidence_score, p.risk_level
      FROM students s
      JOIN marks m ON s.id = m.student_id
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN predictions p ON s.id = p.student_id
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      query += ` AND m.course_id = ?`;
      params.push(course_id);
    }
    if (year) {
      query += ` AND s.year = ?`;
      params.push(year);
    }
    if (section) {
      query += ` AND s.section = ?`;
      params.push(section);
    }

    query += ` ORDER BY s.reg_no ASC`;

    const records = await db.allAsync(query, params);
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving internal marks.' });
  }
};

exports.getSemesterMarks = async (req, res) => {
  try {
    const { course_id, year, section } = req.query;

    let query = `
      SELECT sm.*, s.reg_no, s.name, s.year, s.section, c.course_code, c.course_name
      FROM students s
      JOIN semester_marks sm ON s.id = sm.student_id
      JOIN courses c ON sm.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (course_id) {
      query += ` AND sm.course_id = ?`;
      params.push(course_id);
    }
    if (year) {
      query += ` AND s.year = ?`;
      params.push(year);
    }
    if (section) {
      query += ` AND s.section = ?`;
      params.push(section);
    }

    query += ` ORDER BY s.reg_no ASC`;

    const records = await db.allAsync(query, params);
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving semester exam marks.' });
  }
};

exports.updateSemesterMarks = async (req, res) => {
  try {
    const { student_id, course_id, semester_score, credits } = req.body;
    const score = Number(semester_score || 0);
    const cr = Number(credits || 3);

    let grade = 'RA';
    if (score >= 90) grade = 'O';
    else if (score >= 80) grade = 'A+';
    else if (score >= 70) grade = 'A';
    else if (score >= 60) grade = 'B+';
    else if (score >= 50) grade = 'B';

    const existing = await db.getAsync(`SELECT id FROM semester_marks WHERE student_id = ? AND course_id = ?`, [student_id, course_id]);

    if (existing) {
      await db.runAsync(
        `UPDATE semester_marks SET semester_score = ?, grade = ?, credits = ? WHERE id = ?`,
        [score, grade, cr, existing.id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO semester_marks (student_id, course_id, semester_score, grade, credits) VALUES (?, ?, ?, ?, ?)`,
        [student_id, course_id, score, grade, cr]
      );
    }

    return res.json({ message: 'Semester exam score and grade saved successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating semester marks.' });
  }
};

exports.updateInternalMarks = async (req, res) => {
  try {
    const { student_id, course_id, internal_1, internal_2, internal_3, assignment_score, attendance_pct, past_gpa } = req.body;

    const i1 = Number(internal_1 || 0);
    const i2 = Number(internal_2 || 0);
    const i3 = Number(internal_3 || 0);
    const assign = Number(assignment_score || 0);
    const att = Number(attendance_pct || 0);
    const gpa = Number(past_gpa || 7.0);

    const grade = calculateGrade(i1, i2, i3, assign, att);

    const existing = await db.getAsync(`SELECT id FROM marks WHERE student_id = ? AND course_id = ?`, [student_id, course_id]);

    if (existing) {
      await db.runAsync(
        `UPDATE marks SET internal_1=?, internal_2=?, internal_3=?, assignment_score=?, attendance_pct=?, past_gpa=?, grade=? WHERE id=?`,
        [i1, i2, i3, assign, att, gpa, grade, existing.id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO marks (student_id, course_id, internal_1, internal_2, internal_3, assignment_score, attendance_pct, past_gpa, grade)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, course_id, i1, i2, i3, assign, att, gpa, grade]
      );
    }

    const student = await db.getAsync(`SELECT * FROM students WHERE id = ?`, [student_id]);
    if (student) {
      try {
        const mlRes = await axios.post(`${ML_SERVICE_URL}/predict`, {
          student_id: student.id,
          reg_no: student.reg_no,
          name: student.name,
          internal_1: i1,
          internal_2: i2,
          internal_3: i3,
          assignment_score: assign,
          attendance_pct: att,
          past_gpa: gpa
        }, { timeout: 3000 });

        if (mlRes.data) {
          const { predicted_result, confidence_score, pass_probability, risk_level, recommended_action, subject_focus_areas, model_version } = mlRes.data;
          await db.runAsync(`DELETE FROM predictions WHERE student_id = ?`, [student_id]);
          await db.runAsync(
            `INSERT INTO predictions (student_id, exam_term, predicted_result, confidence_score, pass_probability, risk_level, recommended_action, focus_areas, model_version)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, 'Internal Cumulative', predicted_result, confidence_score, pass_probability, risk_level, recommended_action, subject_focus_areas ? subject_focus_areas.join(', ') : '', model_version]
          );
        }
      } catch (mlErr) {}
    }

    return res.json({ message: 'Internal marks and grade updated successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating internal marks.' });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const { type } = req.query;
    let data = [];

    if (type === 'semester') {
      data = await db.allAsync(`
        SELECT s.reg_no as "Register Number", s.name as "Student Name", c.course_code as "Course Code",
               c.course_name as "Course Name", sm.semester_score as "Semester Marks (100)", sm.grade as "Grade"
        FROM students s
        JOIN semester_marks sm ON s.id = sm.student_id
        JOIN courses c ON sm.course_id = c.id
        ORDER BY s.reg_no ASC
      `);
    } else {
      data = await db.allAsync(`
        SELECT s.reg_no as "Register Number", s.name as "Student Name", c.course_code as "Course Code",
               m.internal_1 as "Internal 1", m.internal_2 as "Internal 2", m.internal_3 as "Internal 3",
               m.assignment_score as "Assignment", m.attendance_pct as "Attendance %", m.grade as "Internal Grade",
               p.predicted_result as "ML Prediction", p.confidence_score as "Confidence %"
        FROM students s
        JOIN marks m ON s.id = m.student_id
        JOIN courses c ON m.course_id = c.id
        LEFT JOIN predictions p ON s.id = p.student_id
        ORDER BY s.reg_no ASC
      `);
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'semester' ? 'Semester Marks' : 'Internal Marks');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="JPCOE_CSE_${type || 'Internal'}_Marks.xlsx"`);
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to export marks to Excel.' });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await db.allAsync(`
      SELECT c.*, f.name as faculty_name
      FROM courses c
      LEFT JOIN faculty f ON c.faculty_id = f.id
      ORDER BY c.course_code ASC
    `);
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching courses.' });
  }
};
