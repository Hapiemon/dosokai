'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Form {
  id: string;
  formId: string;
  title: string;
  status: string;
}

export default function HomePageClient() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-8 text-center shadow-xl mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-800">🌸 同窓会アンケート 🌸</h1>
          <p className="text-gray-600">下記のアンケートにご協力ください</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">読み込み中...</div>
        ) : forms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>現在利用可能なアンケートがありません</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {forms.map((form) => (
              <div
                key={form.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{form.title}</h2>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                      form.status === '実施中'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {form.status}
                  </div>
                </div>

                <div className="mt-4">
                  {form.status === '実施中' ? (
                    <Link
                      href={`/${form.formId}`}
                      className="inline-block rounded-lg bg-pink-600 px-6 py-2 font-semibold text-white transition hover:bg-pink-700"
                    >
                      アンケートに進む
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-block rounded-lg bg-gray-300 px-6 py-2 font-semibold text-gray-500 cursor-not-allowed"
                    >
                      終了しました
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
