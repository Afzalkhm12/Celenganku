import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import prisma from '../../../lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const recurring = await prisma.recurringTransaction.findMany({
      where: { account: { user_id: session.user.id } },
      include: { category: true, account: true },
      orderBy: { next_occurrence_date: 'asc' },
    });
    // FIX: Map to serializable format to ensure Decimals are converted to numbers
    const serializableRecurring = recurring.map(item => ({
        ...item,
        amount: item.amount.toNumber(),
        account: {
            ...item.account,
            balance: item.account.balance.toNumber(),
        }
    }));
    return NextResponse.json(serializableRecurring);
  } catch (error) {
    console.error('[RECURRING_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body = await request.json();
    
    // Destructure fields from client payload
    const { amount, type, categoryId, accountId, description, frequency, start_date, end_date } = body;

    // FIX: Pastikan amount diparse sebagai float/number
    const amountAsDecimal = parseFloat(amount);
    if (isNaN(amountAsDecimal) || amountAsDecimal <= 0) {
        return new NextResponse('Invalid amount provided or amount is zero/negative', { status: 400 });
    }

    const newRecurring = await prisma.recurringTransaction.create({
      data: {
        // FIX: Mapping eksplisit camelCase ke snake_case foreign keys
        account_id: accountId,
        category_id: categoryId,
        amount: amountAsDecimal, 
        type,
        description,
        frequency,
        start_date: new Date(start_date),
        next_occurrence_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
      },
    });
    return NextResponse.json({
        ...newRecurring,
        amount: newRecurring.amount.toNumber()
    }, { status: 201 });
  } catch (error) {
    console.error('[RECURRING_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}