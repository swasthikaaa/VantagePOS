const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ isRead: true });
        res.status(200).json({ success: true, message: 'Read notifications cleared' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
