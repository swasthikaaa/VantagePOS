const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('Admin', 'Manager'), getExpenses);
router.post('/', createExpense);
router.put('/:id', authorize('Admin', 'Manager'), updateExpense);
router.delete('/:id', authorize('Admin'), deleteExpense);

module.exports = router;
