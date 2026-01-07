const express = require('express');
const router = express.Router();
const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getOffers);
router.post('/', authorize('Admin', 'Manager'), createOffer);
router.put('/:id', authorize('Admin', 'Manager'), updateOffer);
router.delete('/:id', authorize('Admin', 'Manager'), deleteOffer);

module.exports = router;
