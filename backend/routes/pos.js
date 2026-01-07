const express = require('express');
const { createInvoice, getInvoices } = require('../controllers/posController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/checkout', createInvoice);
router.get('/invoices', getInvoices);

module.exports = router;
