import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import prisma from '../../../lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const goals = await prisma.financialGoal.findMany({
      where: { user_id: session.user.id },
      orderBy: { target_date: 'asc' },
    });
    const tips = await prisma.financialTip.findMany();
    
    return NextResponse.json({ goals, tips });
  } catch (error) {
    console.error('[GOALS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body = await request.json();
    const { name, target_amount, target_date } = body;
    
    const newGoal = await prisma.financialGoal.create({
      data: {
        user_id: session.user.id,
        name,
        target_amount,
        target_date: target_date ? new Date(target_date) : null,
      },
    });
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('[GOALS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}