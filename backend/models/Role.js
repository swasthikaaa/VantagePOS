const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{
        type: String,
        enum: [
            'products.read', 'products.create', 'products.edit', 'products.delete',
            'users.read', 'users.create', 'users.edit', 'users.delete',
            'roles.read', 'roles.create', 'roles.edit', 'roles.delete',
            'sales.read', 'sales.create', 'sales.edit', 'sales.delete',
            'purchases.read', 'purchases.create', 'purchases.edit', 'purchases.delete',
            'expenses.read', 'expenses.create', 'expenses.edit', 'expenses.delete',
            'quotations.read', 'quotations.create', 'quotations.edit', 'quotations.delete',
            'warehouses.read', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
            'adjustments.read', 'adjustments.create', 'adjustments.edit', 'adjustments.delete',
            'offers.read', 'offers.create', 'offers.edit', 'offers.delete',
            'zbills.read', 'zbills.create',
            'settings.read', 'settings.edit'
        ]
    }],
    isPreset: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
