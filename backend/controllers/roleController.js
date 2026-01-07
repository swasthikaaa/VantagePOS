const Role = require('../models/Role');

exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json({ success: true, count: roles.length, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json({ success: true, data: role });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        let role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        if (role.isPreset) {
            return res.status(400).json({ success: false, message: 'Cannot update preset roles' });
        }
        role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: role });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }
        if (role.isPreset) {
            return res.status(400).json({ success: false, message: 'Cannot delete preset roles' });
        }
        await role.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
