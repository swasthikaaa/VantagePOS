const ZBill = require('../models/ZBill');
const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');

exports.getZBills = async (req, res) => {
    try {
        const bills = await ZBill.find().populate('closedBy', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: bills.length, data: bills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.generateZBill = async (req, res) => {
    try {
        const { openingCash, actualCash, notes } = req.body;

        // Calculate totals for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const invoices = await Invoice.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const expenses = await Expense.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        let totalSales = 0;
        let totalCashSales = 0;
        let totalCardSales = 0;

        invoices.forEach(inv => {
            totalSales += inv.totalAmount;
            if (inv.paymentMethod === 'Cash') totalCashSales += inv.totalAmount;
            else if (inv.paymentMethod === 'Card') totalCardSales += inv.totalAmount;
        });

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const expectedCash = (openingCash || 0) + totalCashSales - totalExpenses;
        const difference = actualCash - expectedCash;

        const zBill = await ZBill.create({
            billNumber: `Z-${Date.now()}`,
            closedBy: req.user._id,
            openingCash,
            totalSales,
            totalCashSales,
            totalCardSales,
            totalExpenses,
            expectedCash,
            actualCash,
            difference,
            notes
        });

        res.status(201).json({ success: true, data: zBill });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
