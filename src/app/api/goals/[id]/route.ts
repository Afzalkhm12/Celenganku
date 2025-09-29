import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const GoalUpdateSchema = z.object({
    name: z.string().min(1, 'Nama harus diisi').optional(),
    target_amount: z.number().min(0, 'Jumlah target tidak boleh negatif').optional(),
    target_date: z.string().nullable().optional(),
});

// PUT /api/goals/[id] - Update goal
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = GoalUpdateSchema.parse(body);

        const existingGoal = await prisma.financialGoal.findFirst({
            where: {
                id: params.id,
                user_id: session.user.id,
            },
        });

        if (!existingGoal) {
            return NextResponse.json(
                { error: 'Tujuan Keuangan tidak ditemukan' },
                { status: 404 }
            );
        }

        const updatedGoal = await prisma.financialGoal.update({
            where: { id: params.id },
            data: {
                name: validatedData.name,
                target_amount: validatedData.target_amount,
                target_date: validatedData.target_date === null ? null : (validatedData.target_date ? new Date(validatedData.target_date) : undefined),
            },
        });

        return NextResponse.json({
            ...updatedGoal,
            target_amount: updatedGoal.target_amount.toNumber(),
            current_amount: updatedGoal.current_amount.toNumber(),
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('[GOALS_PUT]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// DELETE /api/goals/[id] - Delete specific goal
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const goalId = params.id;

        const existingGoal = await prisma.financialGoal.findFirst({
            where: {
                id: goalId,
                user_id: session.user.id,
            },
        });

        if (!existingGoal) {
            return NextResponse.json(
                { error: 'Tujuan Keuangan tidak ditemukan' },
                { status: 404 }
            );
        }
        
        await prisma.financialGoal.delete({
            where: { id: goalId },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[GOALS_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}