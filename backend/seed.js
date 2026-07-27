const bcrypt = require('bcryptjs');
const db = require('./src/config/db');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function seedDatabase() {
  console.log('--- Starting Fresh Database Seeding for 7 Engineering Departments & Super Admin ---');

  try {
    const passwordHash = await bcrypt.hash('123', 10);

    // Drop old tables to reset CHECK constraints & column schemas cleanly
    const tables = ['notices', 'leaves', 'timetable', 'predictions', 'semester_marks', 'marks', 'exams', 'attendance', 'courses', 'students', 'faculty', 'users', 'departments'];
    for (const tbl of tables) {
      try { await db.runAsync(`DROP TABLE IF EXISTS ${tbl}`); } catch (e) {}
    }

    // Re-initialize fresh schema
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_name TEXT NOT NULL DEFAULT 'J.P. College of Engineering',
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        address TEXT NOT NULL DEFAULT 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852',
        logo_url TEXT DEFAULT '/logo.png',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        department_id INTEGER,
        first_login INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        faculty_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        designation TEXT NOT NULL,
        phone TEXT,
        department_id INTEGER DEFAULT 1
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        reg_no TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        dob DATE,
        gender TEXT,
        year INTEGER NOT NULL,
        semester INTEGER DEFAULT 5,
        section TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        parent_name TEXT,
        parent_phone TEXT,
        department_id INTEGER DEFAULT 1,
        photo_url TEXT DEFAULT ''
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT UNIQUE NOT NULL,
        course_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        credits INTEGER DEFAULT 3,
        department_id INTEGER DEFAULT 1,
        faculty_id INTEGER,
        is_active INTEGER DEFAULT 1
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        department_id INTEGER DEFAULT 1,
        date DATE NOT NULL,
        period INTEGER DEFAULT 1,
        status TEXT NOT NULL
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_name TEXT NOT NULL,
        course_id INTEGER NOT NULL,
        department_id INTEGER DEFAULT 1,
        max_marks INTEGER DEFAULT 100,
        exam_date DATE
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        department_id INTEGER DEFAULT 1,
        internal_1 REAL DEFAULT 0,
        internal_2 REAL DEFAULT 0,
        internal_3 REAL DEFAULT 0,
        assignment_score REAL DEFAULT 0,
        attendance_pct REAL DEFAULT 0,
        past_gpa REAL DEFAULT 7.0,
        grade TEXT DEFAULT 'B'
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS semester_marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        department_id INTEGER DEFAULT 1,
        semester_score REAL DEFAULT 0,
        grade TEXT DEFAULT 'B',
        credits INTEGER DEFAULT 3,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        department_id INTEGER DEFAULT 1,
        exam_term TEXT DEFAULT 'Internal Cumulative',
        predicted_result TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        pass_probability REAL NOT NULL,
        risk_level TEXT NOT NULL,
        recommended_action TEXT,
        focus_areas TEXT,
        model_version TEXT DEFAULT 'Logistic Regression v1.0',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_id INTEGER DEFAULT 1,
        year INTEGER NOT NULL,
        section TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        period_number INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        faculty_id INTEGER NOT NULL,
        room_no TEXT DEFAULT 'Lab-1'
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        department_id INTEGER DEFAULT 1,
        user_role TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        remarks TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        target_role TEXT DEFAULT 'All',
        author_name TEXT DEFAULT 'HOD Office',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 1. Seed 7 Engineering Departments
    const deptList = [
      { id: 1, name: 'Department of Computer Science and Engineering', code: 'CSE' },
      { id: 2, name: 'Department of Information Technology', code: 'IT' },
      { id: 3, name: 'Department of Electronics and Communication Engineering', code: 'ECE' },
      { id: 4, name: 'Department of Electrical and Electronics Engineering', code: 'EEE' },
      { id: 5, name: 'Department of Mechanical Engineering', code: 'MECH' },
      { id: 6, name: 'Department of Civil Engineering', code: 'CIVIL' },
      { id: 7, name: 'Department of Artificial Intelligence & Data Science', code: 'AI & DS' }
    ];

    for (const d of deptList) {
      await db.runAsync(
        `INSERT INTO departments (id, college_name, name, code, address) VALUES (?, ?, ?, ?, ?)`,
        [d.id, 'J.P. College of Engineering', d.name, d.code, 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852']
      );
    }
    console.log('✓ Seeded 7 Engineering Departments (CSE, IT, ECE, EEE, MECH, CIVIL, AI & DS).');

    // 2. Seed Super Admin User (login_id: SUPER_ADMIN)
    await db.runAsync(
      `INSERT INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, ?, ?, 0)`,
      ['SUPER_ADMIN', 'superadmin@jpcoe.ac.in', passwordHash, 'superadmin', 1]
    );
    console.log('✓ Seeded Super Admin user (SUPER_ADMIN / 123).');

    // 3. Seed HODs, Faculty, Courses & Students for each department
    const sampleNames = ['Arun', 'Bala', 'Chitra', 'Deepak', 'Elango', 'Gita', 'Hari', 'Indu', 'Jaya', 'Kavya', 'Lokesh', 'Manoj', 'Naveen', 'Oviya'];
    const sampleLasts = ['Kumar', 'Rajan', 'Devi', 'Prabhu', 'Mani', 'Shree', 'Vasanth', 'Priya', 'Sundar'];

    for (const d of deptList) {
      const deptId = d.id;
      const deptCode = d.code.replace(/[^A-Z]/g, '');

      // HOD user
      const hodLoginId = `FAC_HOD_${deptCode}`;
      const hodEmail = `hod_${deptCode.toLowerCase()}@jpcoe.ac.in`;
      const hodUserRes = await db.runAsync(
        `INSERT INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, 'hod', ?, 1)`,
        [hodLoginId, hodEmail, passwordHash, deptId]
      );
      await db.runAsync(
        `INSERT INTO faculty (user_id, faculty_id, name, email, designation, phone, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [hodUserRes.lastID, hodLoginId, `Dr. ${sampleNames[deptId % sampleNames.length]} HOD (${d.code})`, hodEmail, 'Professor & Head of Department', `+91 94431 2345${deptId}`, deptId]
      );

      // 2 Faculty per dept
      const facIds = [];
      for (let fIdx = 1; fIdx <= 2; fIdx++) {
        const facCode = `FAC_${deptCode}_0${fIdx}`;
        const facEmail = `faculty_${deptCode.toLowerCase()}${fIdx}@jpcoe.ac.in`;
        const fName = `Prof. ${sampleNames[(deptId + fIdx) % sampleNames.length]} ${sampleLasts[fIdx % sampleLasts.length]}`;
        const uRes = await db.runAsync(
          `INSERT INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, 'faculty', ?, 1)`,
          [facCode, facEmail, passwordHash, deptId]
        );
        const fRes = await db.runAsync(
          `INSERT INTO faculty (user_id, faculty_id, name, email, designation, phone, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uRes.lastID, facCode, fName, facEmail, fIdx === 1 ? 'Associate Professor' : 'Assistant Professor', `+91 98421 11${deptId}${fIdx}`, deptId]
        );
        facIds.push(fRes.lastID);
      }

      // 3 Subjects per dept across Years/Semesters
      const courseSpecs = [
        { code: `${deptCode}301`, name: `${d.code} Core Engineering Concepts`, year: 2, semester: 3, credits: 4, fac: facIds[0] },
        { code: `${deptCode}401`, name: `Advanced ${d.code} Systems`, year: 3, semester: 5, credits: 3, fac: facIds[1] },
        { code: `${deptCode}501`, name: `${d.code} Laboratory & Project Work`, year: 4, semester: 7, credits: 2, fac: facIds[0] }
      ];

      const courseDbIds = [];
      for (const c of courseSpecs) {
        const cRes = await db.runAsync(
          `INSERT INTO courses (course_code, course_name, year, semester, credits, department_id, faculty_id, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [c.code, c.name, c.year, c.semester, c.credits, deptId, c.fac]
        );
        courseDbIds.push(cRes.lastID);
      }

      // 6 Students per dept
      for (let sIdx = 1; sIdx <= 6; sIdx++) {
        const regNo = `23${deptCode}${String(sIdx).padStart(3, '0')}`;
        const sName = `${sampleNames[(deptId + sIdx) % sampleNames.length]} ${sampleLasts[sIdx % sampleLasts.length]}`;
        const sEmail = `student_${deptCode.toLowerCase()}${sIdx}@jpcoe.ac.in`;

        const sUserRes = await db.runAsync(
          `INSERT INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, 'student', ?, 1)`,
          [regNo, sEmail, passwordHash, deptId]
        );

        const stRes = await db.runAsync(
          `INSERT INTO students (user_id, reg_no, name, email, dob, gender, year, semester, section, phone, address, parent_name, parent_phone, department_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [sUserRes.lastID, regNo, sName, sEmail, '2003-05-15', sIdx % 2 === 0 ? 'Female' : 'Male', 3, 5, 'A', `+91 98401 ${deptId}0${sIdx}`, 'Tenkasi, Tamil Nadu', `Mr. ${sampleLasts[sIdx % sampleLasts.length]}`, `+91 94401 ${deptId}0${sIdx}`, deptId]
        );

        // Internal Marks & Semester Marks for Course 2 (Sem 5)
        const isRisk = (sIdx === 2);
        const i1 = isRisk ? 30 : 75 + sIdx * 2;
        const i2 = isRisk ? 35 : 80 + sIdx;
        const i3 = isRisk ? 28 : 78 + sIdx;
        const assign = isRisk ? 45 : 85;
        const att = isRisk ? 60 : 88;

        await db.runAsync(
          `INSERT INTO marks (student_id, course_id, department_id, internal_1, internal_2, internal_3, assignment_score, attendance_pct, past_gpa, grade)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [stRes.lastID, courseDbIds[1], deptId, i1, i2, i3, assign, att, 7.5, isRisk ? 'RA' : 'A+']
        );

        await db.runAsync(
          `INSERT INTO semester_marks (student_id, course_id, department_id, semester_score, grade, credits)
           VALUES (?, ?, ?, ?, ?, 3)`,
          [stRes.lastID, courseDbIds[1], deptId, isRisk ? 42 : 84, isRisk ? 'RA' : 'A+']
        );

        // Attendance
        for (let day = 1; day <= 5; day++) {
          await db.runAsync(
            `INSERT INTO attendance (student_id, course_id, department_id, date, period, status) VALUES (?, ?, ?, ?, 1, ?)`,
            [stRes.lastID, courseDbIds[1], deptId, `2026-07-0${day}`, isRisk && day % 2 === 0 ? 'Absent' : 'Present']
          );
        }

        // ML Predictions
        await db.runAsync(
          `INSERT INTO predictions (student_id, department_id, exam_term, predicted_result, confidence_score, pass_probability, risk_level, recommended_action, focus_areas)
           VALUES (?, ?, 'Internal Cumulative', ?, ?, ?, ?, ?, ?)`,
          [
            stRes.lastID,
            deptId,
            isRisk ? 'Fail' : 'Pass',
            isRisk ? 78.5 : 92.4,
            isRisk ? 21.5 : 92.4,
            isRisk ? 'High Risk' : 'Low Risk',
            isRisk ? 'Immediate counseling and remedial sessions required.' : 'Good standing. Maintain performance.',
            isRisk ? 'Internal 1 core concepts, Attendance shortage' : 'None'
          ]
        );
      }

      // Timetable
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      for (const day of days) {
        for (let p = 1; p <= 4; p++) {
          const cId = courseDbIds[p % courseDbIds.length];
          const fId = facIds[p % facIds.length];
          await db.runAsync(
            `INSERT INTO timetable (department_id, year, section, day_of_week, period_number, course_id, faculty_id, room_no)
             VALUES (?, 3, 'A', ?, ?, ?, ?, ?)`,
            [deptId, day, p, cId, fId, `${d.code}-Hall-${p}`]
          );
        }
      }

      // Notices
      await db.runAsync(
        `INSERT INTO notices (department_id, title, content, category, target_role, author_name) VALUES (?, ?, ?, ?, 'All', ?)`,
        [deptId, `${d.code} Department Academic Announcement`, `Welcome to ${d.name}. Internal Assessments start next week.`, 'Academic', `HOD ${d.code}`]
      );
    }

    console.log('-------------------------------------------------------------------------');
    console.log('--- Database Seeding Completed Successfully! Default Password: 123 ---');
    console.log('-------------------------------------------------------------------------');
    console.log('Super Admin Credentials: SUPER_ADMIN / 123');
    console.log('CSE HOD Credentials:     FAC_HOD_CSE / 123');
    console.log('ECE HOD Credentials:     FAC_HOD_ECE / 123');
    console.log('CSE Student Credentials: 23CSE001 / 123');
    console.log('ECE Student Credentials: 23ECE001 / 123');
    console.log('-------------------------------------------------------------------------');
  } catch (err) {
    console.error('Seeding Error:', err);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
