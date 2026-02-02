import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      lastName,
      firstName,
      maidenName,
      class: classValue,
      eventDates,
      attendance,
      attendanceOther,
      companionStatus,
      companionAdults,
      companionChildren,
      hasAllergy,
      allergyDetails,
      remarks,
    } = body;

    // バリデーション
    if (!lastName || !firstName || !classValue || !eventDates || eventDates.length === 0 || !attendance || !companionStatus || typeof hasAllergy !== 'boolean') {
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

    if (companionStatus === '有り') {
      const adults = Number(companionAdults);
      const children = Number(companionChildren);
      if (!Number.isInteger(adults) || !Number.isInteger(children) || adults < 0 || children < 0) {
        return NextResponse.json(
          { error: '同伴者の人数を選択してください' },
          { status: 400 }
        );
      }
    }

    // 日本時間で現在時刻を取得
    const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);

    // データベースに保存
    const response = await prisma.response.create({
      data: {
        lastName,
        firstName,
        maidenName: maidenName || null,
        class: classValue,
        eventDates,
        attendance,
        attendanceOther: attendanceOther || null,
        companionStatus,
        companionAdults: companionStatus === '有り' ? Number(companionAdults) : null,
        companionChildren: companionStatus === '有り' ? Number(companionChildren) : null,
        hasAllergy,
        allergyDetails: allergyDetails || null,
        remarks: remarks || null,
        createdAt: jstDate,
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
