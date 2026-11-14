const Complaint = require('../models/Complaint');
const Category  = require('../models/Category');
const Department = require('../models/Department');
const User       = require('../models/User');
const Notification = require('../models/Notification');
const mongoose   = require('mongoose');

// Helper: create notification
const createNotification = async ({ user_id, type, title, message, complaint_id }) => {
  try {
    await Notification.create({ user_id, type, title, message, complaint_id });
    await User.findByIdAndUpdate(user_id, { $inc: { unread_notifications: 1 } });
  } catch (err) {
    console.error('[Notification] Failed to create:', err.message);
  }
};

// Helper: format a complaint doc into a flat object for list views
const formatComplaint = (c) => ({
  _id:            c._id,
  title:          c.title,
  description:    c.description,
  status:         c.status,
  priority:       c.priority,
  createdAt:      c.createdAt,
  updatedAt:      c.updatedAt,
  dept_name:      c.dept_id?.dept_name    || '',
  category_name:  c.category_id?.category_name || '',
  sla_hours:      c.category_id?.sla_hours ?? 24,
  student_name:   c.student_id?.name      || '',
  student_roll_no:c.student_id?.roll_no   || '',
  student_email:  c.student_id?.email     || '',
  staff_name:     c.staff_id?.name        || null,
  staff_email:    c.staff_id?.email       || null,
  comments_count: (c.comments || []).length,
  has_feedback:   !!(c.feedback?.rating)
});

