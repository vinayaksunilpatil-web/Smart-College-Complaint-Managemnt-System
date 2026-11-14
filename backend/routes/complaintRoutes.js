const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComment,
  submitFeedback,
  predictDepartmentAndCategory
} = require('../controllers/complaintController');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only images and documents are allowed.'));
  }
});

// AI Prediction (Student/Authenticated)
router.post('/predict-department', authenticate, predictDepartmentAndCategory);

// Student routes
router.post('/', authenticate, authorize('student'), upload.array('attachments', 5), createComplaint);
router.get('/my', authenticate, authorize('student'), getMyComplaints);

// Shared routes
router.get('/:id', authenticate, getComplaintById);
router.put('/:id/status', authenticate, authorize('staff', 'admin'), updateComplaintStatus);
router.post('/:id/comments', authenticate, addComment);
router.post('/:id/feedback', authenticate, authorize('student'), submitFeedback);

module.exports = router;
