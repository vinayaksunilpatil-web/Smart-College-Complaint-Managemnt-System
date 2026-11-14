const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name: { type: String },
  user_role: { type: String, enum: ['student', 'staff', 'admin'] },
  message:   { type: String, required: true, trim: true },
  created_at: { type: Date, default: Date.now }
});

const statusLogSchema = new mongoose.Schema({
  old_status:      { type: String },
  new_status:      { type: String, required: true },
  updated_by:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by_name: { type: String },
  updater_role:    { type: String },
  remarks:         { type: String },
  updated_at:      { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  rating:  { type: Number, min: 1, max: 5 },
  comment: { type: String, trim: true },
  given_at: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  student_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dept_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  category_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  staff_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status:      { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  priority:    { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },

  // File attachments (multer uploaded files)
  attachments: [{
    filename:     { type: String },
    originalname: { type: String },
    mimetype:     { type: String },
    path:         { type: String },
    size:         { type: Number }
  }],

  // Comment/message thread
  comments: [commentSchema],

  // Status change audit trail
  status_log: [statusLogSchema],

  // Student feedback after resolution
  feedback: feedbackSchema,

  // Notification tracking
  student_notified: { type: Boolean, default: false }

}, { timestamps: true });

// Indexes for common queries
complaintSchema.index({ student_id: 1, status: 1 });
complaintSchema.index({ dept_id: 1, status: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
