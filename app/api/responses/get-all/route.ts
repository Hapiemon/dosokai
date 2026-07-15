import { NextRequest, NextResponse } from 'next/server';
import { getResponsesByForm } from '@/lib/responseManager';

export async function GET(request: NextRequest) {
  try {
    const formId = request.nextUrl.searchParams.get('formId') || 'form1';
    const responses = await getResponsesByForm(formId);

    return NextResponse.json(responses, { status: 200 });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'データ取得に失敗しました' },
      { status: 500 }
    );
  }
}
