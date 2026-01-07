const mongoose = require('mongoose');
const User = require('../models/User');

const testHash = async () => {
    try {
        const password = 'password123';
        console.log('Hashing:', password);
        const salt = await require('bcryptjs').genSalt(10);
        console.log('Salt:', salt);
        const hash = await require('bcryptjs').hash(password, salt);
        console.log('Hash:', hash);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

testHash();
