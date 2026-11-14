const express = require('express');
const router = express.Router();
const { getDepartmentComplaints, getStaffAnalytics } = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/complaints', authenticate, authorize('staff', 'admin'), getDepartmentComplaints);
router.get('/analytics', authenticate, authorize('staff', 'admin'), getStaffAnalytics);

module.exports = router;
