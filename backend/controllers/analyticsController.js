const Complaint  = require('../models/Complaint');
const User        = require('../models/User');
const Department  = require('../models/Department');
const Category    = require('../models/Category');
const mongoose    = require('mongoose');

// @desc Get high-level KPI dashboard overview (Admin)
// @route GET /api/admin/dashboard
const getDashboardOverview = async (req, res, next) => {
  try {
    // MongoDB Aggregation Pipeline for complaint stats
    const complaintStats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total_complaints:     { $sum: 1 },
          open_count:           { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
          in_progress_count:    { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved_count:       { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          closed_count:         { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } },
          critical_count:       { $sum: { $cond: [{ $eq: ['$priority', 'Critical'] }, 1, 0] } },
          with_feedback:        { $sum: { $cond: [{ $ifNull: ['$feedback.rating', false] }, 1, 0] } },
          avg_rating:           { $avg: '$feedback.rating' }
        }
      }
    ]);

    const [totalStudents, totalStaff, totalDepts, totalCats] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'staff' }),
      Department.countDocuments(),
      Category.countDocuments()
    ]);

    const stats = complaintStats[0] || {
      total_complaints: 0, open_count: 0, in_progress_count: 0,
      resolved_count: 0, closed_count: 0, critical_count: 0,
      with_feedback: 0, avg_rating: 0
    };

    const total    = stats.total_complaints || 0;
    const resolved = (stats.resolved_count || 0) + (stats.closed_count || 0);
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';

    return res.status(200).json({
      success: true,
      data: {
        totalComplaints:      total,
        openComplaints:       stats.open_count || 0,
        inProgressComplaints: stats.in_progress_count || 0,
        resolvedComplaints:   stats.resolved_count || 0,
        closedComplaints:     stats.closed_count || 0,
        criticalComplaints:   stats.critical_count || 0,
        totalStudents,
        totalStaff,
        totalDepartments:     totalDepts,
        totalCategories:      totalCats,
        resolutionRate:       `${resolutionRate}%`,
        avgFeedbackRating:    stats.avg_rating ? stats.avg_rating.toFixed(1) : 'N/A',
        totalFeedbackGiven:   stats.with_feedback || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get complete analytics for charts (Admin)
// @route GET /api/admin/analytics
const getFullAnalytics = async (req, res, next) => {
  try {
    // 1. Department-wise breakdown
    const deptBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id:              '$dept_id',
          total:            { $sum: 1 },
          open_count:       { $sum: { $cond: [{ $eq: ['$status', 'Open'] }, 1, 0] } },
          in_progress_count:{ $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          resolved_count:   { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
          closed_count:     { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from:         'departments',
          localField:   '_id',
          foreignField: '_id',
          as:           'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          dept_id:          '$_id',
          dept_name:        '$department.dept_name',
          total:            1,
          open_count:       1,
          in_progress_count:1,
          resolved_count:   1,
          closed_count:     1
        }
      },
      { $sort: { total: -1 } }
    ]);

    // 2. Status-wise distribution
    const statusDistribution = await Complaint.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { name: 1 } }
    ]);

    // 3. Priority distribution
    const priorityDistribution = await Complaint.aggregate([
      { $group: { _id: '$priority', value: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { name: 1 } }
    ]);

    // 4. Monthly Trend
    const monthlyTrend = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total_raised:   { $sum: 1 },
          total_resolved: {
            $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id:          0,
          year:         '$_id.year',
          month:        '$_id.month',
          month_name: {
            $concat: [
              { $arrayElemAt: [
                ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                { $subtract: ['$_id.month', 1] }
              ]},
              ' ',
              { $toString: '$_id.year' }
            ]
          },
          total_raised:   1,
          total_resolved: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // 5. Category breakdown
    const categoryBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id:              '$category_id',
          total_complaints: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from:         'categories',
          localField:   '_id',
          foreignField: '_id',
          as:           'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from:         'departments',
          localField:   'category.dept_id',
          foreignField: '_id',
          as:           'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id:              0,
          category_name:    '$category.category_name',
          dept_name:        '$department.dept_name',
          total_complaints: 1
        }
      },
      { $sort: { total_complaints: -1 } }
    ]);

    // 6. Feedback / Rating distribution (NEW)
    const feedbackStats = await Complaint.aggregate([
      { $match: { 'feedback.rating': { $exists: true, $ne: null } } },
      {
        $group: {
          _id:        '$feedback.rating',
          count:      { $sum: 1 },
          avg_rating: { $avg: '$feedback.rating' }
        }
      },
      { $project: { _id: 0, rating: '$_id', count: 1 } },
      { $sort: { rating: 1 } }
    ]);

    // 7. Top active students (NEW)
    const topStudents = await Complaint.aggregate([
      { $group: { _id: '$student_id', complaints: { $sum: 1 } } },
      { $sort: { complaints: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         'users',
          localField:   '_id',
          foreignField: '_id',
          as:           'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          _id:        0,
          name:       '$student.name',
          roll_no:    '$student.roll_no',
          complaints: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        departmentStats:  deptBreakdown,
        statusStats:      statusDistribution,
        priorityStats:    priorityDistribution,
        monthlyStats:     monthlyTrend,
        categoryStats:    categoryBreakdown,
        feedbackStats,
        topStudents
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getFullAnalytics
};
