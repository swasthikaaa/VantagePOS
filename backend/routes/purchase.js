const express = require('express');
const router = express.Router();
const { getPurchases, createPurchase, updatePurchase, deletePurchase, receivePurchase, cancelPurchase } = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('Admin', 'Manager'));

router.get('/', getPurchases);
router.post('/', createPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);
router.put('/:id/receive', receivePurchase);
router.put('/:id/cancel', cancelPurchase);

module.exports = router;
