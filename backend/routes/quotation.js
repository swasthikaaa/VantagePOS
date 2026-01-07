const express = require('express');
const router = express.Router();
const { getQuotations, createQuotation, updateQuotationStatus, updateQuotation, deleteQuotation } = require('../controllers/quotationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getQuotations);
router.post('/', createQuotation);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);
router.put('/:id/status', updateQuotationStatus);

module.exports = router;
