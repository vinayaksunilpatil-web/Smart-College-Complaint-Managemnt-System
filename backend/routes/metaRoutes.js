const express = require('express');
const router = express.Router();
const { getDepartments, getCategories, getStaffList } = require('../controllers/metaController');

// Publicly readable metadata for dropdowns and directory views
router.get('/departments', getDepartments);
router.get('/categories', getCategories);
router.get('/staff', getStaffList);

module.exports = router;
