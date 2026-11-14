const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc Get all notifications for the current user
// @route GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { unread_only } = req.query;

    const query = { user_id: userId };
    if (unread_only === 'true') query.is_read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unread_count = await Notification.countDocuments({ user_id: userId, is_read: false });

    return res.status(200).json({
      success: true,
      unread_count,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc Mark notification(s) as read
// @route PUT /api/notifications/read
const markAsRead = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { notification_ids } = req.body; // array of IDs, or empty to mark all

    if (notification_ids && notification_ids.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notification_ids }, user_id: userId },
        { $set: { is_read: true, read_at: new Date() } }
      );
    } else {
      await Notification.updateMany(
        { user_id: userId, is_read: false },
        { $set: { is_read: true, read_at: new Date() } }
      );
    }

    // Reset counter
    const remaining = await Notification.countDocuments({ user_id: userId, is_read: false });
    await User.findByIdAndUpdate(userId, { unread_notifications: remaining });

    return res.status(200).json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a notification
// @route DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    await Notification.findOneAndDelete({ _id: req.params.id, user_id: userId });
    return res.status(200).json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };
