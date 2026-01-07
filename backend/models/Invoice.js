const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    variationId: { type: mongoose.Schema.Types.ObjectId },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    imei: [String]
});

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerContact: { type: String },
    items: [invoiceItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Split'], default: 'Cash' },
    amountPaid: { type: Number, required: true },
    changeReturned: { type: Number, default: 0 },
    status: { type: String, enum: ['Paid', 'Returned', 'Exchanged'], default: 'Paid' },
    originalInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' } // For returns
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
