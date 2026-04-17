const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
        await seed();
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seed = async () => {
    // Define models inline to avoid TS/ESM import issues in CJS script
    const CategorySchema = new mongoose.Schema({
        name: { type: String, required: true },
        image: { type: String, required: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    }, { timestamps: true });

    const BannerSchema = new mongoose.Schema({
        title: { type: String, required: true },
        subtitle: { type: String },
        buttonText: { type: String, default: 'Shop Now' },
        image: { type: String, required: true },
        linkUrl: { type: String, required: true },
        position: { type: String, default: 'home-main' },
        isActive: { type: Boolean, default: true },
    }, { timestamps: true });

    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

    // Clear existing
    await Category.deleteMany({});
    await Banner.deleteMany({});

    // Seed Categories (matching the Dyson image categories)
    const categories = [
        { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=200&h=200&fit=crop', order: 1 },
        { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop', order: 2 },
        { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop', order: 3 },
        { name: 'Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', order: 4 },
        { name: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop', order: 5 },
        { name: 'Mobile Phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop', order: 6 },
        { name: 'Stationery', image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=200&h=200&fit=crop', order: 7 },
        { name: 'Toys', image: 'https://images.unsplash.com/photo-1531323380765-ca41f3d85cce?w=200&h=200&fit=crop', order: 8 },
    ];

    await Category.insertMany(categories);
    console.log('Categories Seeded');

    // Seed Main Banner
    const mainBanner = {
        title: 'Style and Speed',
        subtitle: 'Do it all with style, performance, and speed.',
        buttonText: 'Shop Now',
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&h=800&fit=crop',
        linkUrl: '/products',
        position: 'home-main'
    };

    await Banner.create(mainBanner);
    console.log('Banner Seeded');
};

connectDB();
