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

const corsOptions = {
    origin: true, // Reflects the request origin, allowing credentials to work
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Routes
// Create API Router
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/pos', posRoutes);
apiRouter.use('/warehouses', warehouseRoutes);
apiRouter.use('/purchases', purchaseRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/quotations', quotationRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/units', unitRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/offers', offerRoutes);
apiRouter.use('/adjustments', adjustmentRoutes);
apiRouter.use('/zbills', zBillRoutes);

// Mount Router
app.use('/api', apiRouter);
app.use('/', apiRouter);

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
        // Do not exit process in serverless environment, better to return 500 on request
        // process.exit(1); 
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // For Vercel
