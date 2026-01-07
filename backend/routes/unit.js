const express = require('express');
const router = express.Router();
const { getUnits, createUnit, updateUnit, deleteUnit } = require('../controllers/unitController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getUnits);
router.post('/', authorize('Admin', 'Manager'), createUnit);
router.put('/:id', authorize('Admin', 'Manager'), updateUnit);
router.delete('/:id', authorize('Admin'), deleteUnit);

module.exports = router;
