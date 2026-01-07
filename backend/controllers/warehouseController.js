const Warehouse = require('../models/Warehouse');

exports.getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find();
        res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.create(req.body);
        res.status(201).json({ success: true, data: warehouse });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
        res.status(200).json({ success: true, data: warehouse });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
        if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
