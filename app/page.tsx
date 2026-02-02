'use client';

import { useState, FormEvent } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    maidenName: '',
    class: '',
    eventDates: [] as string[],
    attendance: '',
    attendanceOther: '',
    companionStatus: '',
    companionAdults: '0',
    companionChildren: '0',
    hasAllergy: '',
    allergyDetails: '',
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastName: formData.lastName,
          firstName: formData.firstName,
          maidenName: formData.maidenName || null,
          class: formData.class,
          eventDates: formData.eventDates,
          attendance: formData.attendance,
          attendanceOther: formData.attendanceOther || null,
          companionStatus: formData.companionStatus,
          companionAdults: formData.companionAdults,
          companionChildren: formData.companionChildren,
          hasAllergy: formData.hasAllergy === '有り',
          allergyDetails: formData.allergyDetails || null,
          remarks: formData.remarks || null,
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({
          lastName: '',
          firstName: '',
          maidenName: '',
          class: '',
          eventDates: [],
          attendance: '',
          attendanceOther: '',
          companionStatus: '',
          companionAdults: '0',
          companionChildren: '0',
          hasAllergy: '',
          allergyDetails: '',
          remarks: '',
        });
      } else {
        alert('送信に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">🌸 同窓会のご案内 🌸</h1>
            <p className="text-gray-600 mb-2">明けましておめでとうございます。</p>
            <p className="text-gray-600 mb-4">下記の内容で同窓会を開催予定ですので、アンケートのご案内です。</p>
            <p className="text-sm text-red-600 font-semibold">※回答期限:2026年2月15日(日)</p>
          </div>

          {/* イベント詳細 */}
          <div className="bg-pink-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">■ 開催概要</h2>
            <div className="space-y-4 text-gray-700">
              <div className="space-y-2">
                <p className="font-semibold text-pink-600 mb-2">開催日程</p>
                <label className="flex items-center ml-2">
                  <span className="text-base">案1：2026年5月3日(日)</span>
                </label>
                <label className="flex items-center ml-2">
                  <span className="text-base">案2：2026年6月20日(土)</span>
                </label>
              </div>
              <div>
                <p className="font-semibold">📍 場所</p>
                <p className="ml-4">サクラマチ熊本 RHCカフェ(貸切予定)</p>
              </div>
              <div>
                <p className="font-semibold">🕐 時間</p>
                <p className="ml-4">受付：17:30</p>
                <p className="ml-4">開始：18:00</p>
                <p className="ml-4">終了：20:30予定</p>
              </div>
              <div>
                <p className="font-semibold">💰 形式・予算</p>
                <p className="ml-4">立食形式</p>
                <p className="ml-4">会費:5,000円前後予定</p>
              </div>
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 姓 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                姓 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="山田"
              />
            </div>

            {/* 名 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="太郎"
              />
            </div>

            {/* 旧姓 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                旧姓(あれば記入お願いします)
              </label>
              <input
                type="text"
                value={formData.maidenName}
                onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="鈴木"
              />
            </div>

            {/* 組 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                組 <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="1">1組</option>
                <option value="2">2組</option>
                <option value="3">3組</option>
                <option value="4">4組</option>
                <option value="不明">不明</option>
              </select>
            </div>

            {/* 開催日程 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                参加可能な日程を選択してください <span className="text-red-600">*</span>
              </label>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    value="5月3日"
                    checked={formData.eventDates.includes('5月3日')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          eventDates: [...formData.eventDates, '5月3日'],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          eventDates: formData.eventDates.filter((d) => d !== '5月3日'),
                        });
                      }
                    }}
                    className="mr-3 mt-1 text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="font-semibold">2026年5月3日(日)</span>
                    <p className="text-sm text-gray-600">16:00〜19:30(20:00解散)</p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    value="6月20日"
                    checked={formData.eventDates.includes('6月20日')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          eventDates: [...formData.eventDates, '6月20日'],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          eventDates: formData.eventDates.filter((d) => d !== '6月20日'),
                        });
                      }
                    }}
                    className="mr-3 mt-1 text-pink-600 focus:ring-pink-500"
                  />
                  <div>
                    <span className="font-semibold">2026年6月20日(土)</span>
                    <p className="text-sm text-gray-600">17:30〜20:00</p>
                  </div>
                </label>
              </div>
              {formData.eventDates.length === 0 && (
                <p className="text-sm text-red-500 mt-2">少なくとも1つの日程を選択してください</p>
              )}
            </div>

            {/* 出席 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                出欠 <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    required
                    value="出席する"
                    checked={formData.attendance === '出席する'}
                    onChange={(e) => setFormData({ ...formData, attendance: e.target.value, attendanceOther: '' })}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span>出席する</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    required
                    value="出席しない"
                    checked={formData.attendance === '出席しない'}
                    onChange={(e) => setFormData({ ...formData, attendance: e.target.value, attendanceOther: '' })}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span>出席しない</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    required
                    value="その他"
                    checked={formData.attendance === 'その他'}
                    onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span>その他</span>
                </label>
              </div>
              {formData.attendance === 'その他' && (
                <textarea
                  required
                  value={formData.attendanceOther}
                  onChange={(e) => setFormData({ ...formData, attendanceOther: e.target.value })}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  placeholder="詳細をご記入ください"
                />
              )}
            </div>

            {/* アレルギー */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                食べ物のアレルギーの有無 <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    required
                    value="無し"
                    checked={formData.hasAllergy === '無し'}
                    onChange={(e) => setFormData({ ...formData, hasAllergy: e.target.value, allergyDetails: '' })}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span>無し</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    required
                    value="有り"
                    checked={formData.hasAllergy === '有り'}
                    onChange={(e) => setFormData({ ...formData, hasAllergy: e.target.value })}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span>有り</span>
                </label>
              </div>
              {formData.hasAllergy === '有り' && (
                <textarea
                  value={formData.allergyDetails}
                  onChange={(e) => setFormData({ ...formData, allergyDetails: e.target.value })}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  placeholder="アレルギーの詳細をご記入ください(任意)"
                />
              )}
            </div>

            {/* 同伴者 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                同伴者の有無 <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    required
                    value="無し"
                    checked={formData.companionStatus === '無し'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companionStatus: e.target.value,
                        companionAdults: '0',
                        companionChildren: '0',
                      })
                    }
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span>無し</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    required
                    value="有り"
                    checked={formData.companionStatus === '有り'}
                    onChange={(e) => setFormData({ ...formData, companionStatus: e.target.value })}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <span>有り</span>
                </label>
              </div>

              {formData.companionStatus === '有り' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      大人の人数 <span className="text-red-600">*</span>
                      <span className="ml-2 text-xs text-gray-500">※会費がかかります。</span>
                    </label>
                    <select
                      required
                      value={formData.companionAdults}
                      onChange={(e) => setFormData({ ...formData, companionAdults: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="0">0名</option>
                      <option value="1">1名</option>
                      <option value="2">2名</option>
                      <option value="3">3名</option>
                      <option value="4">4名</option>
                      <option value="5">5名</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      子供の人数 <span className="text-red-600">*</span>
                      <span className="ml-2 text-xs text-gray-500">※無料</span>
                    </label>
                    <select
                      required
                      value={formData.companionChildren}
                      onChange={(e) => setFormData({ ...formData, companionChildren: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="0">0名</option>
                      <option value="1">1名</option>
                      <option value="2">2名</option>
                      <option value="3">3名</option>
                      <option value="4">4名</option>
                      <option value="5">5名</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 備考 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                備考欄(任意)
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={4}
                placeholder="不明点や要望があればご記入ください"
              />
            </div>

            {/* 送信ボタン */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 成功モーダル */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">送信完了</h2>
            <p className="text-gray-600 mb-6">
              アンケートにご協力いただき<br />ありがとうございました。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
