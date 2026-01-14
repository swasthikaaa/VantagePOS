require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

// Routes
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

/* Middleware */
// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || '*'
        : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

/* Routes */
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

app.use('/api', apiRouter);

/* Health */
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

/* MongoDB (serverless safe) */
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
connectDB();

module.exports = app;
