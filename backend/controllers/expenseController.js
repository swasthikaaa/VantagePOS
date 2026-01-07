const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().populate('recordedBy', 'name email');
        res.status(200).json({ success: true, data: expenses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createExpense = async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            recordedBy: req.user.id
        });
        res.status(201).json({ success: true, data: expense });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.status(200).json({ success: true, data: expense });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
