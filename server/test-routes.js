require('dotenv').config();
const express = require('express');
const app = express();

console.log('Testing route loading...');

try {
    console.log('Loading authRoutes...');
    require('./routes/authRoutes');
    console.log('SUCCESS: authRoutes');

    console.log('Loading userRoutes...');
    require('./routes/userRoutes');
    console.log('SUCCESS: userRoutes');

    console.log('Loading productRoutes...');
    require('./routes/productRoutes');
    console.log('SUCCESS: productRoutes');

    console.log('Loading orderRoutes...');
    require('./routes/orderRoutes');
    console.log('SUCCESS: orderRoutes');

    console.log('Loading adminRoutes...');
    require('./routes/adminRoutes');
    console.log('SUCCESS: adminRoutes');

    console.log('Loading blogRoutes...');
    require('./routes/blogRoutes');
    console.log('SUCCESS: blogRoutes');

    console.log('Loading galleryRoutes...');
    require('./routes/galleryRoutes');
    console.log('SUCCESS: galleryRoutes');

    console.log('Loading messageRoutes...');
    require('./routes/messageRoutes');
    console.log('SUCCESS: messageRoutes');

} catch (error) {
    console.error('FAILED:', error);
}
