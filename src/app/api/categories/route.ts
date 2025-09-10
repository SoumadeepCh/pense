import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Category } from '@/models';

// Get all categories for a user (including default categories)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get both default categories and user-specific categories
    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { userId: userId }
      ]
    }).sort({ isDefault: -1, name: 1 }).lean();

    // Convert MongoDB _id to id for frontend compatibility
    const formattedCategories = categories.map(category => ({
      id: (category._id as { toString(): string }).toString(),
      userId: category.userId,
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// Create a new custom category
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, name, color, icon, type } = body;

    if (!userId || !name || !color || !icon || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({
      $or: [
        { userId, name },
        { isDefault: true, name }
      ]
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }

    const category = new Category({
      userId,
      name,
      color,
      icon,
      type,
      isDefault: false,
    });

    await category.save();

    // Format response
    const formattedCategory = {
      id: category._id.toString(),
      userId: category.userId,
      name: category.name,
      color: category.color,
      icon: category.icon,
      type: category.type,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json(formattedCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Update a custom category
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { id, userId, name, color, icon, type } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Category ID and User ID are required' },
        { status: 400 }
      );
    }

    // Cannot update default categories
    const category = await Category.findOne({ _id: id, userId, isDefault: false });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or cannot be modified' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing categories
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        $or: [
          { userId, name },
          { isDefault: true, name }
        ]
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category name already exists' },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, userId, isDefault: false },
      {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(type !== undefined && { type }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedCategory = {
      id: updatedCategory._id.toString(),
      userId: updatedCategory.userId,
      name: updatedCategory.name,
      color: updatedCategory.color,
      icon: updatedCategory.icon,
      type: updatedCategory.type,
      isDefault: updatedCategory.isDefault,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    };

    return NextResponse.json(formattedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// Delete a custom category
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Category ID and User ID are required' },
        { status: 400 }
      );
    }

    // Cannot delete default categories
    const category = await Category.findOneAndDelete({
      _id: id,
      userId,
      isDefault: false,
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or cannot be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
