const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['Rent', 'Utilities', 'Salaries', 'Supplies', 'Marketing', 'Maintenance', 'Others'],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Card'],
        default: 'Cash'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Paid'],
        default: 'Paid'
    },
    attachment: { type: String } // URL to receipt image
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
