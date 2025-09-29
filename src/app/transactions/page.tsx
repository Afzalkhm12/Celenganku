import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import prisma from '../../lib/prisma';
import { TransactionsClient } from './TransactionsClient';
import { type Transaction as PrismaTransaction } from '@prisma/client';

export type SerializableTransaction = Omit<PrismaTransaction, 'amount'> & {
  amount: number;
  category: { name: string };
  account: { name: string };
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const page = Number(searchParams?.page) || 1;
  const take = 10;
  const skip = (page - 1) * take;

  const [transactions, totalTransactions, accounts, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { account: { user_id: session.user.id } },
      include: { category: { select: { name: true } }, account: { select: { name: true } } },
      orderBy: { transaction_date: 'desc' },
      take,
      skip,
    }),
    prisma.transaction.count({ where: { account: { user_id: session.user.id } } }),
    prisma.account.findMany({ where: { user_id: session.user.id } }),
    prisma.category.findMany({ where: { user_id: session.user.id } }),
  ]);

  const serializableTransactions = transactions.map(tx => ({
    ...tx,
    amount: tx.amount.toNumber(),
  }));
  
  const serializableAccounts = accounts.map(account => ({
    ...account,
    balance: account.balance.toNumber(),
  }));

  return (
    <TransactionsClient
      initialTransactions={serializableTransactions}
      totalTransactions={totalTransactions}
      accounts={serializableAccounts}
      categories={categories}
      currentPage={page}
    />
  );
}