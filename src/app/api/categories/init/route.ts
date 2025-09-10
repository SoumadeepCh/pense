import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Category } from '@/models';
import { DEFAULT_CATEGORIES } from '@/lib/constants';

// Initialize default categories in the database
export async function POST() {
  try {
    await dbConnect();
    
    // Check if default categories already exist
    const existingDefaults = await Category.countDocuments({ isDefault: true });
    
    if (existingDefaults > 0) {
      return NextResponse.json({ 
        message: 'Default categories already initialized',
        count: existingDefaults 
      });
    }

    // Create default categories
    const defaultCategories = DEFAULT_CATEGORIES.map(cat => ({
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type,
      isDefault: true,
      // userId is not set for default categories
    }));

    const insertedCategories = await Category.insertMany(defaultCategories);
    
    return NextResponse.json({ 
      message: 'Default categories initialized successfully',
      count: insertedCategories.length,
      categories: insertedCategories.map(cat => ({
        id: cat._id.toString(),
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        type: cat.type,
        isDefault: cat.isDefault,
      }))
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error initializing default categories:', error);
    return NextResponse.json(
      { error: 'Failed to initialize default categories' },
      { status: 500 }
    );
  }
}

// Get status of default categories initialization
export async function GET() {
  try {
    await dbConnect();
    
    const defaultCount = await Category.countDocuments({ isDefault: true });
    const isInitialized = defaultCount > 0;
    
    return NextResponse.json({
      isInitialized,
      defaultCategoriesCount: defaultCount,
      expectedCount: DEFAULT_CATEGORIES.length,
    });
    
  } catch (error) {
    console.error('Error checking default categories status:', error);
    return NextResponse.json(
      { error: 'Failed to check default categories status' },
      { status: 500 }
    );
  }
}
