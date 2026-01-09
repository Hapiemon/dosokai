import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, class: classValue, attendance, attendanceOther, hasAllergy, allergyDetails, remarks } = body;

    // バリデーション
    if (!name || !classValue || !attendance || typeof hasAllergy !== 'boolean') {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // その他を選択した場合、attendanceOtherが必要
    if (attendance === 'その他' && !attendanceOther) {
      return NextResponse.json(
        { error: '出欠で「その他」を選択した場合は詳細を入力してください' },
        { status: 400 }
      );
    }

    // データベースに保存
    const response = await prisma.response.create({
      data: {
        name,
        class: classValue,
        attendance,
        attendanceOther: attendanceOther || null,
        hasAllergy,
        allergyDetails: allergyDetails || null,
        remarks: remarks || null,
      },
    });

    return NextResponse.json(
      { message: '回答を受け付けました', data: response },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json(
      { error: '送信に失敗しました' },
      { status: 500 }
    );
  }
}
