const User = require('../models/User');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
    try {
        await User.deleteMany({});
        await Product.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        const admin = new User({
            name: 'Admin User',
            email: 'admin@pos.com',
            password: hashedPassword,
            role: 'Admin'
        });
        // Skip pre-save by using a different method or just accepting it might re-hash (which is fine if we only do it once)
        // Actually, save() will trigger pre-save. If password is already hashed, pre-save will hash it again.
        // Let's modify User.js to check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)

        await admin.save();

        const cashier = new User({
            name: 'Cashier Sarah',
            email: 'cashier@pos.com',
            password: hashedPassword,
            role: 'Cashier'
        });
        await cashier.save();

        const products = [
            { name: 'Nike Air Max', category: 'Footwear', basePrice: 120, totalStock: 50 },
            { name: 'iPhone 15 Pro', category: 'Electronics', basePrice: 999, totalStock: 10 },
            { name: 'Levi 501 Original', category: 'Apparel', basePrice: 65, totalStock: 100 }
        ];
        await Product.insertMany(products);

        console.log('Database Seeded!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(seedDB);
