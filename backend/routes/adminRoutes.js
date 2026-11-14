const express = require('express');
const router  = express.Router();
const {
  getAllComplaints,
  exportComplaintsCSV
} = require('../controllers/complaintController');
const { getDashboardOverview, getFullAnalytics } = require('../controllers/analyticsController');
const { getDbStats, browseCollection, runAggregation, getIndexes } = require('../controllers/dbVizController');
const { getAllUsers, createUser, updateUser, deleteUser, getUserStats } = require('../controllers/userController');
const { createDepartment, updateDepartment, deleteDepartment, addCategoryToDepartment } = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(authenticate, authorize('admin'));

// Analytics & Dashboard
router.get('/dashboard', getDashboardOverview);
router.get('/analytics', getFullAnalytics);

// Complaints
router.get('/complaints', getAllComplaints);
router.get('/complaints/export', exportComplaintsCSV);

// Departments Management (Admin)
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.post('/departments/:id/categories', addCategoryToDepartment);

// MongoDB Database Visualization
router.get('/db/stats', getDbStats);
router.get('/db/collection/:name', browseCollection);
router.get('/db/aggregation/:type', runAggregation);
router.get('/db/indexes/:collection', getIndexes);

// User Management
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
