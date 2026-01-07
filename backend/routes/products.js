const express = require('express');
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(protect, getProducts)
    .post(protect, authorize('Admin', 'Manager'), createProduct);

router.get('/low-stock', protect, getLowStockProducts);

router.route('/:id')
    .put(protect, authorize('Admin', 'Manager'), updateProduct)
    .delete(protect, authorize('Admin'), deleteProduct);

module.exports = router;
