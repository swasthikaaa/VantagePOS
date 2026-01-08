require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('../routes/auth');
const productRoutes = require('../routes/products');
const posRoutes = require('../routes/pos');
const warehouseRoutes = require('../routes/warehouse');
const purchaseRoutes = require('../routes/purchase');
const expenseRoutes = require('../routes/expense');
const quotationRoutes = require('../routes/quotation');
const notificationRoutes = require('../routes/notification');
const settingsRoutes = require('../routes/settings');
const unitRoutes = require('../routes/unit');
const categoryRoutes = require('../routes/category');
const roleRoutes = require('../routes/role');
const offerRoutes = require('../routes/offer');
const adjustmentRoutes = require('../routes/adjustment');
const zBillRoutes = require('../routes/zBill');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["https://vantage-pos-nine.vercel.app", "http://localhost:5173"],
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/zbills', zBillRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // For Vercel
