import ResponseForm from '@/app/components/ResponseForm';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const form = await prisma.form.findUnique({ where: { formId: id } });

  return {
    title: form?.title || `${id} アンケート`,
  };
}

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await prisma.form.findUnique({ where: { formId: id } });

  if (!form) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">フォームが見つかりません</h1>
          <p className="mb-6 text-gray-600">指定されたアンケートは存在しません。</p>
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

  if (form.status !== '実施中') {
    redirect('/form-end');
  }

  return <ResponseForm formId={id} />;
}
