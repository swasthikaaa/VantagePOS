const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variationId: { type: mongoose.Schema.Types.ObjectId }, // If applicable
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    type: {
        type: String,
        enum: ['Addition', 'Subtraction'],
        required: true
    },
    quantity: { type: Number, required: true },
    reason: {
        type: String,
        enum: ['Damage', 'Correction', 'Return', 'Expired', 'Lost', 'Other'],
        required: true
    },
    notes: { type: String },
    adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Adjustment', adjustmentSchema);
