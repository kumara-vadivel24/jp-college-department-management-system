const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'department_erp.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at', DB_PATH);
  }
});

// Promisified helper methods for database operations
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initSchema() {
  db.serialize(async () => {
    // 1. Departments Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_name TEXT NOT NULL DEFAULT 'J.P. College of Engineering',
        name TEXT NOT NULL DEFAULT 'Department of Computer Science',
        code TEXT NOT NULL DEFAULT 'CSE',
        address TEXT NOT NULL DEFAULT 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852',
        logo_url TEXT DEFAULT '/logo.png'
      );
    `);

    // 2. Users Table with login_id and first_login flag
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('hod', 'faculty', 'student')) NOT NULL,
        first_login INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Faculty Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS faculty (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        faculty_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        designation TEXT NOT NULL,
        phone TEXT,
        department_id INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 4. Students Table
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
        section TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        parent_name TEXT,
        parent_phone TEXT,
        photo_url TEXT DEFAULT '',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 5. Courses Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT UNIQUE NOT NULL,
        course_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        faculty_id INTEGER,
        FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
      );
    `);

    // 6. Attendance Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        date DATE NOT NULL,
        period INTEGER DEFAULT 1,
        status TEXT CHECK(status IN ('Present', 'Absent', 'On Duty')) NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);

    // 7. Exams Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_name TEXT NOT NULL,
        course_id INTEGER NOT NULL,
        max_marks INTEGER DEFAULT 100,
        exam_date DATE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);

    // 8. Internal Marks Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        internal_1 REAL DEFAULT 0,
        internal_2 REAL DEFAULT 0,
        internal_3 REAL DEFAULT 0,
        assignment_score REAL DEFAULT 0,
        attendance_pct REAL DEFAULT 0,
        past_gpa REAL DEFAULT 7.0,
        grade TEXT DEFAULT 'B',
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id)
      );
    `);

    // 9. Semester Marks Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS semester_marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        semester_score REAL DEFAULT 0,
        grade TEXT DEFAULT 'B',
        credits INTEGER DEFAULT 3,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE(student_id, course_id)
      );
    `);

    // 10. Predictions Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_term TEXT DEFAULT 'Internal Cumulative',
        predicted_result TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        pass_probability REAL NOT NULL,
        risk_level TEXT NOT NULL,
        recommended_action TEXT,
        focus_areas TEXT,
        model_version TEXT DEFAULT 'Logistic Regression v1.0',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      );
    `);

    // 11. Timetable Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        section TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        period_number INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        faculty_id INTEGER NOT NULL,
        room_no TEXT DEFAULT 'Lab-1',
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
      );
    `);

    // 12. Leaves Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_role TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
        remarks TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 13. Notices Table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        target_role TEXT DEFAULT 'All',
        author_name TEXT DEFAULT 'HOD Office',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('All database tables (including login_id & semester_marks) initialized successfully.');
  });
}

initSchema();

module.exports = db;
