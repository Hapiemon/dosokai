import { NextRequest, NextResponse } from 'next/server';
import { getResponsesByForm } from '@/lib/responseManager';

const CSV_HEADERS = [
  '姓',
  '名',
  '旧姓',
  '電話番号',
  '3年時クラス',
  '5月3日参加',
  '9月20日参加',
  '不参加',
  '同伴者有無',
  '同伴者(大人)',
  '同伴者(子供)',
  'アレルギー有無',
  'アレルギー詳細',
  '備考',
  '回答日時',
];

function escapeCsv(value: string | number | null | undefined) {
  const normalized = value === null || value === undefined ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function buildTimestampForFileName() {
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const year = jstNow.getUTCFullYear();
  const month = String(jstNow.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstNow.getUTCDate()).padStart(2, '0');
  const hour = String(jstNow.getUTCHours()).padStart(2, '0');
  const minute = String(jstNow.getUTCMinutes()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}`;
}

function buildSurveyLabel(formId: string) {
  const match = formId.match(/^form(\d+)$/);
  if (match) {
    return `第${match[1]}回アンケート`;
  }

  return `${formId}_アンケート`;
}

export async function GET(request: NextRequest) {
  try {
    const formId = request.nextUrl.searchParams.get('formId') || 'form1';
    const responses = await getResponsesByForm(formId);
    const fileName = `${buildSurveyLabel(formId)}_${buildTimestampForFileName()}.csv`;

    const rows = responses.map((item) => [
      item.lastName,
      item.firstName,
      item.maidenName ?? '',
      item.phone ?? '',
      item.class,
      item.eventMay3 === 1 ? '参加' : '不参加',
      item.eventSep20 === 1 ? '参加' : '不参加',
      item.notAttending === 1 ? '不参加' : '-',
      item.companionStatus,
      item.companionAdults ?? 0,
      item.companionChildren ?? 0,
      item.hasAllergy ? '有り' : '無し',
      item.allergyDetails ?? '',
      item.remarks ?? '',
      new Date(item.createdAt).toLocaleString('ja-JP'),
    ]);

    const csv = [CSV_HEADERS, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
      .join('\n');

    return new NextResponse(`\uFEFF${csv}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="responses.csv"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error('Error exporting responses:', error);
    return NextResponse.json(
      { error: 'CSVエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}
