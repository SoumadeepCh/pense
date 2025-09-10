import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Transaction } from '@/models';

// Get all transactions for a user
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

    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .lean();

    // Convert MongoDB _id to id for frontend compatibility
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id.toString(),
      userId: transaction.userId,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// Create a new transaction
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, amount, description, category, type, date } = body;

    if (!userId || !amount || !description || !category || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = new Transaction({
      userId,
      amount,
      description,
      category,
      type,
      date: date ? new Date(date) : new Date(),
    });

    await transaction.save();

    // Format response
    const formattedTransaction = {
      id: transaction._id.toString(),
      userId: transaction.userId,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };

    return NextResponse.json(formattedTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

// Update a transaction
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { id, userId, amount, description, category, type, date } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Transaction ID and User ID are required' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      {
        ...(amount !== undefined && { amount }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedTransaction = {
      id: transaction._id.toString(),
      userId: transaction.userId,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };

    return NextResponse.json(formattedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// Delete a transaction
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Transaction ID and User ID are required' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
