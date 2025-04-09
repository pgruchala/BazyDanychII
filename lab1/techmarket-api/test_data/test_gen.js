const { MongoClient } = require('mongodb');
const { faker } = require('@faker-js/faker');
const prisma = require('../src/utils/prisma');
const { getDb } = require('../mongo');

// Connect to MongoDB
async function generateTestData() {
  try {
    const db = getDb();
    console.log('Connected to MongoDB');

    // Get product and user IDs from Prisma
    const products = await prisma.product.findMany({ select: { id: true } });
    const users = await prisma.user.findMany({ select: { id: true } });

    if (products.length === 0 || users.length === 0) {
      console.error('No products or users found in database');
      return;
    }

    console.log(`Found ${products.length} products and ${users.length} users`);

    // Create product views collection if it doesn't exist
    if (!(await db.listCollections({ name: 'productViews' }).toArray()).length) {
      await db.createCollection('productViews');
      console.log('Created productViews collection');
    }

    // Generate product views for the last 30 days
    const productViews = [];
    const today = new Date();
    const sources = ['direct', 'search', 'social', 'referral', 'email'];
    
    // Generate 500-1000 product views
    const viewsCount = faker.datatype.number({ min: 500, max: 1000 });
    console.log(`Generating ${viewsCount} product views...`);
    
    for (let i = 0; i < viewsCount; i++) {
      const productId = products[Math.floor(Math.random() * products.length)].id;
      const userId = users[Math.floor(Math.random() * users.length)].id;
      const daysAgo = faker.datatype.number({ min: 0, max: 30 });
      const viewDate = new Date(today);
      viewDate.setDate(viewDate.getDate() - daysAgo);
      
      // Random time within that day
      viewDate.setHours(faker.datatype.number({ min: 0, max: 23 }));
      viewDate.setMinutes(faker.datatype.number({ min: 0, max: 59 }));
      
      productViews.push({
        productId,
        userId,
        viewDate,
        duration: faker.datatype.number({ min: 5, max: 600 }), // Duration in seconds (5s to 10min)
        source: sources[Math.floor(Math.random() * sources.length)]
      });
      
      if (i % 100 === 0) {
        process.stdout.write('.');
      }
    }
    console.log('\nInserting product views...');
    await db.collection('productViews').insertMany(productViews);
    console.log(`Inserted ${productViews.length} product views`);

    // Generate reviews for products
    // First, clear existing reviews for clean test data
    console.log('Clearing existing reviews...');
    await db.collection('reviews').deleteMany({});
    await db.collection('productRatingStats').deleteMany({});
    
    console.log('Generating reviews...');
    const reviews = [];
    const reviewsCount = faker.datatype.number({ min: 200, max: 400 });
    
    // Ensure we have some reviews for each product
    for (const product of products) {
      // Generate 2-10 reviews per product
      const productReviewCount = faker.datatype.number({ min: 2, max: 10 });
      
      for (let i = 0; i < productReviewCount; i++) {
        // Pick a random user, but ensure no duplicate reviews by user for same product
        const userId = users[Math.floor(Math.random() * users.length)].id;
        
        // Check if review already exists
        const existingReview = reviews.find(r => r.productId === product.id && r.userId === userId);
        if (existingReview) continue;
        
        const daysAgo = faker.datatype.number({ min: 0, max: 90 });
        const createdAt = new Date(today);
        createdAt.setDate(createdAt.getDate() - daysAgo);
        
        const rating = faker.datatype.number({ min: 1, max: 5 });
        
        reviews.push({
          productId: product.id,
          userId,
          rating,
          title: faker.commerce.productAdjective() + ' ' + faker.lorem.words(3),
          content: faker.lorem.paragraph(3),
          pros: Array(faker.datatype.number({ min: 1, max: 5 }))
            .fill()
            .map(() => faker.lorem.sentence()),
          cons: Array(faker.datatype.number({ min: 0, max: 3 }))
            .fill()
            .map(() => faker.lorem.sentence()),
          verifiedPurchase: Math.random() > 0.3, // 70% of reviews are verified purchases
          helpfulCount: faker.datatype.number({ min: 0, max: 50 }),
          createdAt,
          updatedAt: createdAt
        });
      }
    }
    
    console.log(`Inserting ${reviews.length} reviews...`);
    await db.collection('reviews').insertMany(reviews);

    // Update review stats for each product
    console.log('Updating product rating stats...');
    
    // Group reviews by product
    const productReviews = {};
    reviews.forEach(review => {
      if (!productReviews[review.productId]) {
        productReviews[review.productId] = [];
      }
      productReviews[review.productId].push(review);
    });
    
    // Calculate stats for each product
    for (const [productId, productReviewList] of Object.entries(productReviews)) {
      const totalRating = productReviewList.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviewList.length;
      
      const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };
      
      productReviewList.forEach(review => {
        ratingDistribution[review.rating]++;
      });
      
      await db.collection('productRatingStats').updateOne(
        { productId: parseInt(productId) },
        {
          $set: {
            productId: parseInt(productId),
            averageRating,
            totalReviews: productReviewList.length,
            ratingDistribution,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    
    console.log('Test data generation complete!');
    console.log(`Generated ${reviews.length} reviews and ${productViews.length} product views`);
    
  } catch (error) {
    console.error('Error generating test data:', error);
  }
}

if (require.main === module) {
    generateTestData()
      .then(() => {
        console.log('Data generation complete. Press Ctrl+C to exit.');
      })
      .catch(err => {
        console.error('Failed to generate test data:', err);
        process.exit(1);
      });
  }

module.exports = { generateTestData };