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
      companionStatus,
      companionAdults,
      companionChildren,
      hasAllergy,
      allergyDetails,
      remarks,
    } = body;

    const form = await prisma.form.findUnique({
      where: { formId: 'form2' },
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

    if (!lastName || !firstName || !classValue || !eventDates || eventDates.length === 0 || !companionStatus || typeof hasAllergy !== 'boolean') {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
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
      if (adults + children === 0) {
        return NextResponse.json(
          { error: '同伴者ありを選択した場合は、大人または子供の人数を選択してください' },
          { status: 400 }
        );
      }
    }

    if (hasAllergy && (!allergyDetails || allergyDetails.trim() === '')) {
      return NextResponse.json(
        { error: 'アレルギーが有りの場合は、詳細を入力してください' },
        { status: 400 }
      );
    }

    const eventMay3 = eventDates.includes('5月3日') ? 1 : 0;
    const eventSep20 = eventDates.includes('9月20日') ? 1 : 0;
    const notAttending = eventDates.includes('不参加') ? 1 : 0;

    const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000);

    const response = await prisma.responseForm2.create({
      data: {
        lastName,
        firstName,
        maidenName: maidenName || null,
        class: classValue,
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
    console.error('Error creating form2 response:', error);
    return NextResponse.json(
      { error: '送信に失敗しました' },
      { status: 500 }
    );
  }
}
