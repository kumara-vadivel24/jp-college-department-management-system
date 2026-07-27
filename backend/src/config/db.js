const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../department_erp.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
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
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        address TEXT NOT NULL DEFAULT 'Tenkasi Road, Agarakattu, Ayikudi, Tamil Nadu 627852',
        logo_url TEXT DEFAULT '/logo.png',
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Helper function to safely add missing columns to existing SQLite tables
    const addColumnIfMissing = async (table, column, typeDef) => {
      try {
        const info = await db.allAsync(`PRAGMA table_info(${table})`);
        const exists = info.some(col => col.name === column);
        if (!exists) {
          await db.runAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}`);
        }
      } catch (e) {}
    };

    // 2. Users Table
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
    await addColumnIfMissing('users', 'department_id', 'INTEGER DEFAULT 1');

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
        department_id INTEGER DEFAULT 1
      );
    `);
    await addColumnIfMissing('faculty', 'department_id', 'INTEGER DEFAULT 1');

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
    await addColumnIfMissing('students', 'department_id', 'INTEGER DEFAULT 1');
    await addColumnIfMissing('students', 'semester', 'INTEGER DEFAULT 5');

    // 5. Courses Table
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
    await addColumnIfMissing('courses', 'credits', 'INTEGER DEFAULT 3');
    await addColumnIfMissing('courses', 'department_id', 'INTEGER DEFAULT 1');
    await addColumnIfMissing('courses', 'is_active', 'INTEGER DEFAULT 1');

    // 6. Attendance Table
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
    await addColumnIfMissing('attendance', 'department_id', 'INTEGER DEFAULT 1');

    // 7. Exams Table
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
    await addColumnIfMissing('exams', 'department_id', 'INTEGER DEFAULT 1');

    // 8. Internal Marks Table
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
    await addColumnIfMissing('marks', 'department_id', 'INTEGER DEFAULT 1');

    // 9. Semester Marks Table
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
    await addColumnIfMissing('semester_marks', 'department_id', 'INTEGER DEFAULT 1');

    // 10. Predictions Table
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
    await addColumnIfMissing('predictions', 'department_id', 'INTEGER DEFAULT 1');

    // 11. Timetable Table
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
    await addColumnIfMissing('timetable', 'department_id', 'INTEGER DEFAULT 1');

    // 12. Leaves Table
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
    await addColumnIfMissing('leaves', 'department_id', 'INTEGER DEFAULT 1');

    // 13. Notices Table
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
    await addColumnIfMissing('notices', 'department_id', 'INTEGER');

    // Indexes for fast querying
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_faculty_user_id ON faculty(user_id);`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_faculty_dept ON faculty(department_id);`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_courses_dept ON courses(department_id);`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);`);

    console.log('Database tables & multi-department indexes initialized successfully.');
  });
}

initSchema();

module.exports = db;
