import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// DELETE /api/transactions/[id] - Delete specific transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const transactionId = params.id;

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
      // Note: The amount field is already a Prisma.Decimal type and handled correctly.
      
      const balanceUpdate = type === 'INCOME' 
        ? { decrement: amount } // Reverse INCOME by decrementing
        : { increment: amount }; // Reverse EXPENSE by incrementing
      
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