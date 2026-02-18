const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing model loading...');

try {
    console.log('Loading User...');
    require('./models/User');
    console.log('Loading Product...');
    require('./models/Product');
    console.log('Loading Order...');
    require('./models/Order');
    console.log('Loading Review...');
    require('./models/Review');
    console.log('Loading Blog...');
    require('./models/Blog');
    console.log('Loading Gallery...');
    require('./models/Gallery');
    console.log('Loading Message...');
    require('./models/Message');

    console.log('All models loaded successfully');
} catch (error) {
    console.error('Error loading models:', error);
    process.exit(1);
}
