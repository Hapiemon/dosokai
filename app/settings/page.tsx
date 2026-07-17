'use client';

import { useEffect, useMemo, useState } from 'react';

interface Form {
  id: string;
  formId: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ResponseItem {
  id: string;
  lastName: string;
  firstName: string;
  maidenName: string | null;
  phone: string | null;
  class: string;
  eventMay3: number;
  eventSep20: number;
  notAttending: number;
  companionStatus: string;
  companionAdults: number | null;
  companionChildren: number | null;
  hasAllergy: boolean;
  allergyDetails: string | null;
  remarks: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'forms' | 'responses'>('forms');
  const [message, setMessage] = useState('');

  const [forms, setForms] = useState<Form[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [updatingFormId, setUpdatingFormId] = useState<string | null>(null);

  const [selectedFormId, setSelectedFormId] = useState('form1');
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [responsesLoading, setResponsesLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (activeTab === 'responses') {
      fetchResponses(selectedFormId);
    }
  }, [activeTab, selectedFormId]);

  const selectedForm = useMemo(
    () => forms.find((item) => item.formId === selectedFormId),
    [forms, selectedFormId]
  );

  const fetchForms = async () => {
    try {
      setFormsLoading(true);
      const response = await fetch('/api/forms');
      if (!response.ok) {
        setMessage('フォーム情報の取得に失敗しました');
        return;
      }

      const data: Form[] = await response.json();
      setForms(data);

      if (data.length > 0 && !data.some((item) => item.formId === selectedFormId)) {
        setSelectedFormId(data[0].formId);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('フォーム情報の取得に失敗しました');
    } finally {
      setFormsLoading(false);
    }
  };

  const handleToggleFormStatus = async (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === '実施中' ? '終了' : '実施中';

    try {
      setUpdatingFormId(formId);
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        setMessage('ステータス変更に失敗しました');
        return;
      }

      setMessage(`フォーム「${formId}」を「${newStatus}」に変更しました`);
      await fetchForms();
    } catch (error) {
      console.error('Error:', error);
      setMessage('ステータス変更に失敗しました');
    } finally {
      setUpdatingFormId(null);
    }
  };

  const fetchResponses = async (formId: string) => {
    try {
      setResponsesLoading(true);
      setSelectedIds(new Set());

      const response = await fetch(`/api/responses/get-all?formId=${encodeURIComponent(formId)}`);
      if (!response.ok) {
        setMessage('回答データの取得に失敗しました');
        return;
      }

      const data: ResponseItem[] = await response.json();
      setResponses(data);
    } catch (error) {
      console.error('Error:', error);
      setMessage('回答データの取得に失敗しました');
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(responses.map((item) => item.id)));
      return;
    }

    setSelectedIds(new Set());
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      setMessage('削除するレコードを選択してください');
      return;
    }