// @desc Create a new complaint (Student)
// @route POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { title, description, category_id, priority = 'Medium' } = req.body;

    if (!title || !description || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and select a category.'
      });
    }

    // Validate category_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      return res.status(400).json({ success: false, message: 'Invalid category selected. Please choose from the dropdown.' });
    }

    // Validate category and fetch department
    const category = await Category.findById(category_id).populate('dept_id');
    if (!category) {
      return res.status(400).json({ success: false, message: 'Selected category not found.' });
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    const sanitizedPriority = validPriorities.includes(priority) ? priority : 'Medium';

    // Handle file attachments
    const attachments = (req.files || []).map(f => ({
      filename:     f.filename,
      originalname: f.originalname,
      mimetype:     f.mimetype,
      path:         f.path,
      size:         f.size
    }));

    const complaint = await Complaint.create({
      student_id:  studentId,
      dept_id:     category.dept_id._id,
      category_id: category._id,
      title:       title.trim(),
      description: description.trim(),
      status:      'Open',
      priority:    sanitizedPriority,
      attachments,
      status_log: [{
        old_status:      null,
        new_status:      'Open',
        updated_by:      studentId,
        updated_by_name: req.user.name,
        updater_role:    'student',
        remarks:         'Complaint registered by student.'
      }]
    });

    // Notify all staff in the department
    const deptStaff = await User.find({ dept_id: category.dept_id._id, role: { $in: ['staff', 'admin'] } });
    for (const staff of deptStaff) {
      await createNotification({
        user_id:      staff._id,
        type:         'new_complaint',
        title:        'New Complaint Received',
        message:      `A new ${sanitizedPriority} priority complaint: "${title.trim()}"`,
        complaint_id: complaint._id
      });
    }

    return res.status(201).json({
      success: true,
      message: `Complaint registered and routed to ${category.dept_id.dept_name} department.`,
      complaint: {
        _id:          complaint._id,
        title:        complaint.title,
        status:       complaint.status,
        priority:     complaint.priority,
        dept_name:    category.dept_id.dept_name,
        category_name:category.category_name,
        createdAt:    complaint.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current student's complaints
// @route GET /api/complaints/my
const getMyComplaints = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { status, priority, search } = req.query;

    const query = { student_id: studentId };
    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('dept_id', 'dept_name')
      .populate('category_id', 'category_name sla_hours')
      .populate('staff_id', 'name email')
      .sort({ createdAt: -1 });

    // Stats
    const allComplaints = await Complaint.find({ student_id: studentId });
    const stats = {
      total:      allComplaints.length,
      open:       allComplaints.filter(c => c.status === 'Open').length,
      inProgress: allComplaints.filter(c => c.status === 'In Progress').length,
      resolved:   allComplaints.filter(c => c.status === 'Resolved').length,
      closed:     allComplaints.filter(c => c.status === 'Closed').length
    };

    return res.status(200).json({
      success: true,
      stats,
      complaints: complaints.map(formatComplaint)
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get detailed complaint with full timeline history
// @route GET /api/complaints/:id
const getComplaintById = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const { id: userId, role, dept_id: userDeptId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID.' });
    }

    const complaint = await Complaint.findById(complaintId)
      .populate('student_id', 'name email roll_no phone')
      .populate('dept_id', 'dept_name location')
      .populate('category_id', 'category_name sla_hours')
      .populate('staff_id', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Authorization checks
    if (role === 'student' && complaint.student_id._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own complaints.'
      });
    }

    if (role === 'staff' && complaint.dept_id._id.toString() !== userDeptId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint does not belong to your department.'
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
      timeline: complaint.status_log
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update complaint status (Staff / Admin)
// @route PUT /api/complaints/:id/status
const updateComplaintStatus = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const { id: staffId, role, dept_id: staffDeptId, name: staffName } = req.user;
    const { new_status, remarks } = req.body;

    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(new_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID.' });
    }

    const complaint = await Complaint.findById(complaintId).populate('student_id', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Staff must belong to the same department
    if (role === 'staff' && complaint.dept_id.toString() !== staffDeptId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update complaints assigned to your department.'
      });
    }

    const oldStatus = complaint.status;
    const remarkText = remarks && remarks.trim()
      ? remarks.trim()
      : `Status updated to ${new_status} by ${staffName}.`;

    complaint.status   = new_status;
    complaint.staff_id = staffId;
    complaint.status_log.push({
      old_status:      oldStatus,
      new_status,
      updated_by:      staffId,
      updated_by_name: staffName,
      updater_role:    role,
      remarks:         remarkText
    });

    await complaint.save();

    // Notify student
    await createNotification({
      user_id:      complaint.student_id._id,
      type:         'status_update',
      title:        `Complaint Status Updated: ${new_status}`,
      message:      `Your complaint "${complaint.title}" status changed from ${oldStatus} to ${new_status}. ${remarkText}`,
      complaint_id: complaint._id
    });

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to ${new_status}.`,
      statusUpdate: {
        complaint_id: complaintId,
        old_status:   oldStatus,
        new_status,
        remarks:      remarkText,
        updated_at:   new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add comment to a complaint
// @route POST /api/complaints/:id/comments
const addComment = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const { id: userId, role, name: userName } = req.user;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Comment message cannot be empty.' });
    }

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID.' });
    }

    const complaint = await Complaint.findById(complaintId).populate('student_id', '_id name');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (role === 'student' && complaint.student_id._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    complaint.comments.push({ user_id: userId, user_name: userName, user_role: role, message: message.trim() });
    await complaint.save();

    const recipientId = role === 'student' ? (complaint.staff_id || null) : complaint.student_id._id;
    if (recipientId) {
      await createNotification({
        user_id:      recipientId,
        type:         'comment',
        title:        'New Comment on Complaint',
        message:      `${userName} added a comment on: "${complaint.title}"`,
        complaint_id: complaint._id
      });
    }

    const addedComment = complaint.comments[complaint.comments.length - 1];
    return res.status(201).json({ success: true, comment: addedComment });
  } catch (error) {
    next(error);
  }
};

// @desc Submit feedback on a resolved complaint
// @route POST /api/complaints/:id/feedback
const submitFeedback = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const { id: studentId } = req.user;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint ID.' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });

    if (complaint.student_id.toString() !== studentId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!['Resolved', 'Closed'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for resolved or closed complaints.' });
    }

    complaint.feedback = { rating, comment: comment || '', given_at: new Date() };
    await complaint.save();

    return res.status(200).json({ success: true, message: 'Thank you for your feedback!', feedback: complaint.feedback });
  } catch (error) {
    next(error);
  }
};

// @desc Get department complaints (Staff)
// @route GET /api/staff/complaints
const getDepartmentComplaints = async (req, res, next) => {
  try {
    const { dept_id: userDeptId } = req.user;
    const { status, priority, search, year } = req.query;

    const query = { dept_id: userDeptId };
    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (year && year !== 'All') {
      query.createdAt = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('student_id', 'name roll_no email')
      .populate('dept_id', 'dept_name')
      .populate('category_id', 'category_name sla_hours')
      .populate('staff_id', 'name email')
      .sort({ createdAt: -1 });

    const allDeptComplaints = await Complaint.find({ dept_id: userDeptId });
    const stats = {
      total:      allDeptComplaints.length,
      open:       allDeptComplaints.filter(c => c.status === 'Open').length,
      inProgress: allDeptComplaints.filter(c => c.status === 'In Progress').length,
      resolved:   allDeptComplaints.filter(c => c.status === 'Resolved').length,
      closed:     allDeptComplaints.filter(c => c.status === 'Closed').length
    };

    return res.status(200).json({
      success: true,
      stats,
      complaints: complaints.map(formatComplaint)
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all complaints (Admin)
// @route GET /api/admin/complaints
const getAllComplaints = async (req, res, next) => {
  try {
    const { dept_id, status, priority, year, search } = req.query;

    const query = {};
    if (dept_id && dept_id !== 'All' && mongoose.Types.ObjectId.isValid(dept_id)) query.dept_id = dept_id;
    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (year && year !== 'All') {
      query.createdAt = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${parseInt(year) + 1}-01-01`) };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('student_id', 'name roll_no email')
      .populate('dept_id', 'dept_name')
      .populate('category_id', 'category_name sla_hours')
      .populate('staff_id', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: complaints.length,
      complaints: complaints.map(formatComplaint)
    });
  } catch (error) {
    next(error);
  }
};

