const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';

async function createDemoUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Check if demo user already exists
    const existingUser = await usersCollection.findOne({ email: 'demo@example.com' });
    
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }
    
    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    const demoUser = {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await usersCollection.insertOne(demoUser);
    console.log(`Demo user created with ID: ${result.insertedId}`);
    
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  createDemoUser();
}

module.exports = createDemoUser;
