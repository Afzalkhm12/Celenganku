import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const TransactionUpdateSchema = z.object({
  categoryId: z.string().optional(),
  description: z.string().optional(),
  transactionDate: z.string().optional(),
});

// PUT /api/transactions/[id] - Update specific transaction
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // FIX: params must be a Promise
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id: transactionId } = await context.params; // FIX: Await params before accessing

  try {
    const body = await request.json();
    const validatedData = TransactionUpdateSchema.parse(body);

    // 1. Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { 
        id: true, 
        account: { select: { user_id: true } } 
      },
    });

    if (!existingTransaction || existingTransaction.account.user_id !== session.user.id) {
      return new NextResponse('Transaction not found or unauthorized', { status: 404 });
    }
    
    // 2. Prepare update data
    const updateData: Prisma.TransactionUpdateInput = {};
    let shouldUpdate = false;

    if (validatedData.categoryId !== undefined) {
      updateData.category = {
          connect: { id: validatedData.categoryId }
      };
      shouldUpdate = true;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
      shouldUpdate = true;
    }
    if (validatedData.transactionDate) {
      updateData.transaction_date = new Date(validatedData.transactionDate);
      shouldUpdate = true;
    }
    
    // Jika tidak ada data yang perlu diubah
    if (!shouldUpdate) {
        const currentTransaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { category: { select: { name: true } }, account: { select: { name: true } } },
         });
         if (!currentTransaction) {
             return new NextResponse('Transaction not found', { status: 404 });
         }
         return NextResponse.json({
            ...currentTransaction,
            amount: currentTransaction.amount.toNumber(), 
         });
    }

    // 3. Perform the update
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: { category: { select: { name: true } }, account: { select: { name: true } } },
    });

    // 4. Return serialized response
    return NextResponse.json({
        ...updatedTransaction,
        amount: updatedTransaction.amount.toNumber(), 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(`Invalid data provided for update: ${error.issues[0].message}`, { status: 400 });
    }
    console.error('[TRANSACTION_PUT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/transactions/[id] - Delete specific transaction
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // FIX: params must be a Promise
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id: transactionId } = await context.params; // FIX: Await params before accessing

  try {
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { 
        id: true, 
        amount: true, 
        type: true, 
        account_id: true,
        account: { select: { user_id: true } } 
      },
    });

    if (!existingTransaction || existingTransaction.account.user_id !== session.user.id) {
      return new NextResponse('Transaction not found or unauthorized', { status: 404 });
    }

    const { amount, type, account_id } = existingTransaction;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Delete the transaction
      await tx.transaction.delete({
        where: { id: transactionId },
      });

      // 2. Adjust the account balance (reverse the original transaction)
      const balanceUpdate = type === 'INCOME' 
        ? { decrement: amount } 
        : { increment: amount }; 
      
      await tx.account.update({
        where: { id: account_id },
        data: { balance: balanceUpdate },
      });
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('[TRANSACTION_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}