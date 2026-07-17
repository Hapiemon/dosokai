import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      formId,
      lastName,
      firstName,
      maidenName,
      phone,
      class: classValue,
      eventDates,
      companionStatus,
      companionAdults,
      companionChildren,
      hasAllergy,
      allergyDetails,
      remarks,
    } = body;

    const targetFormId = formId || 'form1';

    const form = await prisma.form.findUnique({
      where: { formId: targetFormId },
    });

    if (!form) {
      return NextResponse.json(
        { error: 'フォームが見つかりません' },
        { status: 404 }
      );
    }

    if (form.status !== '実施中') {
      return NextResponse.json(
        { error: 'このフォームは現在回答受付を終了しています' },
        { status: 403 }
      );
    }

    // バリデーション
    if (!lastName || !firstName || !phone || !classValue || !eventDates || eventDates.length === 0 || !companionStatus || typeof hasAllergy !== 'boolean') {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // 電話番号の形式チェック
    const phoneRegex = /^\d{10,11}$|^(\d{2,4}-?){2}\d{3,4}$/;
    if (!phoneRegex.test(phone.replace(/-/g, ''))) {
      return NextResponse.json(
        { error: '正しい電話番号を入力してください' },
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
      // 大人と子供の合計が0でないかチェック
      if (adults + children === 0) {
        return NextResponse.json(
          { error: '同伴者ありを選択した場合は、大人または子供の人数を選択してください' },
          { status: 400 }
        );
      }
    }

    // アレルギーが有りの場合、詳細が必須
    if (hasAllergy && (!allergyDetails || allergyDetails.trim() === '')) {
      return NextResponse.json(
        { error: 'アレルギーが有りの場合は、詳細を入力してください' },
        { status: 400 }
      );
    }

    // イベント日程をフラグに変換 (0=チェックなし、1=参加)
    const eventMay3 = eventDates.includes('5月3日') ? 1 : 0;
    const eventSep20 = eventDates.includes('9月20日') ? 1 : 0;
    const notAttending = eventDates.includes('不参加') ? 1 : 0;

    // 日本時間で現在時刻を取得
    const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);

    // データベースに保存
    const response = await prisma.response.create({
      data: {
        lastName,
        firstName,
        maidenName: maidenName || null,
        phone,
        class: classValue,
        formId: targetFormId,
        eventMay3,
        eventSep20,
        notAttending,
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
