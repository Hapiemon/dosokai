import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// すべてのフォーム一覧を取得
export async function GET(request: NextRequest) {
  try {
    await prisma.form.upsert({
      where: { formId: 'form1' },
      update: {},
      create: {
        formId: 'form1',
        title: '🌸 同窓会のご案内 🌸',
        status: '実施中',
      },
    });

    const forms = await prisma.form.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(forms, { status: 200 });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { error: 'フォーム情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// フォームを作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formId, title } = body;

    if (!formId || !title) {
      return NextResponse.json(
        { error: 'formId と title は必須です' },
        { status: 400 }
      );
    }

    const form = await prisma.form.create({
      data: {
        formId,
        title,
        status: '実施中',
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { error: 'フォーム作成に失敗しました' },
      { status: 500 }
    );
  }
}
