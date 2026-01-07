const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    company: {
        name: { type: String, default: 'VantagePOS' },
        logo: { type: String },
        address: { type: String },
        phone: { type: String },
        email: { type: String },
        taxId: { type: String },
        website: { type: String }
    },
    receipt: {
        showCompanyName: { type: Boolean, default: true },
        showAddress: { type: Boolean, default: true },
        showPhone: { type: Boolean, default: true },
        showTaxId: { type: Boolean, default: false },
        showDate: { type: Boolean, default: true },
        showTime: { type: Boolean, default: true },
        footerText: { type: String, default: 'Thank you for your business!' },
        showThankYou: { type: Boolean, default: true }
    },
    mail: {
        smtpHost: { type: String },
        smtpPort: { type: Number, default: 587 },
        smtpUser: { type: String },
        smtpPassword: { type: String },
        fromEmail: { type: String },
        fromName: { type: String }
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
