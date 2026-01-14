const Product = require('../models/Product');
const { z } = require('zod');

const productSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string(),
    basePrice: z.number(),
    alertQuantity: z.number().default(0),
    taxRate: z.number().optional(),
    variations: z.array(z.object({
        name: z.string(),
        value: z.string(),
        sku: z.string().optional(),
        price: z.number(),
        stock: z.number().default(0),
        imeiRequired: z.boolean().default(false)
    })).optional()
});

exports.getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true,
            $expr: { $lte: ["$totalStock", "$alertQuantity"] }
        }).populate('category', 'name').populate('unit', 'shortName');

        if (!products) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Low stock error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch low stock products' });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const validatedData = productSchema.parse(req.body);
        const product = await Product.create(validatedData);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product deactivated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
