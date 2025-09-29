import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// FIX: This is the definitive, correct type signature Next.js expects for this dynamic route handler.
// The second argument is a context object containing the params.
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } } 
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const body = await request.json();
        const { amount } = body;
        const goalId = params.id; // params.id is correctly typed as a string here

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

        // Ensure the response is serializable by converting Decimal types to numbers
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