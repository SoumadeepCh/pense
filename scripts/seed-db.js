const { MongoClient } = require('mongodb');
const DEFAULT_CATEGORIES = require('../src/lib/constants').DEFAULT_CATEGORIES;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const categoriesCollection = db.collection('categories');
    
    // Check if default categories already exist
    const existingCount = await categoriesCollection.countDocuments({ isDefault: true });
    
    if (existingCount > 0) {
      console.log(`Default categories already exist (${existingCount} categories)`);
      return;
    }
    
    // Insert default categories
    const defaultCategories = DEFAULT_CATEGORIES.map(cat => ({
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    const result = await categoriesCollection.insertMany(defaultCategories);
    console.log(`Inserted ${result.insertedCount} default categories`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