// @desc Export complaints as CSV (Admin)
// @route GET /api/admin/complaints/export
const exportComplaintsCSV = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({})
      .populate('student_id', 'name roll_no email')
      .populate('dept_id', 'dept_name')
      .populate('category_id', 'category_name')
      .populate('staff_id', 'name')
      .sort({ createdAt: -1 });

    const headers = ['ID','Title','Status','Priority','Department','Category','Student Name','Roll No','Staff Assigned','Created At'];
    const rows = complaints.map(c => [
      c._id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.status,
      c.priority,
      c.dept_id?.dept_name || '',
      c.category_id?.category_name || '',
      c.student_id?.name || '',
      c.student_id?.roll_no || '',
      c.staff_id?.name || 'Unassigned',
      c.createdAt.toISOString()
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="complaints_export.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc Predict the most appropriate department and category based on complaint title & description (AI / NLP heuristic)
// @route POST /api/complaints/predict-department
const predictDepartmentAndCategory = async (req, res, next) => {
  try {
    const { title = '', description = '' } = req.body;
    const rawText = `${title} ${description}`.trim();

    if (!rawText) {
      return res.status(400).json({ success: false, message: 'Title or description is required for prediction.' });
    }

    // Text Normalization: standardizing common voice & typing variants
    const normalizedText = rawText.toLowerCase()
      .replace(/wi[-\s]fi/g, 'wifi')
      .replace(/e[-\s]&[-\s]tc|e[-\s]and[-\s]tc/g, 'entc')
      .replace(/vs[-\s]code/g, 'vs code')
      .replace(/tube[-\s]light/g, 'tubelight')
      .replace(/air[-\s]conditioner|air[-\s]conditioning/g, 'ac')
      .replace(/hot[-\s]spot/g, 'hotspot')
      .replace(/blue[-\s]screen/g, 'blue screen');

    // Fetch all departments and categories from database
    const [departments, categories] = await Promise.all([
      Department.find().lean(),
      Category.find().populate('dept_id', 'dept_name description').lean()
    ]);

    // Domain Taxonomy with Primary vs Secondary Intent Weights
    const domainSignatures = {
      'it': {
        primary: [
          'wifi', 'wi-fi', 'wi fi', 'wlan', 'internet', 'network', 'lan', 'router', 'ethernet',
          'bandwidth', 'hotspot', 'dns', 'ip address', 'connectivity', 'access point',
          'server downtime', 'slow internet', 'disconnecting', 'no internet',
          'broadband', 'wireless', 'network cable', 'modem', 'packet loss', 'speed issue', 'fiber'
        ],
        secondary: ['portal', 'moodle', 'erp', 'website', 'online portal', 'server'],
        dept_keywords: ['information technology', 'it', 'network', 'telecom'],
        category_matchers: {
          'network': ['wifi', 'wi-fi', 'internet', 'network', 'lan', 'router', 'hotspot', 'connectivity', 'broadband', 'ethernet', 'bandwidth'],
          'server': ['server', 'downtime', 'moodle', 'erp', 'portal', 'website', 'crash', 'host', 'database']
        }
      },
      'computer': {
        primary: [
          'computer', 'pc', 'desktop', 'monitor', 'keyboard', 'mouse', 'cpu', 'software',
          'compiler', 'ide', 'visual studio', 'vs code', 'python', 'java', 'c++', 'linux',
          'windows', 'ubuntu', 'terminal', 'blue screen', 'bsod', 'crash', 'boot', 'ram',
          'hard disk', 'gpu', 'programming', 'virus', 'matlab', 'eclipse', 'anaconda',
          'code editor', 'os installation', 'system format', 'operating system', 'pc hardware'
        ],
        secondary: ['system', 'lab pc', 'workstation', 'lab software'],
        dept_keywords: ['computer engineering', 'computer', 'cse', 'software'],
        category_matchers: {
          'software': ['software', 'compiler', 'ide', 'vs code', 'visual studio', 'python', 'java', 'c++', 'linux', 'windows', 'ubuntu', 'blue screen', 'bsod', 'crash', 'virus', 'os'],
          'equipment': ['computer', 'pc', 'desktop', 'monitor', 'keyboard', 'mouse', 'cpu', 'ram', 'hard disk', 'gpu', 'hardware', 'boot']
        }
      },
      'civil': {
        primary: [
          'bench', 'desk', 'chair', 'table', 'blackboard', 'whiteboard', 'door', 'window',
          'wall', 'paint', 'leak', 'leakage', 'water', 'tap', 'pipe', 'plumbing', 'washroom',
          'toilet', 'restroom', 'flush', 'basin', 'sink', 'roof', 'ceiling', 'floor', 'tile',
          'civil', 'dustbin', 'drainage', 'sanitation', 'cleanliness', 'building', 'water cooler',
          'drinking water', 'broken lock', 'cracked glass', 'fan regulator handle', 'plaster',
          'podium', 'railing', 'staircase', 'steps'
        ],
        secondary: ['hostel room', 'mess', 'canteen', 'classroom infrastructure'],
        dept_keywords: ['civil engineering', 'civil', 'infrastructure'],
        category_matchers: {
          'sanitation': ['washroom', 'toilet', 'restroom', 'flush', 'basin', 'sink', 'water', 'tap', 'pipe', 'leak', 'leakage', 'plumbing', 'drainage', 'dustbin', 'sanitation', 'cleanliness', 'water cooler', 'drinking water'],
          'building': ['bench', 'desk', 'chair', 'table', 'blackboard', 'whiteboard', 'door', 'window', 'wall', 'paint', 'roof', 'ceiling', 'floor', 'tile', 'broken lock', 'glass', 'podium', 'railing', 'staircase']
        }
      },
      'entc': {
        primary: [
          'light', 'tubelight', 'tube light', 'bulb', 'fan', 'ac', 'air conditioner',
          'cooling', 'power', 'switch', 'switchboard', 'socket', 'plug', 'fuse', 'wiring',
          'spark', 'short circuit', 'electricity', 'inverter', 'ups', 'projector', 'hdmi',
          'speaker', 'audio', 'mic', 'microphone', 'sound system', 'oscilloscope',
          'multimeter', 'sensor', 'breadboard', 'microcontroller', 'arduino', 'telecom',
          'power cut', 'power supply', 'projector screen'
        ],
        secondary: ['electronics lab', 'hardware circuit', 'electrical'],
        dept_keywords: ['electronics & telecom', 'electronics', 'telecom', 'e&tc', 'entc', 'electrical'],
        category_matchers: {
          'electronics': ['oscilloscope', 'multimeter', 'sensor', 'breadboard', 'microcontroller', 'arduino', 'projector', 'hdmi', 'speaker', 'mic', 'sound system'],
          'electrical': ['light', 'tubelight', 'bulb', 'fan', 'ac', 'air conditioner', 'power', 'switch', 'switchboard', 'socket', 'plug', 'fuse', 'wiring', 'spark', 'short circuit', 'electricity', 'inverter', 'ups', 'cooling']
        }
      },
      'mech': {
        primary: [
          'lathe', 'cnc', 'milling', 'drilling', 'machine', 'machinery', 'workshop',
          'welding', 'gear', 'motor', 'engine', 'boiler', 'cad', 'cam', 'hydraulic',
          'pneumatic', 'spindle', 'tools', 'bearing', 'thermodynamics', 'grinder', 'anvil'
        ],
        secondary: ['mechanical workshop', 'tooling'],
        dept_keywords: ['mechanical engineering', 'mechanical'],
        category_matchers: {
          'machine': ['cnc', 'lathe', 'milling', 'drilling', 'machine', 'machinery', 'workshop', 'welding', 'spindle', 'motor', 'bearing', 'hydraulic', 'pneumatic']
        }
      },
      'admin': {
        primary: [
          'fee', 'fees', 'scholarship', 'hall ticket', 'admit card', 'exam', 'marksheet',
          'marks', 'bonafide', 'id card', 'identity card', 'certificate', 'admission',
          'fine', 'document', 'bus pass', 'transport pass', 'library book', 'library fine'
        ],
        secondary: ['office', 'administration', 'admin', 'registrar', 'hostel fee', 'mess fee'],
        dept_keywords: ['administration', 'admin'],
        category_matchers: {
          'fee': ['fee', 'fees', 'scholarship', 'payment', 'fine', 'receipt'],
          'library': ['library', 'library book', 'library fine', 'book issue', 'book return'],
          'hostel': ['hostel', 'hostel room', 'mess food', 'canteen food', 'warden']
        }
      }
    };

    const matchKeyword = (text, keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');
      return regex.test(text);
    };

    // Step 1: Score each domain based on primary (intent) and secondary (complement) keywords
    let bestDomainKey = null;
    let maxDomainScore = 0;
    let detectedKeywords = [];

    for (const [domKey, dom] of Object.entries(domainSignatures)) {
      let currentScore = 0;
      const matched = [];

      for (const kw of dom.primary) {
        if (matchKeyword(normalizedText, kw) || matchKeyword(rawText.toLowerCase(), kw)) {
          currentScore += kw.includes(' ') ? 35 : 30;
          if (!matched.includes(kw)) matched.push(kw);
        }
      }

      for (const kw of dom.secondary) {
        if (matchKeyword(normalizedText, kw) || matchKeyword(rawText.toLowerCase(), kw)) {
          currentScore += 6;
          if (!matched.includes(kw)) matched.push(kw);
        }
      }

      if (currentScore > maxDomainScore) {
        maxDomainScore = currentScore;
        bestDomainKey = domKey;
        detectedKeywords = matched;
      }
    }

    // Step 2: Resolve matched database department
    let targetDept = null;

    if (bestDomainKey) {
      const expectedKeywords = domainSignatures[bestDomainKey].dept_keywords;
      targetDept = departments.find(d => {
        const dName = d.dept_name.toLowerCase();
        return expectedKeywords.some(k => dName.includes(k) || k.includes(dName));
      });
    }

    // Fallback: direct name match if custom department added by admin
    if (!targetDept) {
      for (const dept of departments) {
        const dWords = dept.dept_name.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['engineering', 'department'].includes(w));
        for (const w of dWords) {
          if (matchKeyword(normalizedText, w)) {
            targetDept = dept;
            detectedKeywords.push(w);
            break;
          }
        }
        if (targetDept) break;
      }
    }

    // Default to first department if still unresolved
    if (!targetDept && departments.length > 0) {
      targetDept = departments[0];
    }

    // Step 3: Find best category under the target department
    const deptCategories = categories.filter(c => {
      const cDeptId = c.dept_id?._id || c.dept_id;
      return String(cDeptId) === String(targetDept?._id);
    });

    let bestCategory = null;
    let maxCatScore = -1;

    for (const cat of deptCategories) {
      let catScore = 0;
      const catName = cat.category_name.toLowerCase();
      const catDesc = (cat.description || '').toLowerCase();

      // Check category keywords
      for (const kw of detectedKeywords) {
        if (catName.includes(kw) || catDesc.includes(kw)) {
          catScore += 15;
        }
      }

      // Check sub-matcher keywords
      if (bestDomainKey && domainSignatures[bestDomainKey].category_matchers) {
        for (const [matcherKey, keywordsList] of Object.entries(domainSignatures[bestDomainKey].category_matchers)) {
          if (catName.includes(matcherKey)) {
            for (const kw of keywordsList) {
              if (matchKeyword(normalizedText, kw)) {
                catScore += 10;
              }
            }
          }
        }
      }

      if (catScore > maxCatScore) {
        maxCatScore = catScore;
        bestCategory = cat;
      }
    }

    // If no specific category outscored, pick the first category of that department
    if (!bestCategory && deptCategories.length > 0) {
      bestCategory = deptCategories[0];
    }

    // Confidence Calculation
    let confidence = 50;
    if (maxDomainScore >= 30) confidence = 96;
    else if (maxDomainScore >= 20) confidence = 89;
    else if (maxDomainScore >= 10) confidence = 78;
    else if (maxDomainScore > 0) confidence = 65;

    // Alternative suggestions from other categories
    const otherCategories = categories
      .filter(c => String(c._id) !== String(bestCategory?._id))
      .slice(0, 3)
      .map(c => ({
        category_id: c._id,
        category_name: c.category_name,
        dept_name: c.dept_id?.dept_name || 'Department'
      }));

    return res.status(200).json({
      success: true,
      prediction: {
        category_id: bestCategory?._id,
        category_name: bestCategory?.category_name || 'General Issue',
        dept_id: targetDept?._id,
        dept_name: targetDept?.dept_name || 'Department',
        sla_hours: bestCategory?.sla_hours || 48,
        confidence: `${confidence}%`,
        confidence_num: confidence,
        matched_keywords: [...new Set(detectedKeywords)],
        alternative_suggestions: otherCategories
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get department-specific analytics and visualizations for Staff Portal
// @route GET /api/staff/analytics
const getStaffAnalytics = async (req, res, next) => {
  try {
    const { dept_id: userDeptId } = req.user;

    if (!userDeptId) {
      return res.status(400).json({ success: false, message: 'No department associated with this staff account.' });
    }

    const deptObjectId = new mongoose.Types.ObjectId(userDeptId);

    // 1. Status breakdown for this department
    const statusStats = await Complaint.aggregate([
      { $match: { dept_id: deptObjectId } },
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { name: 1 } }
    ]);

    // 2. Priority breakdown for this department
    const priorityStats = await Complaint.aggregate([
      { $match: { dept_id: deptObjectId } },
      { $group: { _id: '$priority', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { name: 1 } }
    ]);

    // 3. Category breakdown in this department
    const categoryStats = await Complaint.aggregate([
      { $match: { dept_id: deptObjectId } },
      { $group: { _id: '$category_id', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          category_name: { $ifNull: ['$category.category_name', 'General Issue'] },
          sla_hours: { $ifNull: ['$category.sla_hours', 48] },
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4. Monthly Trend for this department
    const monthlyStats = await Complaint.aggregate([
      { $match: { dept_id: deptObjectId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total_raised: { $sum: 1 },
          total_resolved: {
            $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          month_name: {
            $concat: [
              {
                $arrayElemAt: [
                  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  { $subtract: ['$_id.month', 1] }
                ]
              },
              ' ',
              { $toString: '$_id.year' }
            ]
          },
          total_raised: 1,
          total_resolved: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // 5. Department KPI Summary
    const [allComplaints, deptInfo] = await Promise.all([
      Complaint.find({ dept_id: deptObjectId }).select('status priority feedback createdAt updatedAt'),
      Department.findById(deptObjectId).select('dept_name location description')
    ]);

    const total = allComplaints.length;
    const resolvedCount = allComplaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length;
    const openCount = allComplaints.filter(c => c.status === 'Open').length;
    const inProgressCount = allComplaints.filter(c => c.status === 'In Progress').length;
    const criticalCount = allComplaints.filter(c => c.priority === 'Critical').length;

    const feedbackRatings = allComplaints.filter(c => c.feedback?.rating).map(c => c.feedback.rating);
    const avgRating = feedbackRatings.length > 0
      ? (feedbackRatings.reduce((a, b) => a + b, 0) / feedbackRatings.length).toFixed(1)
      : 'N/A';

    const resolutionRate = total > 0 ? ((resolvedCount / total) * 100).toFixed(1) : '0.0';

    return res.status(200).json({
      success: true,
      data: {
        department: deptInfo || { dept_name: 'Department' },
        kpis: {
          total,
          open: openCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          critical: criticalCount,
          resolutionRate: `${resolutionRate}%`,
          avgRating,
          feedbackCount: feedbackRatings.length
        },
        statusStats,
        priorityStats,
        categoryStats,
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  getDepartmentComplaints,
  getAllComplaints,
  addComment,
  submitFeedback,
  exportComplaintsCSV,
  predictDepartmentAndCategory,
  getStaffAnalytics
};
