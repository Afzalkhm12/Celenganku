import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// FIX: Change the type of the context object to make 'params' optional.
// This often resolves the conflict with Next.js's internal type validator.
interface RouteContext {
    params?: { // <-- MADE 'params' OPTIONAL
        id: string;
    };
}

export async function POST(
    request: NextRequest,
    { params }: RouteContext
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // Add a check for params existence, though it should always exist in a dynamic route
    if (!params?.id) {
        return new NextResponse('Missing goal ID', { status: 400 });
    }

    try {
        const body = await request.json();
        const { amount } = body; 

        // Use params.id, which we've checked for existence
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
            // Assuming target_amount and current_amount are Decimal types from Prisma
            target_amount: updatedGoal.target_amount.toNumber(), 
            current_amount: updatedGoal.current_amount.toNumber(),
        });

    } catch (error) {
        console.error('[GOALS_ADD_FUNDS_POST]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}