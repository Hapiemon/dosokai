import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// フォームの詳細情報を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    const form = await prisma.form.findUnique({
      where: { formId },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'フォームが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { error: 'フォーム情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// フォームのステータスを更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['実施中', '終了'].includes(status)) {
      return NextResponse.json(
        { error: 'status は "実施中" または "終了" である必要があります' },
        { status: 400 }
      );
    }

    const form = await prisma.form.update({
      where: { formId },
      data: { status },
    });

    return NextResponse.json(form, { status: 200 });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { error: 'フォーム更新に失敗しました' },
      { status: 500 }
    );
  }
}
