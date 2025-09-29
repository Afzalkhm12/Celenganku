import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import RecurringClient from './RecurringClient';
import { RecurringTransaction, Category, Account as PrismaAccount } from '@prisma/client';

type SerializableAccount = Omit<PrismaAccount, 'balance'> & {
    balance: number;
};
export type SerializableRecurringTransaction = Omit<RecurringTransaction, 'amount' | 'account'> & {
    amount: number;
    category: Category;
    account: SerializableAccount;
};

export default async function RecurringPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    const [recurringData, accounts, categories] = await Promise.all([
        prisma.recurringTransaction.findMany({
            where: { account: { user_id: session.user.id } },
            include: { category: true, account: true },
            orderBy: { next_occurrence_date: 'asc' },
        }),
        prisma.account.findMany({ where: { user_id: session.user.id } }),
        prisma.category.findMany({ where: { user_id: session.user.id } }),
    ]);

    // FIX: Pastikan konversi Decimal ke number dilakukan dengan aman
    const serializableRecurring: SerializableRecurringTransaction[] = recurringData.map(item => ({
        ...item,
        amount: item.amount.toNumber(),
        account: {
            ...item.account,
            balance: item.account.balance.toNumber(),
        }
    }));

    const serializableAccounts = accounts.map(account => ({
        ...account,
        balance: account.balance.toNumber(),
    }));

    return <RecurringClient initialRecurring={serializableRecurring} accounts={serializableAccounts} categories={categories} />;
}