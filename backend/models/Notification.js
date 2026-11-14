const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { 
    type: String, 
    enum: ['status_update', 'new_complaint', 'comment', 'feedback_request', 'system'],
    default: 'system'
  },
  title:       { type: String, required: true },
  message:     { type: String, required: true },
  complaint_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
  is_read:     { type: Boolean, default: false },
  read_at:     { type: Date }
}, { timestamps: true });

notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
