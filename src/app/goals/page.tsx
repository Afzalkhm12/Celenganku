import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import GoalsClient from './GoalsClient'; // Impor Client Component
import { FinancialGoal, FinancialTip } from '@prisma/client';

// Tipe data yang aman untuk dikirim ke client
export type SerializableFinancialGoal = Omit<FinancialGoal, 'target_amount' | 'current_amount'> & {
    target_amount: number;
    current_amount: number;
};

export default async function GoalsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    // 1. Ambil data di server
    const goalsData = await prisma.financialGoal.findMany({
      where: { user_id: session.user.id },
      orderBy: { target_date: 'asc' },
    });
    const tipsData = await prisma.financialTip.findMany();

    // 2. Ubah Decimal menjadi number (serialisasi)
    const serializableGoals: SerializableFinancialGoal[] = goalsData.map(goal => ({
        ...goal,
        target_amount: goal.target_amount.toNumber(),
        current_amount: goal.current_amount.toNumber(),
    }));


    return <GoalsClient initialGoals={serializableGoals} initialTips={tipsData} />;
}