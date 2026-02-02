import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '削除するIDを指定してください' },
        { status: 400 }
      );
    }

    // IDの妥当性チェック
    if (!ids.every(id => typeof id === 'string')) {
      return NextResponse.json(
        { error: '無効なIDが含まれています' },
        { status: 400 }
      );
    }

    // 指定されたIDのレコードを削除
    const result = await prisma.response.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json(
      { message: `${result.count}件のレコードを削除しました`, deletedCount: result.count },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting responses:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}
