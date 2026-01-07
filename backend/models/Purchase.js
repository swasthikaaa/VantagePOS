const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    purchaseNumber: { type: String, required: true, unique: true },
    supplier: {
        name: { type: String, required: true },
        contact: { type: String },
        email: { type: String }
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        costPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Ordered', 'Received', 'Cancelled'],
        default: 'Ordered'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Partial', 'Unpaid'],
        default: 'Unpaid'
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
