const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_name: { type: String, required: true, trim: true },
  dept_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  sla_hours:     { type: Number, default: 48 },
  description:   { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
