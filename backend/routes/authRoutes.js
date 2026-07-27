const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authenticateToken, authorizeRoles, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login - Login by Register Number (Students) or Employee ID (Faculty/HOD)
router.post('/login', async (req, res) => {
  try {
    const { login_id, email, password } = req.body;
    const identifier = (login_id || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Register Number / Employee ID and password are required.' });
    }

    // Search by login_id OR email
    const user = await db.getAsync(
      `SELECT * FROM users WHERE login_id = ? OR LOWER(email) = ?`,
      [identifier, identifier.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User account not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Fetch profile details based on role
    let profile = null;
    if (user.role === 'hod' || user.role === 'faculty') {
      profile = await db.getAsync(`SELECT * FROM faculty WHERE user_id = ?`, [user.id]);
    } else if (user.role === 'student') {
      profile = await db.getAsync(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
    }

    const token = jwt.sign(
      {
        id: user.id,
        login_id: user.login_id,
        email: user.email,
        role: user.role,
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
        first_login: Boolean(user.first_login),
        profile
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getAsync(`SELECT id, login_id, email, role, first_login, created_at FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'hod' || user.role === 'faculty') {
      profile = await db.getAsync(`SELECT * FROM faculty WHERE user_id = ?`, [user.id]);
    } else if (user.role === 'student') {
      profile = await db.getAsync(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
    }

    return res.json({ user: { ...user, first_login: Boolean(user.first_login), profile } });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching user profile.' });
  }
});

// POST /api/auth/change-password - Change Password (clears first_login flag)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 3) {
      return res.status(400).json({ message: 'Password must be at least 3 characters long.' });
    }

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
});

// POST /api/auth/reset-password/:id - HOD resets a user's password back to '123' and sets first_login = 1
router.post('/reset-password/:id', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    const defaultHash = await bcrypt.hash('123', 10);
    await db.runAsync(
      `UPDATE users SET password_hash = ?, first_login = 1 WHERE id = ?`,
      [defaultHash, req.params.id]
    );

    return res.json({ message: 'User password reset back to default password "123". Forced password change enabled.' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
});

// POST /api/auth/create-user (HOD Only - default password '123')
router.post('/create-user', authenticateToken, authorizeRoles('hod'), async (req, res) => {
  try {
    const { login_id, email, password, role, name, designation, phone, reg_no, dob, gender, year, section, address, parent_name, parent_phone } = req.body;

    const userLoginId = (login_id || reg_no || email).trim();

    if (!userLoginId || !role || !name) {
      return res.status(400).json({ message: 'Register Number / Employee ID, role, and name are required.' });
    }

    const existingUser = await db.getAsync(`SELECT id FROM users WHERE login_id = ?`, [userLoginId]);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this Register Number / Employee ID already exists.' });
    }

    const initialPassword = password || '123';
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const userEmail = email || `${userLoginId.toLowerCase()}@jpcoe.ac.in`;

    const uRes = await db.runAsync(
      `INSERT INTO users (login_id, email, password_hash, role, first_login) VALUES (?, ?, ?, ?, 1)`,
      [userLoginId, userEmail, passwordHash, role]
    );
    const userId = uRes.lastID;

    if (role === 'faculty' || role === 'hod') {
      await db.runAsync(
        `INSERT INTO faculty (user_id, faculty_id, name, email, designation, phone) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, userLoginId, name, userEmail, designation || 'Assistant Professor', phone || '']
      );
    } else if (role === 'student') {
      await db.runAsync(
        `INSERT INTO students (user_id, reg_no, name, email, dob, gender, year, section, phone, address, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, userLoginId, name, userEmail, dob || '2003-01-01', gender || 'Male', year || 3, section || 'A', phone || '', address || '', parent_name || '', parent_phone || '']
      );
    }

    return res.status(201).json({ message: `${role.toUpperCase()} user created successfully with default password "123".` });
  } catch (err) {
    console.error('Create User Error:', err);
    return res.status(500).json({ message: 'Failed to create user.' });
  }
});

module.exports = router;
