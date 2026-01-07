const mongoose = require('mongoose');

const zBillSchema = new mongoose.Schema({
    billNumber: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    openingCash: { type: Number, default: 0 },
    totalSales: { type: Number, required: true },
    totalCashSales: { type: Number, default: 0 },
    totalCardSales: { type: Number, default: 0 },
    totalOtherSales: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    expectedCash: { type: Number, required: true },
    actualCash: { type: Number, required: true },
    difference: { type: Number, default: 0 },
    notes: { type: String },
    isClosed: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ZBill', zBillSchema);
