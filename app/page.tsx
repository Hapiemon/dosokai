import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">同窓会アンケート</h1>
        <p className="mb-8 text-gray-600">以下から現在のアンケート（フォーム1）に進んでください。</p>
        <Link
          href="/form1"
          className="inline-block rounded-lg bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
        >
          フォーム1へ進む
        </Link>
      </div>
    </main>
  );
}
