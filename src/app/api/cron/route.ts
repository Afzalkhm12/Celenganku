import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const dueTransactions = await prisma.recurringTransaction.findMany({
            where: {
                next_occurrence_date: { lte: today },
                OR: [{ end_date: null }, { end_date: { gte: today } }]
            },
        });
        
        for (const recurring of dueTransactions) {
            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                await tx.transaction.create({
                    data: {
                        account_id: recurring.account_id,
                        category_id: recurring.category_id,
                        amount: recurring.amount,
                        type: recurring.type,
                        description: `(Rutin) ${recurring.description}`,
                        transaction_date: today,
                    },
                });

                const balanceUpdate = recurring.type === 'INCOME' 
                    ? { increment: recurring.amount } 
                    : { decrement: recurring.amount };
                
                await tx.account.update({
                    where: { id: recurring.account_id },
                    data: { balance: balanceUpdate },
                });

                const currentNextDate = new Date(recurring.next_occurrence_date);
                const newNextDate = new Date(currentNextDate);
                
                switch (recurring.frequency) {
                    case 'DAILY': newNextDate.setDate(newNextDate.getDate() + 1); break;
                    case 'WEEKLY': newNextDate.setDate(newNextDate.getDate() + 7); break;
                    case 'MONTHLY': newNextDate.setMonth(newNextDate.getMonth() + 1); break;
                }
                
                await tx.recurringTransaction.update({
                    where: { id: recurring.id },
                    data: { next_occurrence_date: newNextDate },
                });
            });
        }

        return NextResponse.json({ message: 'Cron job executed successfully.', processed: dueTransactions.length });
    } catch (error) {
        console.error('[CRON_JOB_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}