import ResponseForm from '@/app/components/ResponseForm';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Form1Page() {
  const form = await prisma.form.findUnique({ where: { formId: 'form1' } });

  if (form && form.status !== '実施中') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">このアンケートは終了しました</h1>
          <p className="mb-6 text-gray-600">管理者設定により現在は回答できません。</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            ホームへ戻る
          </Link>
        </div>
      </main>
    );
  }

  return <ResponseForm formId="form1" />;
}
