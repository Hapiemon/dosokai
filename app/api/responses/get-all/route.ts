import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const responses = await prisma.response.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(responses, { status: 200 });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'データ取得に失敗しました' },
      { status: 500 }
    );
  }
}
