const Unit = require('../models/Unit');

exports.getUnits = async (req, res) => {
    try {
        const units = await Unit.find();
        res.status(200).json({ success: true, data: units });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createUnit = async (req, res) => {
    try {
        const unit = await Unit.create(req.body);
        res.status(201).json({ success: true, data: unit });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateUnit = async (req, res) => {
    try {
        const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
        res.status(200).json({ success: true, data: unit });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findByIdAndDelete(req.params.id);
        if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
