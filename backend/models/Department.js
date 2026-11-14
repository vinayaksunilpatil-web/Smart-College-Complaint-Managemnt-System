const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  dept_name: { type: String, required: true, unique: true, trim: true },
  location:  { type: String, trim: true, default: 'Main Campus' },
  description: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
