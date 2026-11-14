const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Complaint  = require('../models/Complaint');

// @desc Get all users (Admin)
// @route GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, dept_id, search } = req.query;

    const query = {};
    if (role && role !== 'All') query.role = role;
    if (dept_id && dept_id !== 'All') query.dept_id = dept_id;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { roll_no: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password_hash')
      .populate('dept_id', 'dept_name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, total: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc Create staff/admin account (Admin)
// @route POST /api/admin/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'staff', dept_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (!['staff', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be staff or admin.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      dept_id: dept_id || null
    });

    const populated = await User.findById(user._id)
      .select('-password_hash')
      .populate('dept_id', 'dept_name');

    return res.status(201).json({ success: true, message: 'User created successfully.', user: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Update user (Admin)
// @route PUT /api/admin/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, dept_id, role } = req.body;

    const updateData = {};
    if (name)    updateData.name    = name.trim();
    if (dept_id) updateData.dept_id = dept_id;
    if (role && ['staff', 'admin'].includes(role)) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .select('-password_hash')
      .populate('dept_id', 'dept_name');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    return res.status(200).json({ success: true, message: 'User updated.', user });
  } catch (error) {
    next(error);
  }
};

// @desc Delete user (Admin) - soft delete by deactivating
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, message: `User ${user.name} deleted.` });
  } catch (error) {
    next(error);
  }
};

// @desc Get user stats summary (Admin)
// @route GET /api/admin/users/stats
const getUserStats = async (req, res, next) => {
  try {
    const [students, staff, admins] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'staff' }),
      User.countDocuments({ role: 'admin' })
    ]);

    const recentUsers = await User.find()
      .select('-password_hash')
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('dept_id', 'dept_name');

    return res.status(200).json({
      success: true,
      stats: { students, staff, admins, total: students + staff + admins },
      recent_users: recentUsers
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser, getUserStats };
