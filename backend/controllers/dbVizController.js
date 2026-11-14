const mongoose = require('mongoose');
const User       = require('../models/User');
const Complaint  = require('../models/Complaint');
const Department = require('../models/Department');
const Category   = require('../models/Category');
const Notification = require('../models/Notification');

// @desc Get MongoDB collection stats and database overview
// @route GET /api/admin/db/stats
const getDbStats = async (req, res, next) => {
  try {
    const db = mongoose.connection.db;
    const dbStats = await db.stats();

    // Collection-level stats
    const collections = [
      { name: 'users',         model: User },
      { name: 'complaints',    model: Complaint },
      { name: 'departments',   model: Department },
      { name: 'categories',    model: Category },
      { name: 'notifications', model: Notification }
    ];

    const collectionStats = await Promise.all(
      collections.map(async ({ name, model }) => {
        const count = await model.countDocuments();
        let collStats = {};
        try {
          collStats = await db.collection(name).stats();
        } catch (_) {}

        return {
          collection:   name,
          documents:    count,
          size_bytes:   collStats.size || 0,
          avg_obj_size: collStats.avgObjSize ? Math.round(collStats.avgObjSize) : 0,
          indexes:      collStats.nindexes || 0,
          index_size:   collStats.totalIndexSize || 0
        };
      })
    );

    return res.status(200).json({
      success: true,
      database: {
        name:             mongoose.connection.name,
        host:             mongoose.connection.host,
        port:             mongoose.connection.port,
        state:            mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        total_collections: collectionStats.length,
        total_documents:  collectionStats.reduce((a, c) => a + c.documents, 0),
        data_size_bytes:  dbStats.dataSize || 0,
        storage_size:     dbStats.storageSize || 0,
        index_count:      dbStats.indexes || 0
      },
      collections: collectionStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc Browse documents in a collection (paginated)
// @route GET /api/admin/db/collection/:name
const browseCollection = async (req, res, next) => {
  try {
    const { name } = req.params;
    const page  = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip  = (page - 1) * limit;

    const models = {
      users:         User,
      complaints:    Complaint,
      departments:   Department,
      categories:    Category,
      notifications: Notification
    };

    const model = models[name];
    if (!model) {
      return res.status(400).json({
        success: false,
        message: `Unknown collection: ${name}. Valid: ${Object.keys(models).join(', ')}`
      });
    }

    const [documents, total] = await Promise.all([
      model.find({}).skip(skip).limit(limit).lean(),
      model.countDocuments()
    ]);

    // Remove sensitive data
    if (name === 'users') {
      documents.forEach(doc => { delete doc.password_hash; });
    }

    return res.status(200).json({
      success: true,
      collection: name,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc Run a MongoDB aggregation pipeline (Admin visualization)
// @route GET /api/admin/db/aggregation/:type
const runAggregation = async (req, res, next) => {
  try {
    const { type } = req.params;

    let result = [];
    let pipelineDescription = '';

    switch (type) {

      case 'complaints_per_dept':
        pipelineDescription = 'db.complaints.aggregate([{$group:{_id:"$dept_id",total:{$sum:1}}},{$lookup:{from:"departments",...}},{$sort:{total:-1}}])';
        result = await Complaint.aggregate([
          { $group: { _id: '$dept_id', total: { $sum: 1 } } },
          {
            $lookup: {
              from: 'departments', localField: '_id',
              foreignField: '_id', as: 'dept'
            }
          },
          { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
          { $project: { _id: 0, dept_name: '$dept.dept_name', total: 1 } },
          { $sort: { total: -1 } }
        ]);
        break;

      case 'status_pipeline':
        pipelineDescription = 'db.complaints.aggregate([{$group:{_id:"$status",count:{$sum:1}}},{$sort:{count:-1}}])';
        result = await Complaint.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $project: { _id: 0, status: '$_id', count: 1 } },
          { $sort: { count: -1 } }
        ]);
        break;

      case 'priority_pipeline':
        pipelineDescription = 'db.complaints.aggregate([{$group:{_id:"$priority",count:{$sum:1}}}])';
        result = await Complaint.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $project: { _id: 0, priority: '$_id', count: 1 } },
          { $sort: { count: -1 } }
        ]);
        break;

      case 'monthly_inflow':
        pipelineDescription = 'db.complaints.aggregate([{$group:{_id:{year:{$year:"$createdAt"},month:{$month:"$createdAt"}},total:{$sum:1}}},{$sort:{...}}])';
        result = await Complaint.aggregate([
          {
            $group: {
              _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
              total: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              month: '$_id.month',
              label: {
                $concat: [
                  { $arrayElemAt: [['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], { $subtract: ['$_id.month', 1] }] },
                  ' ', { $toString: '$_id.year' }
                ]
              },
              total: 1
            }
          },
          { $sort: { year: 1, month: 1 } }
        ]);
        break;

      case 'student_activity':
        pipelineDescription = 'db.complaints.aggregate([{$group:{_id:"$student_id",total:{$sum:1}}},{$sort:{total:-1}},{$limit:10},...lookup...])';
        result = await Complaint.aggregate([
          { $group: { _id: '$student_id', total: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users', localField: '_id',
              foreignField: '_id', as: 'student'
            }
          },
          { $unwind: '$student' },
          {
            $project: {
              _id: 0,
              name:    '$student.name',
              roll_no: '$student.roll_no',
              total:   1
            }
          }
        ]);
        break;

      case 'resolution_rate_dept':
        pipelineDescription = 'db.complaints.aggregate([{$group:{_id:"$dept_id",total:{$sum:1},resolved:{$sum:{$cond:[...]}}}},{$project:{rate:{$divide:["$resolved","$total"]}}},...])';
        result = await Complaint.aggregate([
          {
            $group: {
              _id:      '$dept_id',
              total:    { $sum: 1 },
              resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } }
            }
          },
          {
            $lookup: {
              from: 'departments', localField: '_id',
              foreignField: '_id', as: 'dept'
            }
          },
          { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id:         0,
              dept_name:   '$dept.dept_name',
              total:       1,
              resolved:    1,
              rate:        {
                $round: [{
                  $multiply: [
                    { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$resolved', '$total'] }] },
                    100
                  ]
                }, 1]
              }
            }
          },
          { $sort: { rate: -1 } }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Unknown aggregation type. Valid: complaints_per_dept, status_pipeline, priority_pipeline, monthly_inflow, student_activity, resolution_rate_dept'
        });
    }

    return res.status(200).json({
      success: true,
      type,
      pipeline: pipelineDescription,
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get MongoDB indexes for a collection
// @route GET /api/admin/db/indexes/:collection
const getIndexes = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const db = mongoose.connection.db;

    const validCollections = ['users','complaints','departments','categories','notifications'];
    if (!validCollections.includes(collection)) {
      return res.status(400).json({ success: false, message: 'Invalid collection name.' });
    }

    const indexes = await db.collection(collection).indexes();
    return res.status(200).json({ success: true, collection, indexes });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDbStats, browseCollection, runAggregation, getIndexes };
