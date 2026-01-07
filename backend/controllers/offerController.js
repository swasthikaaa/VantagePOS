const SpecialOffer = require('../models/SpecialOffer');

exports.getOffers = async (req, res) => {
    try {
        const offers = await SpecialOffer.find();
        res.status(200).json({ success: true, count: offers.length, data: offers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const offer = await SpecialOffer.create(req.body);
        res.status(201).json({ success: true, data: offer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const offer = await SpecialOffer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }
        res.status(200).json({ success: true, data: offer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const offer = await SpecialOffer.findByIdAndDelete(req.params.id);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
