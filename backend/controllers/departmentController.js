const Department = require('../models/Department');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc Create a new department with optional initial categories
// @route POST /api/admin/departments
const createDepartment = async (req, res, next) => {
  try {
    const { dept_name, location, description, categories } = req.body;

    if (!dept_name || !dept_name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required.' });
    }

    const existing = await Department.findOne({
      dept_name: { $regex: new RegExp(`^${dept_name.trim()}$`, 'i') }
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A department with this name already exists.' });
    }

    const department = await Department.create({
      dept_name: dept_name.trim(),
      location: location ? location.trim() : 'Main Campus',
      description: description ? description.trim() : ''
    });

    const createdCategories = [];

    // If categories array provided (array of strings or objects)
    if (Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        const catName = typeof cat === 'string' ? cat.trim() : (cat.category_name || '').trim();
        const slaHours = typeof cat === 'object' && cat.sla_hours ? Number(cat.sla_hours) : 48;
        const catDesc = typeof cat === 'object' && cat.description ? cat.description.trim() : '';

        if (catName) {
          const newCat = await Category.create({
            category_name: catName,
            dept_id: department._id,
            sla_hours: slaHours,
            description: catDesc
          });
          createdCategories.push(newCat);
        }
      }
    } else {
      // Create a default general category for this new department so students can immediately report issues to it
      const defaultCat = await Category.create({
        category_name: `${department.dept_name} General Issue`,
        dept_id: department._id,
        sla_hours: 48,
        description: `General technical or facility grievances for ${department.dept_name}`
      });
      createdCategories.push(defaultCat);
    }

    return res.status(201).json({
      success: true,
      message: `Department '${department.dept_name}' created successfully with ${createdCategories.length} category issue(s).`,
      department: {
        ...department.toObject(),
        complaint_count: 0,
        staff_count: 0,
        categories: createdCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update department
// @route PUT /api/admin/departments/:id
const updateDepartment = async (req, res, next) => {
  try {
    const { dept_name, location, description } = req.body;
    const updateData = {};
    if (dept_name) updateData.dept_name = dept_name.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (description !== undefined) updateData.description = description.trim();

    const department = await Department.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete department
// @route DELETE /api/admin/departments/:id
const deleteDepartment = async (req, res, next) => {
  try {
    const deptId = req.params.id;

    // Check if there are active complaints
    const activeComplaints = await Complaint.countDocuments({ dept_id: deptId });
    if (activeComplaints > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${activeComplaints} complaint(s) linked to this department.`
      });
    }

    // Delete associated categories
    await Category.deleteMany({ dept_id: deptId });

    // Unlink staff from this department
    await User.updateMany({ dept_id: deptId }, { $set: { dept_id: null } });

    const deleted = await Department.findByIdAndDelete(deptId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Department '${deleted.dept_name}' and its categories deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add a new category to a department
// @route POST /api/admin/departments/:id/categories
const addCategoryToDepartment = async (req, res, next) => {
  try {
    const { category_name, sla_hours = 48, description } = req.body;
    const deptId = req.params.id;

    const department = await Department.findById(deptId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const category = await Category.create({
      category_name: category_name.trim(),
      dept_id: deptId,
      sla_hours: Number(sla_hours) || 48,
      description: description ? description.trim() : ''
    });

    return res.status(201).json({
      success: true,
      message: `Category '${category.category_name}' added to ${department.dept_name}.`,
      category
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addCategoryToDepartment
};
