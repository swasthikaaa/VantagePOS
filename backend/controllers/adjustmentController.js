const Adjustment = require('../models/Adjustment');
const Product = require('../models/Product');

exports.getAdjustments = async (req, res) => {
    try {
        const adjustments = await Adjustment.find().populate('productId', 'name').populate('adjustedBy', 'name');
        res.status(200).json({ success: true, count: adjustments.length, data: adjustments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAdjustment = async (req, res) => {
    try {
        const { productId, variationId, warehouseId, type, quantity, reason, notes } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Update stock in product
        if (variationId) {
            const variation = product.variations.id(variationId);
            if (!variation) return res.status(404).json({ success: false, message: 'Variation not found' });

            if (type === 'Addition') variation.stock += quantity;
            else variation.stock -= quantity;
        } else {
            if (type === 'Addition') product.totalStock += quantity;
            else product.totalStock -= quantity;
        }

        await product.save();

        const adjustment = await Adjustment.create({
            productId, variationId, warehouseId, type, quantity, reason, notes,
            adjustedBy: req.user._id
        });

        res.status(201).json({ success: true, data: adjustment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
