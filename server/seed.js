require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const LostItem = require('./src/models/LostItem');
const FoundItem = require('./src/models/FoundItem');
const Match = require('./src/models/Match');
const { runMatchingForLostItem } = require('./src/services/matchingService');

const seedData = async () => {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clean existing test data (optional)
    console.log('🧹 Clearing old collections...');
    await User.deleteMany({});
    await LostItem.deleteMany({});
    await FoundItem.deleteMany({});
    await Match.deleteMany({});

    // Create demo users
    console.log('👤 Creating users...');
    const adminUser = await User.create({
      name: 'Admin Supervisor',
      email: 'admin@lostlink.com',
      phone: '+1 555-0199',
      password: 'Password123!',
      role: 'admin',
    });

    const user1 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      phone: '+1 555-0144',
      password: 'Password123!',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Marcus Brody',
      email: 'marcus@example.com',
      phone: '+1 555-0188',
      password: 'Password123!',
      role: 'user',
    });

    console.log('📱 Creating lost and found items...');
    // Sarah lost an iPhone 14 Pro in Central Park Library
    const lostItem1 = await LostItem.create({
      reportedBy: user1._id,
      itemName: 'iPhone 14 Pro Deep Purple',
      category: 'Electronics',
      subcategory: 'Smartphones',
      description: 'Lost my iPhone 14 Pro 256GB in Deep Purple with a clear case and gold ring kickstand on the back.',
      brand: 'Apple',
      color: 'Purple',
      distinguishingFeatures: 'Clear MagSafe case with a tiny chip on bottom left edge',
      privateDetails: 'Lock screen wallpaper is a golden retriever named Luna. Serial ends with 49X9.',
      dateLost: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      location: {
        address: '5th Ave & 42nd St, Central Library',
        city: 'New York',
        state: 'NY',
        coordinates: { lat: 40.7532, lng: -73.9822 },
      },
    });

    // Marcus found a purple iPhone in the same area
    const foundItem1 = await FoundItem.create({
      reportedBy: user2._id,
      itemName: 'Apple iPhone Purple in Clear Case',
      category: 'Electronics',
      subcategory: 'Smartphones',
      description: 'Found a dark purple iPhone on a wooden reading desk on the 2nd floor of Central Library.',
      brand: 'Apple',
      color: 'Purple',
      distinguishingFeatures: 'Has a transparent case with a kickstand',
      dateFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      location: {
        address: 'Central Library 2nd Floor',
        city: 'New York',
        state: 'NY',
        coordinates: { lat: 40.7533, lng: -73.9824 },
      },
    });

    // Lost item 2: Leather Wallet
    const lostItem2 = await LostItem.create({
      reportedBy: user2._id,
      itemName: 'Brown Leather Bifold Wallet',
      category: 'Accessories',
      subcategory: 'Wallets',
      description: 'Vintage brown Bellroy leather wallet with driver license and transit card inside.',
      brand: 'Bellroy',
      color: 'Brown',
      distinguishingFeatures: 'Embossed owl logo on bottom corner',
      privateDetails: 'Contains state ID with initials M.B. and a lucky $2 bill',
      dateLost: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      location: {
        address: 'Grand Central Terminal Food Court',
        city: 'New York',
        state: 'NY',
        coordinates: { lat: 40.7527, lng: -73.9772 },
      },
    });

    // Found item 2: Brown Wallet
    const foundItem2 = await FoundItem.create({
      reportedBy: user1._id,
      itemName: 'Brown Leather Men Wallet',
      category: 'Accessories',
      subcategory: 'Wallets',
      description: 'Found a nice brown leather wallet near the dining concourse seating area.',
      brand: 'Bellroy',
      color: 'Brown',
      distinguishingFeatures: 'Owl logo embossed on leather',
      dateFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      location: {
        address: 'Grand Central Terminal Main Concourse',
        city: 'New York',
        state: 'NY',
        coordinates: { lat: 40.7528, lng: -73.9770 },
      },
    });

    console.log('⚡ Running intelligent matching engine...');
    await runMatchingForLostItem(lostItem1);
    await runMatchingForLostItem(lostItem2);

    console.log('\n✨ Database successfully seeded!');
    console.log('----------------------------------------------------');
    console.log('👤 Admin Account:');
    console.log('   Email:    admin@lostlink.com');
    console.log('   Password: Password123!');
    console.log('👤 User 1 (Sarah):');
    console.log('   Email:    sarah@example.com');
    console.log('   Password: Password123!');
    console.log('👤 User 2 (Marcus):');
    console.log('   Email:    marcus@example.com');
    console.log('   Password: Password123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
