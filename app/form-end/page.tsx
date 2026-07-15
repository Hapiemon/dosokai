import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'アンケート終了',
};

export default function FormEndPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">このアンケートは終了しました</h1>
        <p className="mb-6 text-gray-600">現在は回答受付を終了しています。</p>
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
