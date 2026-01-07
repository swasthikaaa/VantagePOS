const express = require('express');
const router = express.Router();
const { getAdjustments, createAdjustment } = require('../controllers/adjustmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('Admin', 'Manager'), getAdjustments);
router.post('/', authorize('Admin', 'Manager'), createAdjustment);

module.exports = router;
