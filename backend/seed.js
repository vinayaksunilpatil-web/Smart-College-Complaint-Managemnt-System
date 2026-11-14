const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User       = require('./models/User');
const Department = require('./models/Department');
const Category   = require('./models/Category');
const Complaint  = require('./models/Complaint');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_complaint_db';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Category.deleteMany({}),
    Complaint.deleteMany({})
  ]);
  console.log('Cleared existing data.');

  // Seed Departments
  const departments = await Department.insertMany([
    { dept_name: 'Computer Engineering',   location: 'Block A' },
    { dept_name: 'Information Technology', location: 'Block B' },
    { dept_name: 'Civil Engineering',      location: 'Block C' },
    { dept_name: 'Electronics & Telecom',  location: 'Block D' },
    { dept_name: 'Administration',          location: 'Main Building' }
  ]);

  const deptMap = {};
  departments.forEach(d => { deptMap[d.dept_name] = d._id; });
  console.log('Departments seeded:', departments.length);

  // Seed Categories
  const categories = await Category.insertMany([
    { category_name: 'Lab Equipment Issue',    dept_id: deptMap['Computer Engineering'],   sla_hours: 24 },
    { category_name: 'Software / System Issue',dept_id: deptMap['Computer Engineering'],   sla_hours: 48 },
    { category_name: 'Network / WiFi Problem', dept_id: deptMap['Information Technology'], sla_hours: 12 },
    { category_name: 'Server Downtime',        dept_id: deptMap['Information Technology'], sla_hours: 6  },
    { category_name: 'Building Maintenance',   dept_id: deptMap['Civil Engineering'],       sla_hours: 72 },
    { category_name: 'Sanitation & Hygiene',   dept_id: deptMap['Civil Engineering'],       sla_hours: 48 },
    { category_name: 'Electronics Lab Issue',  dept_id: deptMap['Electronics & Telecom'],   sla_hours: 24 },
    { category_name: 'Fee / Finance Issue',    dept_id: deptMap['Administration'],           sla_hours: 72 },
    { category_name: 'Hostel Complaint',       dept_id: deptMap['Administration'],           sla_hours: 24 },
    { category_name: 'Library Issue',          dept_id: deptMap['Administration'],           sla_hours: 48 }
  ]);
  console.log('Categories seeded:', categories.length);

  // Seed Users
  const salt = await bcrypt.genSalt(10);
  const defaultPass = await bcrypt.hash('password123', salt);

  const users = await User.insertMany([
    // Admin
    { name: 'Admin User', email: 'admin@college.edu', password_hash: defaultPass, role: 'admin', dept_id: deptMap['Administration'] },
    // Staff
    { name: 'Dr. Priya Sharma', email: 'priya.cs@college.edu',   password_hash: defaultPass, role: 'staff', dept_id: deptMap['Computer Engineering'] },
    { name: 'Prof. Raj Mehta',  email: 'raj.it@college.edu',    password_hash: defaultPass, role: 'staff', dept_id: deptMap['Information Technology'] },
    { name: 'Mr. Anil Patil',   email: 'anil.civil@college.edu', password_hash: defaultPass, role: 'staff', dept_id: deptMap['Civil Engineering'] },
    // Students
    { name: 'Rahul Desai',      email: 'rahul@student.edu', password_hash: defaultPass, role: 'student', roll_no: 'PRN2021001', phone: '9876543210' },
    { name: 'Sneha Kulkarni',   email: 'sneha@student.edu', password_hash: defaultPass, role: 'student', roll_no: 'PRN2021002', phone: '9876543211' },
    { name: 'Amit Joshi',       email: 'amit@student.edu',  password_hash: defaultPass, role: 'student', roll_no: 'PRN2021003', phone: '9876543212' },
    { name: 'Pooja Singh',      email: 'pooja@student.edu', password_hash: defaultPass, role: 'student', roll_no: 'PRN2021004', phone: '9876543213' }
  ]);
  console.log('Users seeded:', users.length);

  const userMap = {};
  users.forEach(u => { userMap[u.email] = u._id; });

  // Seed Complaints with varied statuses and dates
  const catMap = {};
  categories.forEach(c => { catMap[c.category_name] = { _id: c._id, dept_id: c.dept_id }; });

  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const students = ['rahul@student.edu','sneha@student.edu','amit@student.edu','pooja@student.edu'];
  const catNames = Object.keys(catMap);

  const complaints = [];
  for (let i = 0; i < 30; i++) {
    const catName = catNames[i % catNames.length];
    const cat = catMap[catName];
    const studentEmail = students[i % students.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    complaints.push({
      student_id:  userMap[studentEmail],
      dept_id:     cat.dept_id,
      category_id: cat._id,
      title:       `Complaint about ${catName} #${i + 1}`,
      description: `This is a detailed description for complaint #${i + 1} about ${catName}. Needs immediate attention.`,
      status,
      priority,
      createdAt,
      updatedAt: createdAt,
      status_log: [{
        old_status:      null,
        new_status:      'Open',
        updated_by:      userMap[studentEmail],
        updated_by_name: students[i % students.length].split('@')[0],
        updater_role:    'student',
        remarks:         'Complaint registered by student.',
        updated_at:      createdAt
      }],
      ...(status === 'Resolved' || status === 'Closed' ? {
        feedback: {
          rating:  Math.floor(Math.random() * 3) + 3,
          comment: 'Issue was resolved satisfactorily.',
          given_at: new Date()
        }
      } : {})
    });
  }

  await Complaint.insertMany(complaints);
  console.log('Complaints seeded:', complaints.length);

  console.log('\n✅ Seeding complete!');
  console.log('\nLogin credentials (all passwords: password123):');
  console.log('  Admin:   admin@college.edu / password123');
  console.log('  Staff:   priya.cs@college.edu / password123');
  console.log('  Student: rahul@student.edu / password123');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
