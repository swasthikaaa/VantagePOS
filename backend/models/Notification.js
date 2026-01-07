const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Info', 'Success', 'Warning', 'Error'],
        default: 'Info'
    },
    module: { type: String, required: true }, // e.g., 'POS', 'Inventory', 'Expense'
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
