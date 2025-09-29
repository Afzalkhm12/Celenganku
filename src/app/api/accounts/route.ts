import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import prisma from '../../../lib/prisma';
import { z } from 'zod';

const AccountSchema = z.object({
  name: z.string().min(1, 'Nama akun harus diisi'),
  type: z.string().min(1, 'Tipe akun harus diisi'),
  balance: z.number().min(0, 'Saldo tidak boleh negatif'),
});

// GET /api/accounts - Get all accounts for authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' },
    });

    const serializedAccounts = accounts.map(account => ({
      ...account,
      balance: account.balance.toNumber(),
    }));

    return NextResponse.json(serializedAccounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data akun' },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create new account
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = AccountSchema.parse(body);

    const account = await prisma.account.create({
      data: {
        ...validatedData,
        user_id: session.user.id,
      },
    });

    return NextResponse.json({
      ...account,
      balance: account.balance.toNumber(),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message }, // FIX: Changed from 'errors' to 'issues'
        { status: 400 }
      );
    }
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Gagal membuat akun' },
      { status: 500 }
    );
  }
}