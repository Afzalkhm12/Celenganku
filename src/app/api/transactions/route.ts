import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, type, categoryId, accountId, description, transactionDate } = body;
    
    if (!amount || !type || !categoryId || !accountId || !transactionDate) {
        return new NextResponse('Missing required fields', { status: 400 });
    }

    // FIX: Convert to number only once on server. Client passes amount as number/float.
    const amountAsDecimal = amount;
    if (isNaN(amountAsDecimal)) {
        return new NextResponse('Invalid amount provided', { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newTransaction = await tx.transaction.create({
        data: {
          amount: amountAsDecimal, 
          type,
          description,
          transaction_date: new Date(transactionDate),
          account_id: accountId,
          category_id: categoryId,
        },
      });

      if (type === 'INCOME') {
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: amountAsDecimal } }, 
        });
      } else {
         await tx.account.update({
          where: { id: accountId },
          data: { balance: { decrement: amountAsDecimal } },
        });
      }

      return newTransaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[TRANSACTIONS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}