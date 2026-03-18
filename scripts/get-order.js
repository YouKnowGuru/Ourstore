import connectDB from '../lib/mongodb.ts';
import Order from '../lib/models/Order.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function getOrder() {
    await connectDB();
    const order = await Order.findOne({ paymentMethod: 'Online' });
    if (order) {
        console.log('Order found:', order._id);
    } else {
        console.log('No online payment order found.');
    }
    process.exit(0);
}

getOrder();
