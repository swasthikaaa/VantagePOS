const express = require('express');
const router = express.Router();
const { getZBills, generateZBill } = require('../controllers/zBillController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('Admin', 'Manager'), getZBills);
router.post('/', authorize('Admin', 'Manager'), generateZBill);

module.exports = router;
