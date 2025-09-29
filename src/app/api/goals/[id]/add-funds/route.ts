import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; 

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // FIX: params must be a Promise in Next.js 15+
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // FIX: Await the params Promise before accessing properties
    const { id: goalId } = await context.params; 

    if (!goalId) {
        return new NextResponse('Missing goal ID', { status: 400 });
    }

    try {
        const body = await request.json();
        const { amount, accountId } = body; 

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return new NextResponse('Invalid amount provided', { status: 400 });
        }
        
        if (!accountId) {
            return new NextResponse('Missing source accountId', { status: 400 });
        }

        const updatedGoal = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            
            // 1. Debit the source account
            const sourceAccount = await tx.account.findUnique({
                where: { id: accountId, user_id: session.user.id },
                select: { balance: true }
            });
            
            if (!sourceAccount) {
                 throw new Error('Source account not found or unauthorized.');
            }
            
            if (sourceAccount.balance.toNumber() < numericAmount) { 
                throw new Error('Insufficient balance in source account.');
            }
            
            await tx.account.update({
                where: { id: accountId },
                data: {
                    balance: { decrement: numericAmount },
                },
            });
            
            // 2. Increment the goal's current amount
            return await tx.financialGoal.update({ 
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
        });

        return NextResponse.json({
            ...updatedGoal,
            target_amount: updatedGoal.target_amount.toNumber(), 
            current_amount: updatedGoal.current_amount.toNumber(),
        });

    } catch (error) {
        console.error('[GOALS_ADD_FUNDS_POST]', error);
        if (error instanceof Error && (error.message.includes('Source account not found') || error.message.includes('Insufficient balance'))) {
            return new NextResponse(error.message, { status: 403 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}