const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const { z } = require('zod');

// Utility to generate unique invoice number
const generateInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

exports.createInvoice = async (req, res) => {
    try {
        const { items, customerName, customerContact, paymentMethod, amountPaid } = req.body;

        let totalAmount = 0;
        const processedItems = [];

        // Process items and update stock
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) throw new Error(`Product ${item.name} not found`);

            // Find variation if applicable
            let variation;
            if (item.variationId) {
                variation = product.variations.id(item.variationId);
                if (!variation) throw new Error(`Variation ${item.variationId} not found`);
                if (variation.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name} (${variation.name})`);

                variation.stock -= item.quantity;
            } else {
                if (product.totalStock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
                product.totalStock -= item.quantity;
            }

            await product.save();

            const itemSubtotal = (item.unitPrice * item.quantity) - (item.discount || 0) + (item.tax || 0);
            totalAmount += itemSubtotal;

            processedItems.push({
                ...item,
                subtotal: itemSubtotal
            });
        }

        const invoice = await Invoice.create({
            invoiceNumber: generateInvoiceNumber(),
            cashierId: req.user._id,
            customerName,
            customerContact,
            items: processedItems,
            totalAmount,
            paymentMethod,
            amountPaid,
            changeReturned: amountPaid - totalAmount
        });

        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('cashierId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: invoices.length, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
