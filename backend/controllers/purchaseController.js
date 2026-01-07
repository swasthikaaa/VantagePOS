const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find().populate('warehouse').populate('items.productId');
        res.status(200).json({ success: true, data: purchases });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createPurchase = async (req, res) => {
    try {
        // Generate a purchase number
        const count = await Purchase.countDocuments();
        const purchaseNumber = `PO-${String(count + 1).padStart(5, '0')}`;

        const purchase = await Purchase.create({
            ...req.body,
            purchaseNumber
        });

        res.status(201).json({ success: true, data: purchase });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.receivePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ success: false, message: 'Purchase order not found' });

        if (purchase.status === 'Received') {
            return res.status(400).json({ success: false, message: 'Purchase order already received' });
        }

        // Update stock levels for each product
        for (const item of purchase.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { totalStock: item.quantity }
            });
        }

        purchase.status = 'Received';
        purchase.paymentStatus = 'Paid'; // Assuming paid on receipt for now
        await purchase.save();

        res.status(200).json({ success: true, data: purchase });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.cancelPurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
        res.status(200).json({ success: true, data: purchase });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updatePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ success: false, message: 'Purchase order not found' });

        if (purchase.status === 'Received') {
            return res.status(400).json({ success: false, message: 'Cannot update a received purchase order' });
        }

        const updatedPurchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedPurchase });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ success: false, message: 'Purchase order not found' });

        if (purchase.status === 'Received') {
            return res.status(400).json({ success: false, message: 'Cannot delete a received purchase order' });
        }

        await Purchase.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Purchase order deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
