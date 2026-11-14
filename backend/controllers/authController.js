const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_smart_complaint_portal_2026';
const JWT_EXPIRES_IN = '7d';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @desc Register an Account (Student only via public endpoint)
// @route POST /api/auth/register
// NOTE: Staff and Admin accounts MUST be created by Admin via /api/admin/users
const register = async (req, res, next) => {
  try {
    const { role = 'student', name, email, password, roll_no, phone, dept_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName  = name.trim();
    const normalizedRole = role.toLowerCase();

    // SECURITY: Block staff/admin self-registration from public endpoint
    if (normalizedRole === 'staff' || normalizedRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Staff and Admin accounts must be created by a System Administrator. Please contact your administrator.'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser;

    if (normalizedRole === 'student') {
      if (!roll_no) {
        return res.status(400).json({
          success: false,
          message: 'PRN / Roll Number is required for student registration.'
        });
      }

      newUser = await User.create({
        name: cleanName,
        email: cleanEmail,
        password_hash: passwordHash,
        role: 'student',
        roll_no: roll_no.trim(),
        phone: phone ? phone.trim() : null
      });

    } else if (normalizedRole === 'staff' || normalizedRole === 'admin') {
      let assignedDeptId = null;
      let deptName = 'General';

      if (dept_id) {
        // Validate it looks like a MongoDB ObjectId (24 hex chars)
        const isValidObjectId = /^[a-fA-F0-9]{24}$/.test(String(dept_id));
        if (isValidObjectId) {
          const dept = await Department.findById(dept_id);
          if (dept) {
            assignedDeptId = dept._id;
            deptName = dept.dept_name;
          }
        } else {
          // If not a valid ObjectId, just pick the first department
          const firstDept = await Department.findOne();
          if (firstDept) {
            assignedDeptId = firstDept._id;
            deptName = firstDept.dept_name;
          }
        }
      } else {
        // Default: first department
        const firstDept = await Department.findOne();
        if (firstDept) {
          assignedDeptId = firstDept._id;
          deptName = firstDept.dept_name;
        }
      }

      newUser = await User.create({
        name: cleanName,
        email: cleanEmail,
        password_hash: passwordHash,
        role: normalizedRole,
        dept_id: assignedDeptId
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration role specified.'
      });
    }

    const userPayload = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      dept_id: newUser.dept_id || null,
      roll_no: newUser.roll_no || null
    };

    const token = generateToken(userPayload);

    return res.status(201).json({
      success: true,
      message: `${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} account created successfully.`,
      token,
      user: userPayload
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login Student, Staff, or Admin
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Build query
    const query = { email: cleanEmail };
    if (role && ['student', 'staff', 'admin'].includes(role.toLowerCase())) {
      query.role = role.toLowerCase();
    }

    const userRecord = await User.findOne(query).populate('dept_id', 'dept_name location');

    if (!userRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. If you do not have an account, please register.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const userPayload = {
      id: userRecord._id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      dept_id: userRecord.dept_id ? userRecord.dept_id._id : null,
      dept_name: userRecord.dept_id ? userRecord.dept_id.dept_name : null,
      roll_no: userRecord.roll_no || null,
      phone: userRecord.phone || null
    };

    const token = generateToken(userPayload);

    return res.status(200).json({
      success: true,
      message: `Welcome, ${userRecord.name}!`,
      token,
      user: userPayload
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current authenticated user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id)
      .select('-password_hash')
      .populate('dept_id', 'dept_name location');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { name, phone } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();

    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password_hash')
      .populate('dept_id', 'dept_name location');

    return res.status(200).json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    next(error);
  }
};

// @desc Change password
// @route PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Provide current and new passwords.' });
    }

    const user = await User.findById(id);
    const isMatch = await bcrypt.compare(current_password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
