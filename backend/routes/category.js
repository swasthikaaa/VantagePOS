const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getCategories);
router.post('/', authorize('Admin', 'Manager'), createCategory);
router.put('/:id', authorize('Admin', 'Manager'), updateCategory);
router.delete('/:id', authorize('Admin'), deleteCategory);

module.exports = router;
