const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/multivendor_ecommerce';

const PRODUCT_IMAGES = {
  Electronics: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500',
  ],
  'Home & Garden': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
    'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500',
    'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=500',
  ],
  Books: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=500',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500',
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      Vendor.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin created: admin@demo.com / admin123');

    // Create vendors
    const vendorUsers = [
      { name: 'Tech World', email: 'vendor@demo.com', password: 'vendor123', shop: 'TechWorld Store', category: 'Electronics', desc: 'Your one-stop shop for cutting-edge electronics and gadgets.' },
      { name: 'Fashion Hub', email: 'fashion@demo.com', password: 'vendor123', shop: 'Fashion Hub', category: 'Fashion', desc: 'Trendy fashion for all occasions at unbeatable prices.' },
      { name: 'Home Decor', email: 'home@demo.com', password: 'vendor123', shop: 'HomeNest', category: 'Home & Garden', desc: 'Beautiful home décor and garden essentials.' },
      { name: 'Book Palace', email: 'books@demo.com', password: 'vendor123', shop: 'Book Palace', category: 'Books', desc: 'Rare and popular books across all genres.' },
    ];

    const vendors = [];
    for (const v of vendorUsers) {
      const user = await User.create({ name: v.name, email: v.email, password: v.password, role: 'vendor' });
      const vendor = await Vendor.create({
        user: user._id,
        shopName: v.shop,
        shopDescription: v.desc,
        category: v.category,
        isApproved: true,
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        totalSales: Math.floor(Math.random() * 200),
        totalRevenue: Math.floor(Math.random() * 100000),
      });
      vendors.push(vendor);
      console.log(`🏪 Vendor: ${v.email} / ${v.password}`);
    }

    // Create customer
    await User.create({
      name: 'Demo Customer',
      email: 'customer@demo.com',
      password: 'cust123',
      role: 'customer',
    });
    console.log('🛍️  Customer: customer@demo.com / cust123');

    // Create products
    const productsData = [
      // Electronics
      { name: 'Wireless Noise Cancelling Headphones', desc: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.', price: 8999, discountPrice: 6999, category: 'Electronics', stock: 50, vendor: vendors[0]._id, isFeatured: true, rating: 4.5, tags: ['wireless', 'audio', 'headphones'] },
      { name: 'Smart Watch Pro X1', desc: 'Advanced smartwatch with health tracking, GPS, AMOLED display, and 7-day battery life.', price: 15999, discountPrice: 12999, category: 'Electronics', stock: 30, vendor: vendors[0]._id, isFeatured: true, rating: 4.3, tags: ['smartwatch', 'fitness', 'wearable'] },
      { name: 'Mechanical Gaming Keyboard', desc: 'RGB mechanical keyboard with Cherry MX switches, anti-ghosting, and programmable macro keys.', price: 5499, category: 'Electronics', stock: 40, vendor: vendors[0]._id, rating: 4.1, tags: ['gaming', 'keyboard', 'rgb'] },
      { name: 'Portable Bluetooth Speaker', desc: 'Waterproof portable speaker with 360° sound, 12-hour battery, and built-in microphone.', price: 3499, discountPrice: 2799, category: 'Electronics', stock: 60, vendor: vendors[0]._id, rating: 4.6, tags: ['speaker', 'bluetooth', 'portable'] },
      { name: 'USB-C Hub 7-in-1', desc: 'Multiport adapter with HDMI 4K, USB 3.0, SD card reader, and 100W PD charging.', price: 2499, category: 'Electronics', stock: 80, vendor: vendors[0]._id, rating: 4.2, tags: ['usb', 'hub', 'adapter'] },

      // Fashion
      { name: 'Premium Running Shoes', desc: 'Lightweight and breathable running shoes with cushioned soles for maximum comfort.', price: 4999, discountPrice: 3999, category: 'Fashion', stock: 100, vendor: vendors[1]._id, isFeatured: true, rating: 4.7, tags: ['shoes', 'running', 'sports'] },
      { name: 'Slim Fit Chino Pants', desc: 'Classic chino trousers in stretch cotton, perfect for smart-casual looks.', price: 1999, discountPrice: 1499, category: 'Fashion', stock: 120, vendor: vendors[1]._id, rating: 4.0, tags: ['pants', 'chinos', 'casual'] },
      { name: 'Leather Crossbody Bag', desc: 'Genuine leather crossbody bag with adjustable strap and multiple compartments.', price: 3499, category: 'Fashion', stock: 40, vendor: vendors[1]._id, rating: 4.4, tags: ['bag', 'leather', 'fashion'] },
      { name: 'Classic White Sneakers', desc: 'Timeless white sneakers with cushioned insole and durable rubber outsole.', price: 2999, discountPrice: 2499, category: 'Fashion', stock: 80, vendor: vendors[1]._id, isFeatured: true, rating: 4.6, tags: ['sneakers', 'casual', 'shoes'] },

      // Home & Garden
      { name: 'Ergonomic Office Chair', desc: 'Fully adjustable ergonomic chair with lumbar support, headrest, and breathable mesh back.', price: 18999, discountPrice: 14999, category: 'Home & Garden', stock: 20, vendor: vendors[2]._id, isFeatured: true, rating: 4.5, tags: ['chair', 'office', 'ergonomic'] },
      { name: 'Bamboo Cutting Board Set', desc: 'Set of 3 eco-friendly bamboo cutting boards with juice groove and non-slip feet.', price: 1299, category: 'Home & Garden', stock: 90, vendor: vendors[2]._id, rating: 4.3, tags: ['kitchen', 'bamboo', 'cooking'] },
      { name: 'Scented Soy Candle Collection', desc: 'Pack of 4 hand-poured soy wax candles in lavender, vanilla, cedar, and citrus.', price: 1799, discountPrice: 1399, category: 'Home & Garden', stock: 70, vendor: vendors[2]._id, rating: 4.8, tags: ['candle', 'aromatherapy', 'home'] },
      { name: 'Indoor Plant Pot Set', desc: 'Set of 5 ceramic plant pots with drainage holes and saucers in earthy tones.', price: 2199, category: 'Home & Garden', stock: 55, vendor: vendors[2]._id, rating: 4.2, tags: ['plants', 'pots', 'decor'] },

      // Books
      { name: 'Clean Code by Robert Martin', desc: 'A handbook of agile software craftsmanship. Learn to write clean, maintainable code.', price: 699, discountPrice: 549, category: 'Books', stock: 200, vendor: vendors[3]._id, rating: 4.9, tags: ['programming', 'software', 'coding'] },
      { name: 'Atomic Habits', desc: 'An easy and proven way to build good habits and break bad ones by James Clear.', price: 499, discountPrice: 399, category: 'Books', stock: 300, vendor: vendors[3]._id, isFeatured: true, rating: 4.8, tags: ['self-help', 'habits', 'productivity'] },
      { name: 'The Pragmatic Programmer', desc: 'From journeyman to master — a guide to being a better software developer.', price: 799, category: 'Books', stock: 150, vendor: vendors[3]._id, rating: 4.7, tags: ['programming', 'career', 'tech'] },
    ];

    for (const p of productsData) {
      const catImages = PRODUCT_IMAGES[p.category] || PRODUCT_IMAGES['Electronics'];
      await Product.create({
        ...p,
        images: [catImages[Math.floor(Math.random() * catImages.length)]],
        numReviews: Math.floor(Math.random() * 50),
        totalSold: Math.floor(Math.random() * 100),
      });
    }

    console.log(`📦 Created ${productsData.length} products`);
    console.log('\n✅ Database seeded successfully!\n');
    console.log('─────────────────────────────────────');
    console.log('Demo Accounts:');
    console.log('  Admin:    admin@demo.com / admin123');
    console.log('  Vendor:   vendor@demo.com / vendor123');
    console.log('  Customer: customer@demo.com / cust123');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
