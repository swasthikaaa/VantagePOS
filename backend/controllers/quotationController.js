const Quotation = require('../models/Quotation');

exports.getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find();
        res.status(200).json({ success: true, data: quotations });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.createQuotation = async (req, res) => {
    try {
        const count = await Quotation.countDocuments();
        const quotationNumber = `QT-${String(count + 1).padStart(5, '0')}`;

        const quotation = await Quotation.create({
            ...req.body,
            quotationNumber
        });
        res.status(201).json({ success: true, data: quotation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateQuotationStatus = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndUpdate(req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
        res.status(200).json({ success: true, data: quotation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

        if (quotation.status === 'Accepted') {
            return res.status(400).json({ success: false, message: 'Cannot update an accepted quotation' });
        }

        const updatedQuotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedQuotation });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

        if (quotation.status === 'Accepted') {
            return res.status(400).json({ success: false, message: 'Cannot delete an accepted quotation' });
        }

        await Quotation.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Quotation deleted' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
