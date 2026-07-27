const db = require('../config/db');

exports.getLeaves = async (req, res) => {
  try {
    let leaves = [];
    if (req.user.role === 'hod') {
      leaves = await db.allAsync(`SELECT * FROM leaves ORDER BY created_at DESC`);
    } else {
      leaves = await db.allAsync(`SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id]);
    }
    return res.json(leaves);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching leave applications.' });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { start_date, end_date, reason } = req.body;
    if (!start_date || !end_date || !reason) {
      return res.status(400).json({ message: 'Start date, End date, and Reason are required.' });
    }

    const name = req.user.name || req.user.email;

    await db.runAsync(
      `INSERT INTO leaves (user_id, user_role, applicant_name, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [req.user.id, req.user.role, name, start_date, end_date, reason]
    );

    return res.status(201).json({ message: 'Leave application submitted successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Error submitting leave request.' });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
    }

    await db.runAsync(
      `UPDATE leaves SET status = ?, remarks = ? WHERE id = ?`,
      [status, remarks || '', req.params.id]
    );

    return res.json({ message: `Leave application status updated to ${status}.` });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating leave status.' });
  }
};
