import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// Define the precise context type Next.js is expecting, where params is a Promise.
interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// FIX: This function signature now exactly matches the error's required type.
// We type `context.params` as a Promise and then `await` it inside the function.
export async function POST(
    request: NextRequest,
    context: RouteContext
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { amount } = body;

        // Await the params promise to resolve to the actual params object
        const params = await context.params;
        const goalId = params.id;

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return new NextResponse('Invalid amount provided', { status: 400 });
        }

        const updatedGoal = await prisma.financialGoal.update({
            where: {
                id: goalId,
                user_id: session.user.id,
            },
            data: {
                current_amount: {
                    increment: numericAmount,
                },
            },
        });

        return NextResponse.json({
            ...updatedGoal,
            target_amount: updatedGoal.target_amount.toNumber(),
            current_amount: updatedGoal.current_amount.toNumber(),
        });

    } catch (error) {
        console.error('[GOALS_ADD_FUNDS_POST]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}