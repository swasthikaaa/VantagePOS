const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
    sku: { type: String, sparse: true }, // Changed to sparse to allow multiple nulls
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    imeiRequired: { type: Boolean, default: false }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    basePrice: { type: Number, required: true },
    variations: [variationSchema],
    totalStock: { type: Number, default: 0 },
    alertQuantity: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
