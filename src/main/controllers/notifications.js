const Notification = require('../models/notification');

// Get all notifications for the user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.send(notifications);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching notifications' });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      user: req.user._id
    });
    await notification.save();
    res.status(201).send(notification);
  } catch (error) {
    res.status(400).send({ error: 'Error creating notification' });
  }
};

// Update a notification
const updateNotification = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'message', 'type', 'read'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).send();
    }

    updates.forEach(update => notification[update] = req.body[update]);
    await notification.save();
    res.send(notification);
  } catch (error) {
    res.status(400).send({ error: 'Error updating notification' });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).send();
    }

    res.send(notification);
  } catch (error) {
    res.status(500).send({ error: 'Error deleting notification' });
  }
};

// Get notification settings
const getSettings = async (req, res) => {
  try {
    const settings = await NotificationSettings.findOne({ user: req.user._id });
    if (!settings) {
      return res.send({
        email: true,
        push: true,
        sms: false,
        budgetAlerts: true,
        billReminders: true,
        goalUpdates: true
      });
    }
    res.send(settings);
  } catch (error) {
    res.status(500).send({ error: 'Error fetching notification settings' });
  }
};

// Update notification settings
const updateSettings = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['email', 'push', 'sms', 'budgetAlerts', 'billReminders', 'goalUpdates'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const settings = await NotificationSettings.findOne({ user: req.user._id });
    
    if (!settings) {
      const newSettings = new NotificationSettings({
        ...req.body,
        user: req.user._id
      });
      await newSettings.save();
      return res.send(newSettings);
    }

    updates.forEach(update => settings[update] = req.body[update]);
    await settings.save();
    res.send(settings);
  } catch (error) {
    res.status(400).send({ error: 'Error updating notification settings' });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getSettings,
  updateSettings
}; 