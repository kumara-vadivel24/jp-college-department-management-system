const db = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const totalStudents = await db.getAsync(`SELECT COUNT(*) as count FROM students`);
    const totalFaculty = await db.getAsync(`SELECT COUNT(*) as count FROM faculty`);
    const totalCourses = await db.getAsync(`SELECT COUNT(*) as count FROM courses`);

    const atRiskCount = await db.getAsync(`
      SELECT COUNT(*) as count FROM predictions WHERE predicted_result = 'Fail' OR risk_level = 'High Risk'
    `);

    const passCount = await db.getAsync(`
      SELECT COUNT(*) as count FROM predictions WHERE predicted_result = 'Pass' AND risk_level = 'Low Risk'
    `);

    const medRiskCount = await db.getAsync(`
      SELECT COUNT(*) as count FROM predictions WHERE risk_level = 'Medium Risk'
    `);

    const attendanceStats = await db.getAsync(`
      SELECT
        SUM(CASE WHEN status IN ('Present', 'On Duty') THEN 1 ELSE 0 END) as present,
        COUNT(*) as total
      FROM attendance
    `);

    const overallAttendance = attendanceStats && attendanceStats.total > 0
      ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
      : 85;

    const riskDistribution = [
      { name: 'Pass (Low Risk)', value: passCount ? passCount.count : 30, color: '#10b981' },
      { name: 'Medium Risk', value: medRiskCount ? medRiskCount.count : 4, color: '#f59e0b' },
      { name: 'High Risk (At Risk)', value: atRiskCount ? atRiskCount.count : 6, color: '#ef4444' }
    ];

    const subjectAverages = await db.allAsync(`
      SELECT c.course_code, c.course_name,
        ROUND(AVG(m.internal_1), 1) as avg_internal_1,
        ROUND(AVG(m.internal_2), 1) as avg_internal_2,
        ROUND(AVG(m.internal_3), 1) as avg_internal_3,
        ROUND(AVG(m.attendance_pct), 1) as avg_attendance
      FROM courses c
      LEFT JOIN marks m ON c.id = m.course_id
      GROUP BY c.id
    `);

    return res.json({
      summary: {
        total_students: totalStudents ? totalStudents.count : 0,
        total_faculty: totalFaculty ? totalFaculty.count : 0,
        total_courses: totalCourses ? totalCourses.count : 0,
        at_risk_students: atRiskCount ? atRiskCount.count : 0,
        overall_attendance: overallAttendance
      },
      risk_distribution: riskDistribution,
      subject_averages: subjectAverages
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    return res.status(500).json({ message: 'Error compiling analytics report.' });
  }
};