    if (!window.confirm(`${selectedIds.size}件のレコードを削除しますか？`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch('/api/responses/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: selectedFormId,
          ids: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        setMessage('削除に失敗しました');
        return;
      }

      const result = await response.json();
      setMessage(`${result.deletedCount}件を削除しました`);
      setSelectedIds(new Set());
      await fetchResponses(selectedFormId);
    } catch (error) {
      console.error('Error:', error);
      setMessage('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const response = await fetch(`/api/responses/export?formId=${encodeURIComponent(selectedFormId)}`);
      if (!response.ok) {
        setMessage('CSVエクスポートに失敗しました');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers.get('Content-Disposition') || '';
      const fileNameUtf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
      const fileName = fileNameUtf8Match?.[1]
        ? decodeURIComponent(fileNameUtf8Match[1])
        : fileNameMatch?.[1] || `${selectedFormId}-responses.csv`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      setMessage('CSVエクスポートに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8">
          <div className="mb-6 sm:mb-8 border-b pb-4 sm:pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">⚙️ 設定</h1>
            <p className="text-xs sm:text-base text-gray-600">アンケートと回答データの管理</p>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              {message}
            </div>
          )}

          <div className="mb-6 flex gap-2 sm:gap-4 border-b text-sm sm:text-base">
            <button
              onClick={() => setActiveTab('forms')}
              className={`pb-1 sm:pb-2 px-2 sm:px-4 font-semibold transition-colors text-xs sm:text-sm ${
                activeTab === 'forms'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 フォーム管理
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`pb-1 sm:pb-2 px-2 sm:px-4 font-semibold transition-colors text-xs sm:text-sm ${
                activeTab === 'responses'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 回答管理
            </button>
          </div>

          {activeTab === 'forms' && (
            <div>
              <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">アンケートのステータス管理</h2>
                <button
                  onClick={fetchForms}
                  disabled={formsLoading}
                  className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto"
                >
                  更新
                </button>
              </div>

              {formsLoading ? (
                <div className="text-center py-12 text-gray-500">読み込み中...</div>
              ) : forms.length === 0 ? (
                <div className="text-center py-12 text-gray-500">フォームが登録されていません</div>
              ) : (
                <div className="grid gap-4">
                  {forms.map((form) => (
                    <div
                      key={form.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{form.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">ID: {form.formId}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            form.status === '実施中'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {form.status}
                        </div>

                        <button
                          onClick={() => handleToggleFormStatus(form.formId, form.status)}
                          disabled={updatingFormId === form.formId}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-semibold"
                        >
                          {updatingFormId === form.formId
                            ? '変更中...'
                            : form.status === '実施中'
                              ? '終了する'
                              : '再開する'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'responses' && (
            <div>
              <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <label className="font-semibold text-gray-700">対象フォーム</label>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs sm:text-sm"
                >
                  {forms.map((form) => (
                    <option key={form.formId} value={form.formId}>
                      {form.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => fetchResponses(selectedFormId)}
                  disabled={responsesLoading}
                  className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:bg-gray-400 text-xs sm:text-sm"
                >
                  更新
                </button>
                <button
                  onClick={handleExportCsv}
                  disabled={exporting || responsesLoading}
                  className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-semibold text-xs sm:text-sm"
                >
                  {exporting ? '出力中...' : 'CSVエクスポート'}
                </button>
              </div>

              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">{selectedIds.size}件選択</span>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={deleting}
                      className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm w-full sm:w-auto"
                    >
                      {deleting ? '削除中...' : '選択した行を削除'}
                    </button>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">{selectedForm?.title ?? ''}</span>
              </div>

              {responsesLoading ? (
                <div className="text-center py-12 text-gray-500">読み込み中...</div>
              ) : responses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">データがありません</div>
              ) : (
                <div className="overflow-auto max-h-[70vh] -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="min-w-max border-separate border-spacing-0 border border-gray-300 text-xs sm:text-sm whitespace-nowrap bg-white">
                    <thead>
                      <tr>
                        <th className="sticky top-0 left-0 z-50 w-12 min-w-12 border border-gray-300 bg-gray-100 p-1 sm:p-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === responses.length && responses.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
                          />
                        </th>
                        <th className="sticky top-0 left-12 z-40 min-w-28 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">姓</th>
                        <th className="sticky top-0 left-40 z-40 min-w-28 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">名</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">旧姓</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">電話番号</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">3年時クラス</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">5月3日参加</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">9月20日参加</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">不参加</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">同伴者有無</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">同伴者(大人)</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">同伴者(子供)</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">アレルギー有無</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">アレルギー詳細</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">備考</th>
                        <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold">回答日時</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((item) => (
                        <tr key={item.id} className="group hover:bg-gray-50">
                          <td className="sticky left-0 z-20 w-12 min-w-12 border border-gray-300 bg-white p-1 sm:p-2 group-hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                              className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
                            />
                          </td>
                          <td className="sticky left-12 z-20 min-w-28 border border-gray-300 bg-white p-1 sm:p-2 text-xs sm:text-sm group-hover:bg-gray-50">{item.lastName}</td>
                          <td className="sticky left-40 z-20 min-w-28 border border-gray-300 bg-white p-1 sm:p-2 text-xs sm:text-sm group-hover:bg-gray-50">{item.firstName}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.maidenName || '-'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.phone || '-'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.class}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.eventMay3 === 1 ? '参加' : '-'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.eventSep20 === 1 ? '参加' : '-'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.notAttending === 1 ? '不参加' : '-'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.companionStatus}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.companionAdults ?? 0}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.companionChildren ?? 0}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.hasAllergy ? '有り' : '無し'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.allergyDetails || '-'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.remarks || '-'}</td>
                          <td className="border border-gray-300 p-1 sm:p-2 text-xs whitespace-nowrap">{formatDate(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
