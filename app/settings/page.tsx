'use client';

import { TouchEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  eventMay3?: number;
  eventSep20?: number;
  notAttending?: number;
  participationStatus?: string;
  companionStatus: string;
  companionAdults: number | null;
  companionChildren: number | null;
  settlementAmount?: number;
  paymentMethod?: string | null;
  settlementStatus?: string;
  hasAllergy: boolean;
  allergyDetails: string | null;
  remarks: string | null;
  createdAt: string;
}

type Form2EditableFields = {
  participationStatus: string;
  paymentMethod: string;
  settlementStatus: string;
  remarks: string;
};

const PARTICIPATION_OPTIONS = ['参加', '不参加'] as const;
const PAYMENT_OPTIONS = ['', '現金', 'PayPay', 'その他'] as const;
const SETTLEMENT_OPTIONS = ['未', '済'] as const;

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
  const [savingForm2Changes, setSavingForm2Changes] = useState(false);
  const [form2OriginalValues, setForm2OriginalValues] = useState<Record<string, Form2EditableFields>>({});
  const [dirtyForm2Ids, setDirtyForm2Ids] = useState<Set<string>>(new Set());

  const [tableZoom, setTableZoom] = useState(1);
  const pinchStartDistanceRef = useRef(0);
  const pinchStartZoomRef = useRef(1);

  const getTouchDistance = (touches: TouchEvent['touches']) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTableTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;
    pinchStartDistanceRef.current = getTouchDistance(event.touches);
    pinchStartZoomRef.current = tableZoom;
  };

  const handleTableTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || pinchStartDistanceRef.current === 0) return;
    event.preventDefault();
    const currentDistance = getTouchDistance(event.touches);
    const nextZoom = pinchStartZoomRef.current * (currentDistance / pinchStartDistanceRef.current);
    setTableZoom(Math.min(2, Math.max(0.5, nextZoom)));
  };

  const handleTableTouchEnd = () => {
    pinchStartDistanceRef.current = 0;
  };

  const selectedForm = useMemo(
    () => forms.find((item) => item.formId === selectedFormId),
    [forms, selectedFormId]
  );

  const fetchForms = useCallback(async () => {
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
  }, [selectedFormId]);

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

  const fetchResponses = useCallback(async (formId: string) => {
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

      if (formId === 'form2') {
        const originals = data.reduce<Record<string, Form2EditableFields>>((acc, item) => {
          acc[item.id] = {
            participationStatus: item.participationStatus || '参加',
            paymentMethod: item.paymentMethod || '',
            settlementStatus: item.settlementStatus || '未',
            remarks: item.remarks || '',
          };
          return acc;
        }, {});
        setForm2OriginalValues(originals);
        setDirtyForm2Ids(new Set());
      } else {
        setForm2OriginalValues({});
        setDirtyForm2Ids(new Set());
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('回答データの取得に失敗しました');
    } finally {
      setResponsesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  useEffect(() => {
    if (activeTab === 'responses') {
      fetchResponses(selectedFormId);
    }
  }, [activeTab, fetchResponses, selectedFormId]);

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

  const updateLocalForm2Row = (id: string, updates: Partial<ResponseItem>) => {
    setResponses((prev) => {
      const next = prev.map((row) => (row.id === id ? { ...row, ...updates } : row));
      const updated = next.find((row) => row.id === id);
      const original = form2OriginalValues[id];

      if (updated && original) {
        const currentEditable: Form2EditableFields = {
          participationStatus: updated.participationStatus || '参加',
          paymentMethod: updated.paymentMethod || '',
          settlementStatus: updated.settlementStatus || '未',
          remarks: updated.remarks || '',
        };

        const hasDiff =
          currentEditable.participationStatus !== original.participationStatus ||
          currentEditable.paymentMethod !== original.paymentMethod ||
          currentEditable.settlementStatus !== original.settlementStatus ||
          currentEditable.remarks !== original.remarks;

        setDirtyForm2Ids((prevDirty) => {
          const nextDirty = new Set(prevDirty);
          if (hasDiff) {
            nextDirty.add(id);
          } else {
            nextDirty.delete(id);
          }
          return nextDirty;
        });
      }

      return next;
    });
  };

  const hasForm2Diff = selectedFormId === 'form2' && dirtyForm2Ids.size > 0;

  const handleSaveForm2Changes = async () => {
    if (selectedFormId !== 'form2') return;

    const targetItems = responses.filter((item) => dirtyForm2Ids.has(item.id));
    if (targetItems.length === 0) {
      setMessage('変更はありません');
      return;
    }

    try {
      setSavingForm2Changes(true);
      await Promise.all(
        targetItems.map(async (item) => {
          const response = await fetch(`/api/responses-form2/${item.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              participationStatus: item.participationStatus || '参加',
              paymentMethod: item.paymentMethod || '',
              settlementStatus: item.settlementStatus || '未',
              remarks: item.remarks || '',
            }),
          });

          if (!response.ok) {
            throw new Error('更新に失敗しました');
          }
        })
      );

      await fetchResponses('form2');
      setMessage(`${targetItems.length}件の変更を保存しました`);
    } catch (error) {
      console.error('Error:', error);
      setMessage('更新に失敗しました');
    } finally {
      setSavingForm2Changes(false);
    }
  };

  const handleDiscardForm2Changes = async () => {
    if (selectedFormId !== 'form2') return;
    await fetchResponses('form2');
    setMessage('未保存の変更を破棄しました');
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">設定</h1>
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
              フォーム管理
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`pb-1 sm:pb-2 px-2 sm:px-4 font-semibold transition-colors text-xs sm:text-sm ${
                activeTab === 'responses'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              回答管理
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
                  disabled={responsesLoading || savingForm2Changes}
                  className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:bg-gray-400 text-xs sm:text-sm"
                >
                  更新
                </button>
                <button
                  onClick={handleExportCsv}
                  disabled={exporting || responsesLoading || savingForm2Changes}
                  className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-semibold text-xs sm:text-sm"
                >
                  {exporting ? '出力中...' : 'CSVエクスポート'}
                </button>
              </div>

              {hasForm2Diff && (
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="text-sm text-amber-700 font-semibold">{dirtyForm2Ids.size}件の未保存変更があります</span>
                  <button
                    onClick={handleSaveForm2Changes}
                    disabled={savingForm2Changes}
                    className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 text-xs sm:text-sm font-semibold w-full sm:w-auto"
                  >
                    {savingForm2Changes ? '保存中...' : '変更を保存'}
                  </button>
                  <button
                    onClick={handleDiscardForm2Changes}
                    disabled={savingForm2Changes}
                    className="px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:bg-gray-400 text-xs sm:text-sm font-semibold w-full sm:w-auto"
                  >
                    変更を破棄
                  </button>
                </div>
              )}

              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-gray-700 font-semibold text-sm sm:text-base">{selectedIds.size}件選択</span>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={deleting || savingForm2Changes}
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
                <div
                  className="overflow-auto max-h-[70vh] -mx-4 sm:mx-0 px-4 sm:px-0"
                  style={{ clipPath: 'inset(0)', touchAction: 'pan-x pan-y' }}
                  onTouchStart={handleTableTouchStart}
                  onTouchMove={handleTableTouchMove}
                  onTouchEnd={handleTableTouchEnd}
                  onTouchCancel={handleTableTouchEnd}
                >
                  <div style={{ zoom: tableZoom, transformOrigin: 'top left' }}>
                    <table className="min-w-max border-separate border-spacing-0 border border-gray-300 text-xs sm:text-sm whitespace-nowrap bg-white">
                      <thead>
                        <tr>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2" style={{ zIndex: 30 }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.size === responses.length && responses.length > 0}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
                            />
                          </th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>姓</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>名</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>旧姓</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>電話番号</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>3年時クラス</th>
                          {selectedFormId === 'form2' ? (
                            <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>参加可否</th>
                          ) : (
                            <>
                              <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>5月3日参加</th>
                              <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>9月20日参加</th>
                              <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>不参加</th>
                            </>
                          )}
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>同伴者有無</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>同伴者(大人)</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>同伴者(子供)</th>
                          {selectedFormId === 'form2' && (
                            <>
                              <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>精算金額</th>
                              <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>支払い方法</th>
                              <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>精算ステータス</th>
                            </>
                          )}
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>アレルギー有無</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>アレルギー詳細</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>{selectedFormId === 'form2' ? '概要' : '備考'}</th>
                          <th className="sticky top-0 z-30 border border-gray-300 bg-gray-100 p-1 sm:p-2 text-left font-semibold" style={{ zIndex: 30 }}>回答日時</th>
                        </tr>
                      </thead>
                      <tbody>
                        {responses.map((item) => (
                          <tr key={item.id} className="group hover:bg-gray-50">
                            <td className="border border-gray-300 bg-white p-1 sm:p-2 group-hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={(e) => handleSelectOne(item.id, e.target.checked)}
                                className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
                              />
                            </td>
                            <td className="border border-gray-300 bg-white p-1 sm:p-2 text-xs sm:text-sm group-hover:bg-gray-50">{item.lastName}</td>
                            <td className="border border-gray-300 bg-white p-1 sm:p-2 text-xs sm:text-sm group-hover:bg-gray-50">{item.firstName}</td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.maidenName || '-'}</td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.phone || '-'}</td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.class}</td>
                            {selectedFormId === 'form2' ? (
                              <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">
                                <select
                                  value={item.participationStatus || '参加'}
                                  onChange={(e) => updateLocalForm2Row(item.id, { participationStatus: e.target.value })}
                                  disabled={savingForm2Changes}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm bg-white"
                                >
                                  {PARTICIPATION_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            ) : (
                              <>
                                <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.eventMay3 === 1 ? '参加' : '-'}</td>
                                <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.eventSep20 === 1 ? '参加' : '-'}</td>
                                <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.notAttending === 1 ? '不参加' : '-'}</td>
                              </>
                            )}
                            <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.companionStatus}</td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.companionAdults ?? 0}</td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.companionChildren ?? 0}</td>
                            {selectedFormId === 'form2' && (
                              <>
                                <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.settlementAmount ?? 0}</td>
                                <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">
                                  <select
                                    value={item.paymentMethod || ''}
                                    onChange={(e) => updateLocalForm2Row(item.id, { paymentMethod: e.target.value })}
                                    disabled={savingForm2Changes}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm bg-white"
                                  >
                                    {PAYMENT_OPTIONS.map((option) => (
                                      <option key={option || 'empty'} value={option}>
                                        {option || '（空欄）'}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">
                                  <select
                                    value={item.settlementStatus || '未'}
                                    onChange={(e) => updateLocalForm2Row(item.id, { settlementStatus: e.target.value })}
                                    disabled={savingForm2Changes}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm bg-white"
                                  >
                                    {SETTLEMENT_OPTIONS.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </>
                            )}
                            <td className="border border-gray-300 p-1 sm:p-2 text-center text-xs sm:text-sm">{item.hasAllergy ? '有り' : '無し'}</td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">{item.allergyDetails || '-'}</td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-xs sm:text-sm">
                              {selectedFormId === 'form2' ? (
                                <input
                                  type="text"
                                  value={item.remarks || ''}
                                  onChange={(e) => updateLocalForm2Row(item.id, { remarks: e.target.value })}
                                  disabled={savingForm2Changes}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm"
                                  placeholder="概要を入力"
                                />
                              ) : (
                                item.remarks || '-'
                              )}
                            </td>
                            <td className="border border-gray-300 p-1 sm:p-2 text-xs whitespace-nowrap">{formatDate(item.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
