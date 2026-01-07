const express = require('express');
const router = express.Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getWarehouses);
router.post('/', authorize('Admin', 'Manager'), createWarehouse);
router.put('/:id', authorize('Admin', 'Manager'), updateWarehouse);
router.delete('/:id', authorize('Admin'), deleteWarehouse);

module.exports = router;
