const mongoose = require('mongoose');

const specialOfferSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    code: { type: String, unique: true }, // Optional coupon code
    type: {
        type: String,
        enum: ['Percentage', 'Fixed Amount', 'Buy One Get One'],
        required: true
    },
    value: { type: Number, required: true }, // 10 for 10%, or 50 for $50
    minPurchaseAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: String }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('SpecialOffer', specialOfferSchema);
