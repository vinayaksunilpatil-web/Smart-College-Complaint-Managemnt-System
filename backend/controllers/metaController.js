const Department = require('../models/Department');
const Category   = require('../models/Category');
const User       = require('../models/User');
const Complaint  = require('../models/Complaint');

// @desc Get all departments
// @route GET /api/meta/departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ dept_name: 1 });

    // Enrich with counts and categories (issues resolved)
    const enriched = await Promise.all(departments.map(async (dept) => {
      const [complaint_count, staff_count, categories] = await Promise.all([
        Complaint.countDocuments({ dept_id: dept._id }),
        User.countDocuments({ dept_id: dept._id, role: { $in: ['staff', 'admin'] } }),
        Category.find({ dept_id: dept._id }).select('category_name sla_hours description').sort({ category_name: 1 })
      ]);
      return {
        _id:            dept._id,
        dept_name:      dept.dept_name,
        location:       dept.location,
        description:    dept.description,
        complaint_count,
        staff_count,
        categories,
        createdAt:      dept.createdAt
      };
    }));

    return res.status(200).json({ success: true, departments: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc Get all categories (with linked departments)
// @route GET /api/meta/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('dept_id', 'dept_name')
      .sort({ category_name: 1 });

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc Get all staff directory
// @route GET /api/meta/staff
const getStaffList = async (req, res, next) => {
  try {
    const staffList = await User.find({ role: { $in: ['staff', 'admin'] } })
      .select('-password_hash')
      .populate('dept_id', 'dept_name')
      .sort({ name: 1 });

    // Enrich with assigned complaints count
    const enriched = await Promise.all(staffList.map(async (staff) => {
      const assigned_complaints = await Complaint.countDocuments({ staff_id: staff._id });
      return {
        ...staff.toObject(),
        assigned_complaints
      };
    }));

    return res.status(200).json({ success: true, staff: enriched });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getCategories,
  getStaffList
};
