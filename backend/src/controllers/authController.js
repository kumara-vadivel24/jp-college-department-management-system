const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Password complexity regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

exports.login = async (req, res) => {
  try {
    const { login_id, email, password } = req.body;
    const identifier = (login_id || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Register Number / Employee ID and password are required.' });
    }

    const user = await db.getAsync(
      `SELECT u.*, d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.login_id = ? OR LOWER(u.email) = ?`,
      [identifier, identifier.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User account not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    let profile = null;
    if (user.role === 'hod' || user.role === 'faculty') {
      profile = await db.getAsync(`SELECT * FROM faculty WHERE user_id = ?`, [user.id]);
    } else if (user.role === 'student') {
      profile = await db.getAsync(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
    }

    const deptId = user.department_id || (profile ? profile.department_id : 1);
    const deptInfo = await db.getAsync(`SELECT id, name, code, college_name FROM departments WHERE id = ?`, [deptId || 1]);

    const token = jwt.sign(
      {
        id: user.id,
        login_id: user.login_id,
        email: user.email,
        role: user.role,
        department_id: deptId,
        department_code: deptInfo ? deptInfo.code : 'CSE',
        department_name: deptInfo ? deptInfo.name : 'Department of Computer Science',
        first_login: Boolean(user.first_login),
        profileId: profile ? profile.id : null,
        name: profile ? profile.name : user.login_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        login_id: user.login_id,
        email: user.email,
        role: user.role,
        department_id: deptId,
        department_code: deptInfo ? deptInfo.code : 'CSE',
        department_name: deptInfo ? deptInfo.name : 'Department of Computer Science',
        first_login: Boolean(user.first_login),
        profile
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.getAsync(`SELECT id, login_id, email, role, department_id, first_login, created_at FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'hod' || user.role === 'faculty') {
      profile = await db.getAsync(`SELECT * FROM faculty WHERE user_id = ?`, [user.id]);
    } else if (user.role === 'student') {
      profile = await db.getAsync(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
    }

    const deptId = user.department_id || (profile ? profile.department_id : 1);
    const deptInfo = await db.getAsync(`SELECT id, name, code, college_name FROM departments WHERE id = ?`, [deptId || 1]);

    return res.json({
      user: {
        ...user,
        department_id: deptId,
        department_code: deptInfo ? deptInfo.code : 'CSE',
        department_name: deptInfo ? deptInfo.name : 'Department of Computer Science',
        first_login: Boolean(user.first_login),
        profile
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching user profile.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    const user = await db.getAsync(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    // 1. Verify current password
    const validCurrent = await bcrypt.compare(current_password, user.password_hash);
    if (!validCurrent) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // 2. Verify new password isn't default '123'
    if (new_password === '123') {
      return res.status(400).json({ message: 'New password cannot be the default password "123".' });
    }

    // 3. Confirm password match
    if (confirm_password && new_password !== confirm_password) {
      return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    // 4. Complexity validation
    if (!PASSWORD_COMPLEXITY_REGEX.test(new_password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
      });
    }

    // 5. Hash & Save
    const passwordHash = await bcrypt.hash(new_password, 10);

    await db.runAsync(
      `UPDATE users SET password_hash = ?, first_login = 0 WHERE id = ?`,
      [passwordHash, req.user.id]
    );

    return res.json({ message: 'Password changed successfully! You may now access your dashboard.' });
  } catch (err) {
    console.error('Change Password Error:', err);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const defaultHash = await bcrypt.hash('123', 10);
    await db.runAsync(
      `UPDATE users SET password_hash = ?, first_login = 1 WHERE id = ?`,
      [defaultHash, req.params.id]
    );

    return res.json({ message: 'User password reset back to default password "123". Forced password change enabled on next login.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { login_id, email, password, role, name, designation, phone, reg_no, dob, gender, year, section, address, parent_name, parent_phone, department_id } = req.body;

    const userLoginId = (login_id || reg_no || email || '').trim();

    if (!userLoginId || !role || !name) {
      return res.status(400).json({ message: 'Register Number / Employee ID, role, and name are required.' });
    }

    const deptId = req.user.role === 'superadmin' ? (department_id || req.user.department_id || 1) : req.user.department_id;

    const existingUser = await db.getAsync(`SELECT id FROM users WHERE login_id = ?`, [userLoginId]);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this Register Number / Employee ID already exists.' });
    }

    const initialPassword = password || '123';
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const userEmail = email || `${userLoginId.toLowerCase()}@jpcoe.ac.in`;

    const uRes = await db.runAsync(
      `INSERT INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, ?, ?, 1)`,
      [userLoginId, userEmail, passwordHash, role, deptId]
    );
    const userId = uRes.lastID;

    if (role === 'faculty' || role === 'hod') {
      await db.runAsync(
        `INSERT INTO faculty (user_id, faculty_id, name, email, designation, phone, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, userLoginId, name, userEmail, designation || 'Assistant Professor', phone || '', deptId]
      );
    } else if (role === 'student') {
      await db.runAsync(
        `INSERT INTO students (user_id, reg_no, name, email, dob, gender, year, section, phone, address, parent_name, parent_phone, department_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, userLoginId, name, userEmail, dob || '2003-01-01', gender || 'Male', year || 3, section || 'A', phone || '', address || '', parent_name || '', parent_phone || '', deptId]
      );
    }

    return res.status(201).json({ message: `${role.toUpperCase()} user created successfully with default password "123".` });
  } catch (err) {
    console.error('Create User Error:', err);
    return res.status(500).json({ message: 'Failed to create user.' });
  }
};
