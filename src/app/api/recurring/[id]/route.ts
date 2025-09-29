import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// DELETE /api/recurring/[id] - Delete specific recurring transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const recurringId = params.id;

  try {
    // Check if recurring transaction exists and belongs to user
    const existingRecurring = await prisma.recurringTransaction.findFirst({
        where: {
            id: recurringId,
            account: { user_id: session.user.id }
        },
        // We do not need the full account info, just the user_id check through the relation is enough
        select: { id: true } 
    });
    
    if (!existingRecurring) {
        return NextResponse.json(
            { error: 'Transaksi rutin tidak ditemukan' },
            { status: 404 }
        );
    }
    
    await prisma.recurringTransaction.delete({
      where: { id: recurringId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[RECURRING_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}