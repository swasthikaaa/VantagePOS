const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    quotationNumber: { type: String, required: true, unique: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String }
    },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    expiryDate: { type: Date },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Invoiced'],
        default: 'Pending'
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
