import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse('Missing name, email, or password', { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('User with this email already exists', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Gunakan transaksi untuk memastikan semua data dibuat bersamaan
    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Buat pengguna baru
      const user = await tx.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword,
        },
      });

      const userId = user.id;

      // 2. Buat Akun (sumber dana) default untuk pengguna baru
      await tx.account.createMany({
        data: [
          { user_id: userId, name: 'Dompet Tunai', type: 'CASH', balance: 0 },
          { user_id: userId, name: 'Rekening Bank', type: 'BANK', balance: 0 },
          { user_id: userId, name: 'E-Wallet', type: 'E_WALLET', balance: 0 },
        ],
      });

      // 3. Buat Kategori default untuk pengguna baru
      await tx.category.createMany({
        data: [
          // Kategori Pemasukan
          { user_id: userId, name: 'Gaji', type: 'INCOME' },
          { user_id: userId, name: 'Hadiah', type: 'INCOME' },
          { user_id: userId, name: 'Pemasukan Lainnya', type: 'INCOME' }, // PERBAIKAN NAMA
          // Kategori Pengeluaran
          { user_id: userId, name: 'Makanan & Minuman', type: 'EXPENSE' },
          { user_id: userId, name: 'Transportasi', type: 'EXPENSE' },
          { user_id: userId, name: 'Tagihan', type: 'EXPENSE' },
          { user_id: userId, name: 'Belanja', type: 'EXPENSE' },
          { user_id: userId, name: 'Hiburan', type: 'EXPENSE' },
          { user_id: userId, name: 'Kesehatan', type: 'EXPENSE' },
          { user_id: userId, name: 'Pengeluaran Lainnya', type: 'EXPENSE' }, // PERBAIKAN NAMA
        ],
      });

      return user;
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}