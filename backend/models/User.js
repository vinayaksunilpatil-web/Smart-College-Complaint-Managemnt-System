const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role:          { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },

  // Student-specific
  roll_no: { type: String, trim: true, sparse: true },
  phone:   { type: String, trim: true },

  // Staff/Admin-specific
  dept_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },

  // Notification settings
  notifications_enabled: { type: Boolean, default: true },
  unread_notifications:  { type: Number, default: 0 }
}, { timestamps: true });

// NOTE: In Mongoose 9, async pre-hooks do NOT receive a `next` parameter.
// Just return early or throw — Mongoose handles it automatically.
userSchema.pre('save', async function () {
  // Nothing to auto-hash here: password is already hashed in the controller
  // before calling User.create(). This hook is intentionally a no-op.
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
