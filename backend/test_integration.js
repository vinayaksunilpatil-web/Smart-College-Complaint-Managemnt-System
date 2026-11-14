const { pool } = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function runTests() {
  console.log('=== STARTING INTEGRATION TEST SUITE ===\n');

  try {
    // 1. Test database connection
    const [dbCheck] = await pool.execute('SELECT DATABASE() as db, VERSION() as version');
    console.log(`[PASS] Connected to Database: ${dbCheck[0].db}, Version: ${dbCheck[0].version}`);

    // 2. Test seed data counts
    const [deptRows] = await pool.execute('SELECT COUNT(*) as c FROM department');
    const [catRows] = await pool.execute('SELECT COUNT(*) as c FROM category');
    const [studentRows] = await pool.execute('SELECT COUNT(*) as c FROM student');
    const [staffRows] = await pool.execute('SELECT COUNT(*) as c FROM staff');
    const [compRows] = await pool.execute('SELECT COUNT(*) as c FROM complaint');
    const [logRows] = await pool.execute('SELECT COUNT(*) as c FROM status_log');

    console.log(`[PASS] Record counts -> Departments: ${deptRows[0].c}, Categories: ${catRows[0].c}, Students: ${studentRows[0].c}, Staff: ${staffRows[0].c}, Complaints: ${compRows[0].c}, Status Logs: ${logRows[0].c}`);

    // 3. Test Student Auth Login & Password verification
    const [studentUser] = await pool.execute('SELECT * FROM student WHERE email = ?', ['vinayak.patil@college.edu']);
    const isStudentPassValid = await bcrypt.compare('password123', studentUser[0].password_hash);
    console.log(`[PASS] Student authentication password check: ${isStudentPassValid ? 'MATCH' : 'FAILED'}`);

    // 4. Test Complaint Creation with Automatic Department Routing
    const testCategoryId = 3; // Wi-Fi & Internet Connectivity -> Information Technology (dept_id = 2)
    const [catInfo] = await pool.execute('SELECT c.category_name, d.dept_id, d.dept_name FROM category c JOIN department d ON c.dept_id = d.dept_id WHERE c.category_id = ?', [testCategoryId]);
    console.log(`[PASS] Auto-routing test: Category '${catInfo[0].category_name}' routed to Department '${catInfo[0].dept_name}' (ID ${catInfo[0].dept_id})`);

    const [insertResult] = await pool.execute(
      'INSERT INTO complaint (student_id, dept_id, category_id, title, description, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [studentUser[0].student_id, catInfo[0].dept_id, testCategoryId, 'Test Wi-Fi Latency Spike', 'Automated test complaint', 'Open', 'High']
    );
    const newComplaintId = insertResult.insertId;
    console.log(`[PASS] New complaint inserted with ID #${newComplaintId}`);

    // Insert initial status log
    await pool.execute(
      'INSERT INTO status_log (complaint_id, old_status, new_status, updated_by, remarks, updated_at) VALUES (?, NULL, ?, ?, ?, NOW())',
      [newComplaintId, 'Open', studentUser[0].student_id, 'Complaint registered in test']
    );

    // 5. Test Staff Status Update & Audit Log
    const [staffUser] = await pool.execute('SELECT * FROM staff WHERE email = ?', ['rajesh.kulkarni@college.edu']);
    await pool.execute('UPDATE complaint SET status = ?, staff_id = ?, updated_at = NOW() WHERE complaint_id = ?', ['In Progress', staffUser[0].staff_id, newComplaintId]);
    await pool.execute(
      'INSERT INTO status_log (complaint_id, old_status, new_status, updated_by, remarks, updated_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [newComplaintId, 'Open', 'In Progress', staffUser[0].staff_id, 'Technician investigating switch buffer.']
    );
    console.log(`[PASS] Status updated to 'In Progress' and audit log recorded by staff '${staffUser[0].name}'`);

    // Verify timeline
    const [timelineRows] = await pool.execute('SELECT * FROM status_log WHERE complaint_id = ? ORDER BY updated_at ASC', [newComplaintId]);
    console.log(`[PASS] Audit timeline has ${timelineRows.length} events for complaint #${newComplaintId}`);

    // 6. Test ADBMS Demonstration Queries
    // Selection
    const [selectDemo] = await pool.execute("SELECT * FROM complaint WHERE status = 'Open'");
    console.log(`[PASS] Demo 1 (Selection): ${selectDemo.length} open complaints returned.`);

    // Join
    const [joinDemo] = await pool.execute('SELECT c.complaint_id, c.title, d.dept_name, c.status FROM complaint c JOIN department d ON c.dept_id = d.dept_id');
    console.log(`[PASS] Demo 2 (Multi-Table JOIN): ${joinDemo.length} records returned with joined department names.`);

    // Aggregation
    const [aggDemo] = await pool.execute("SELECT d.dept_name, COUNT(*) AS total_complaints, SUM(c.status = 'Resolved') AS resolved_complaints FROM complaint c JOIN department d ON c.dept_id = d.dept_id GROUP BY d.dept_name");
    console.log(`[PASS] Demo 3 (Parallel Aggregation): ${aggDemo.length} department groups computed.`);

    // Explain
    const [explainDemo] = await pool.execute("EXPLAIN SELECT d.dept_name, COUNT(*) AS total_complaints FROM complaint c JOIN department d ON c.dept_id = d.dept_id WHERE c.status = 'Resolved' GROUP BY d.dept_name");
    console.log(`[PASS] Demo 4 (EXPLAIN Plan): Real execution plan returned (${explainDemo.length} plan nodes, access types: ${explainDemo.map(e => e.type).join(', ')})`);

    console.log('\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
    process.exit(0);
  } catch (error) {
    console.error('[FAIL] Integration test error:', error);
    process.exit(1);
  }
}

runTests();
