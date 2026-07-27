const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await db.getAsync(
      `SELECT f.*, d.code as department_code, d.name as department_name, u.email
       FROM faculty f
       JOIN users u ON f.user_id = u.id
       LEFT JOIN departments d ON f.department_id = d.id
       WHERE f.user_id = ?`,
      [req.user.id]
    );
    if (!profile) return res.status(404).json({ message: 'Faculty profile not found.' });
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching faculty profile.' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { phone, address } = req.body;
    await db.runAsync(
      `UPDATE faculty SET phone = ?, address = ? WHERE user_id = ?`,
      [phone || '', address || '', req.user.id]
    );
    return res.json({ message: 'Profile updated successfully!' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};

exports.getFaculty = async (req, res) => {
  try {
    const { department_id } = req.query;
    const targetDeptId = req.user.role === 'superadmin' ? (department_id || null) : req.user.department_id;

    let query = `
      SELECT f.*, d.code as department_code, d.name as department_name, u.email
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN departments d ON f.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (targetDeptId) {
      query += ` AND f.department_id = ?`;
      params.push(targetDeptId);
    }

    query += ` ORDER BY f.name ASC`;

    const facultyList = await db.allAsync(query, params);
    return res.json(facultyList);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching faculty list.' });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const { faculty_id, name, email, designation, phone, department_id } = req.body;
    if (!name || !email || !faculty_id) {
      return res.status(400).json({ message: 'Faculty ID, Name, and Email are required.' });
    }

    const deptId = req.user.role === 'superadmin' ? (department_id || req.user.department_id || 1) : req.user.department_id;
    const passwordHash = await bcrypt.hash('123', 10);
    const uRes = await db.runAsync(
      `INSERT INTO users (login_id, email, password_hash, role, department_id, first_login) VALUES (?, ?, ?, 'faculty', ?, 1)`,
      [faculty_id, email, passwordHash, deptId]
    );
    const fRes = await db.runAsync(
      `INSERT INTO faculty (user_id, faculty_id, name, email, designation, phone, department_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uRes.lastID, faculty_id, name, email, designation || 'Assistant Professor', phone || '', deptId]
    );

    return res.status(201).json({ message: 'Faculty created successfully with default password "123".', facultyId: fRes.lastID });
  } catch (err) {
    return res.status(500).json({ message: 'Error creating faculty record.' });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const fac = await db.getAsync(`SELECT user_id, department_id FROM faculty WHERE id = ?`, [req.params.id]);
    if (fac) {
      if (req.user.role !== 'superadmin' && fac.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'Access denied. Cannot delete faculty outside assigned department.' });
      }
      await db.runAsync(`DELETE FROM users WHERE id = ?`, [fac.user_id]);
      await db.runAsync(`DELETE FROM faculty WHERE id = ?`, [req.params.id]);
    }
    return res.json({ message: 'Faculty member removed.' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting faculty record.' });
  }
};
