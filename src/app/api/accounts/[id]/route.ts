import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

const AccountUpdateSchema = z.object({
  name: z.string().min(1, 'Nama akun harus diisi').optional(),
  type: z.string().min(1, 'Tipe akun harus diisi').optional(),
  balance: z.number().min(0, 'Saldo tidak boleh negatif').optional(),
});

// GET /api/accounts/[id] - Get specific account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        id,
        user_id: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...account,
      balance: account.balance.toNumber(),
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data akun' },
      { status: 500 }
    );
  }
}

// PUT /api/accounts/[id] - Update account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = AccountUpdateSchema.parse(body);

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        user_id: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan' },
        { status: 404 }
      );
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({
      ...updatedAccount,
      balance: updatedAccount.balance.toNumber(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui akun' },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id] - Delete account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        user_id: session.user.id,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { account_id: id },
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun yang masih memiliki transaksi' },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Akun berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus akun' },
      { status: 500 }
    );
  }
}