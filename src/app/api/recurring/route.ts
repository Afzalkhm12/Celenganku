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
    return NextResponse.json(recurring);
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
    const newRecurring = await prisma.recurringTransaction.create({
      data: {
        ...body,
        start_date: new Date(body.start_date),
        next_occurrence_date: new Date(body.start_date),
        end_date: body.end_date ? new Date(body.end_date) : null,
      },
    });
    return NextResponse.json(newRecurring, { status: 201 });
  } catch (error) {
    console.error('[RECURRING_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}