import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PARTICIPATION_OPTIONS = ['参加', '不参加'] as const;
const PAYMENT_OPTIONS = ['', '現金', 'PayPay', 'その他'] as const;
const SETTLEMENT_OPTIONS = ['未', '済'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const participationStatus = body.participationStatus as string;
    const paymentMethod = body.paymentMethod as string;
    const settlementStatus = body.settlementStatus as string;
    const remarks = body.remarks as string;

    if (!PARTICIPATION_OPTIONS.includes(participationStatus as (typeof PARTICIPATION_OPTIONS)[number])) {
      return NextResponse.json({ error: '参加可否の値が不正です' }, { status: 400 });
    }

    if (!PAYMENT_OPTIONS.includes(paymentMethod as (typeof PAYMENT_OPTIONS)[number])) {
      return NextResponse.json({ error: '支払い方法の値が不正です' }, { status: 400 });
    }

    if (!SETTLEMENT_OPTIONS.includes(settlementStatus as (typeof SETTLEMENT_OPTIONS)[number])) {
      return NextResponse.json({ error: '精算ステータスの値が不正です' }, { status: 400 });
    }

    if (typeof remarks !== 'string') {
      return NextResponse.json({ error: '概要の値が不正です' }, { status: 400 });
    }

    const target = await prisma.responseForm2.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: '対象データが見つかりません' }, { status: 404 });
    }

    const adultsCount = target.companionStatus === '有り' ? target.companionAdults ?? 0 : 0;
    const settlementAmount = participationStatus === '参加' ? (adultsCount + 1) * 3800 : 0;

    const updated = await prisma.responseForm2.update({
      where: { id },
      data: {
        participationStatus,
        paymentMethod: paymentMethod || null,
        settlementStatus,
        remarks: remarks.trim() ? remarks : null,
        settlementAmount,
      },
    });

    return NextResponse.json({ message: '更新しました', data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating form2 response:', error);
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
  }
}
