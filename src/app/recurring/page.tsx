import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import RecurringClient from './RecurringClient'; // Impor Client Component
import { RecurringTransaction, Category, Account as PrismaAccount } from '@prisma/client';

// Tipe data yang aman untuk dikirim ke client
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

    const recurringData = await prisma.recurringTransaction.findMany({
      where: { account: { user_id: session.user.id } },
      include: { category: true, account: true },
      orderBy: { next_occurrence_date: 'asc' },
    });

    // Ubah Decimal menjadi number
    const serializableRecurring: SerializableRecurringTransaction[] = recurringData.map(item => ({
        ...item,
        amount: item.amount.toNumber(),
        account: {
            ...item.account,
            balance: item.account.balance.toNumber(),
        }
    }));

    return <RecurringClient initialRecurring={serializableRecurring} />;
}