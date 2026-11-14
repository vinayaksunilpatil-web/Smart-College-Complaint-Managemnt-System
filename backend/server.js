const app = require('./app');
const { connectDB } = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('========================================================');
  console.log('🚀 Smart College Complaint Management System Backend');
  console.log('📦 Database: MongoDB (Mongoose)');
  console.log('========================================================');

  const isDbConnected = await connectDB();

  if (!isDbConnected) {
    console.warn('[Warning] MongoDB connection could not be established. Ensure MongoDB is running and MONGODB_URI in .env is correct.');
    console.warn('[Warning] Server will start, but database operations will fail until connection is restored.');
  }

  // Seed initial data if needed
  if (isDbConnected) {
    await seedInitialData();
  }

  app.listen(PORT, () => {
    console.log(`🌐 API Server listening on: http://localhost:${PORT}`);
    console.log(`📊 DB Visualization: http://localhost:${PORT}/api/admin/db/stats`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    console.log('========================================================');
  });
}

// Seed initial departments and categories if not exist
async function seedInitialData() {
  try {
    const Department = require('./models/Department');
    const Category   = require('./models/Category');

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log('[Seed] Seeding departments and categories...');

      const departments = await Department.insertMany([
        { dept_name: 'Computer Engineering',   location: 'Block A', description: 'CS/IT grievances' },
        { dept_name: 'Information Technology', location: 'Block B', description: 'IT-specific grievances' },
        { dept_name: 'Civil Engineering',      location: 'Block C', description: 'Infrastructure & Civil' },
        { dept_name: 'Electronics & Telecom',  location: 'Block D', description: 'E&TC grievances' },
        { dept_name: 'Administration',          location: 'Main Building', description: 'Admin & hostel grievances' }
      ]);

      const deptMap = {};
      departments.forEach(d => { deptMap[d.dept_name] = d._id; });

      await Category.insertMany([
        { category_name: 'Lab Equipment Issue',    dept_id: deptMap['Computer Engineering'],   sla_hours: 24 },
        { category_name: 'Software / System Issue',dept_id: deptMap['Computer Engineering'],   sla_hours: 48 },
        { category_name: 'Network / WiFi Problem', dept_id: deptMap['Information Technology'], sla_hours: 12 },
        { category_name: 'Server Downtime',        dept_id: deptMap['Information Technology'], sla_hours: 6  },
        { category_name: 'Building Maintenance',   dept_id: deptMap['Civil Engineering'],       sla_hours: 72 },
        { category_name: 'Sanitation & Hygiene',   dept_id: deptMap['Civil Engineering'],       sla_hours: 48 },
        { category_name: 'Electronics Lab Issue',  dept_id: deptMap['Electronics & Telecom'],   sla_hours: 24 },
        { category_name: 'Signal / Communication', dept_id: deptMap['Electronics & Telecom'],   sla_hours: 48 },
        { category_name: 'Fee / Finance Issue',    dept_id: deptMap['Administration'],           sla_hours: 72 },
        { category_name: 'Hostel Complaint',       dept_id: deptMap['Administration'],           sla_hours: 24 },
        { category_name: 'Library Issue',          dept_id: deptMap['Administration'],           sla_hours: 48 },
        { category_name: 'Transport Complaint',    dept_id: deptMap['Administration'],           sla_hours: 24 }
      ]);

      console.log('[Seed] ✅ Departments and categories seeded successfully.');
    }
  } catch (err) {
    console.error('[Seed] Error seeding initial data:', err.message);
  }
}

startServer();
