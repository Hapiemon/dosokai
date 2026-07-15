'use client';

import { useState, useEffect } from 'react';

interface Form {
  id: string;
  formId: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Response {
  id: string;
  lastName: string;
  firstName: string;
  maidenName: string | null;
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
  
  // Form 管理用
  const [forms, setForms] = useState<Form[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [updatingFormId, setUpdatingFormId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Response 管理用
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [responsesLoading, setResponsesLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchForms();
    fetchResponses();
  }, []);

  // ===== Form 管理関数 =====
  const fetchForms = async () => {
    try {
      setFormsLoading(true);
      const response = await fetch('/api/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      } else {
        setMessage('フォーム情報の取得に失敗しました');
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

      if (response.ok) {
        setMessage(`フォーム「${formId}」を「${newStatus}」に変更しました`);
        await fetchForms();
      } else {
        setMessage('ステータス変更に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('ステータス変更に失敗しました');
    } finally {
      setUpdatingFormId(null);
    }
  };

  // ===== Response 管理関数 =====
  const fetchResponses = async () => {
    try {
      setResponsesLoading(true);
      const response = await fetch('/api/responses/get-all');
      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      } else {
        setMessage('レスポンスデータの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('レスポンスデータの取得に失敗しました');
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(responses.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
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
          ids: Array.from(selectedIds),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`${result.deletedCount}件を削除しました`);
        setSelectedIds(new Set());
        await fetchResponses();
      } else {
        setMessage('削除に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('削除に失敗しました');
    } finally {
      setDeleting(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* ヘッダー */}
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ 設定</h1>
            <p className="text-gray-600">アンケートとレスポンスの管理</p>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              {message}
            </div>
          )}

          {/* タブ切り替え */}
          <div className="mb-6 flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('forms')}
              className={`pb-2 px-4 font-semibold transition-colors ${
                activeTab === 'forms'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 フォーム管理
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`pb-2 px-4 font-semibold transition-colors ${
                activeTab === 'responses'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 レスポンス管理
            </button>
          </div>

          {/* フォーム管理タブ */}
          {activeTab === 'forms' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">アンケートのステータス管理</h2>
                <button
                  onClick={fetchForms}
                  disabled={formsLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
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
                      className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {form.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ID: {form.formId}
                        </p>
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

          {/* レスポンス管理タブ */}
          {activeTab === 'responses' && (
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-semibold">
                    {selectedIds.size}件選択
                  </span>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    >
                      {deleting ? '削除中...' : '選択した行を削除'}
                    </button>
                  )}
                </div>
                <button
                  onClick={fetchResponses}
                  disabled={responsesLoading}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
                >
                  更新
                </button>
              </div>

              {responsesLoading ? (
                <div className="text-center py-12 text-gray-500">
                  読み込み中...
                </div>
              ) : responses.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  データがありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === responses.length && responses.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">lastName</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">firstName</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">maidenName</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">class</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">eventMay3</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">eventSep20</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">notAttending</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">companionStatus</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">companionAdults</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">companionChildren</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">hasAllergy</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">allergyDetails</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">remarks</th>
                        <th className="border border-gray-300 p-2 text-left font-semibold">createdAt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response) => (
                        <tr key={response.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(response.id)}
                              onChange={(e) => handleSelectOne(response.id, e.target.checked)}
                              className="cursor-pointer"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">{response.lastName}</td>
                          <td className="border border-gray-300 p-2">{response.firstName}</td>
                          <td className="border border-gray-300 p-2">{response.maidenName || '-'}</td>
                          <td className="border border-gray-300 p-2">{response.class}</td>
                          <td className="border border-gray-300 p-2 text-center">{response.eventMay3}</td>
                          <td className="border border-gray-300 p-2 text-center">{response.eventSep20}</td>
                          <td className="border border-gray-300 p-2 text-center">{response.notAttending}</td>
                          <td className="border border-gray-300 p-2">{response.companionStatus}</td>
                          <td className="border border-gray-300 p-2 text-center">{response.companionAdults ?? '-'}</td>
                          <td className="border border-gray-300 p-2 text-center">{response.companionChildren ?? '-'}</td>
                          <td className="border border-gray-300 p-2 text-center">{response.hasAllergy ? '1' : '0'}</td>
                          <td className="border border-gray-300 p-2">{response.allergyDetails || '-'}</td>
                          <td className="border border-gray-300 p-2">{response.remarks || '-'}</td>
                          <td className="border border-gray-300 p-2 text-xs whitespace-nowrap">{formatDate(response.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 統計 */}
              {responses.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📊 統計</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {responses.length}
                      </div>
                      <div className="text-sm text-gray-600">合計回答数</div>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">
                        {responses.filter(r => r.eventMay3 === 1).length}
                      </div>
                      <div className="text-sm text-gray-600">5月3日参加</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {responses.filter(r => r.eventSep20 === 1).length}
                      </div>
                      <div className="text-sm text-gray-600">9月20日参加</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {responses.filter(r => r.notAttending === 1).length}
                      </div>
                      <div className="text-sm text-gray-600">不参加</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
      } else {
        setMessage('データ取得に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('データ取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(responses.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
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
          ids: Array.from(selectedIds),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`${result.deletedCount}件を削除しました`);
        setSelectedIds(new Set());
        await fetchResponses();
      } else {
        setMessage('削除に失敗しました');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('削除に失敗しました');
    } finally {
      setDeleting(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* ヘッダー */}
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ 設定</h1>
            <p className="text-gray-600">回答データの管理</p>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
              {message}
            </div>
          )}

          {/* ツールバー */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-semibold">
                {selectedIds.size}件選択
              </span>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {deleting ? '削除中...' : '選択した行を削除'}
                </button>
              )}
            </div>
            <button
              onClick={fetchResponses}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
            >
              更新
            </button>
          </div>

          {/* テーブル */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              読み込み中...
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              データがありません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === responses.length && responses.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">lastName</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">firstName</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">maidenName</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">class</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">eventMay3</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">eventSep20</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">notAttending</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">companionStatus</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">companionAdults</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">companionChildren</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">hasAllergy</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">allergyDetails</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">remarks</th>
                    <th className="border border-gray-300 p-2 text-left font-semibold">createdAt</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(response.id)}
                          onChange={(e) => handleSelectOne(response.id, e.target.checked)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="border border-gray-300 p-2">{response.lastName}</td>
                      <td className="border border-gray-300 p-2">{response.firstName}</td>
                      <td className="border border-gray-300 p-2">{response.maidenName || '-'}</td>
                      <td className="border border-gray-300 p-2">{response.class}</td>
                      <td className="border border-gray-300 p-2 text-center">{response.eventMay3}</td>
                      <td className="border border-gray-300 p-2 text-center">{response.eventSep20}</td>
                      <td className="border border-gray-300 p-2 text-center">{response.notAttending}</td>
                      <td className="border border-gray-300 p-2">{response.companionStatus}</td>
                      <td className="border border-gray-300 p-2 text-center">{response.companionAdults ?? '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{response.companionChildren ?? '-'}</td>
                      <td className="border border-gray-300 p-2 text-center">{response.hasAllergy ? '1' : '0'}</td>
                      <td className="border border-gray-300 p-2">{response.allergyDetails || '-'}</td>
                      <td className="border border-gray-300 p-2">{response.remarks || '-'}</td>
                      <td className="border border-gray-300 p-2 text-xs whitespace-nowrap">{formatDate(response.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 統計 */}
          {responses.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 統計</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {responses.length}
                  </div>
                  <div className="text-sm text-gray-600">合計回答数</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {responses.filter(r => r.eventMay3 === 1).length}
                  </div>
                  <div className="text-sm text-gray-600">5月3日参加</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {responses.filter(r => r.eventSep20 === 1).length}
                  </div>
                  <div className="text-sm text-gray-600">9月20日参加</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {responses.filter(r => r.notAttending === 1).length}
                  </div>
                  <div className="text-sm text-gray-600">不参加</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
