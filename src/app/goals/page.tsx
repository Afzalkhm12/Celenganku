import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import GoalsClient from './GoalsClient';
import { FinancialGoal } from '@prisma/client'; // FIX: Remove unused PrismaAccount
import { type SerializableAccount } from '../dashboard/page'; 

export type SerializableFinancialGoal = Omit<FinancialGoal, 'target_amount' | 'current_amount'> & {
    target_amount: number;
    current_amount: number;
};

export default async function GoalsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const [goalsData, tipsData, accountsData] = await Promise.all([
      prisma.financialGoal.findMany({
        where: { user_id: session.user.id },
        orderBy: { target_date: 'asc' },
      }),
      prisma.financialTip.findMany(),
      prisma.account.findMany({ where: { user_id: session.user.id } }), 
    ]);

    const serializableGoals: SerializableFinancialGoal[] = goalsData.map(goal => ({
        ...goal,
        target_amount: goal.target_amount.toNumber(),
        current_amount: goal.current_amount.toNumber(),
    }));
    
    const serializableAccounts: SerializableAccount[] = accountsData.map(account => ({
        ...account,
        balance: account.balance.toNumber(),
    }));

    return <GoalsClient 
               initialGoals={serializableGoals} 
               initialTips={tipsData} 
               accounts={serializableAccounts} 
           />;
}