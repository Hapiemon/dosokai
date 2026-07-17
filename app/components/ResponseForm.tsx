'use client';

import { useState, FormEvent } from 'react';

type ResponseFormProps = {
  formId?: string;
};

export default function ResponseForm({ formId = 'form1' }: ResponseFormProps) {
  const isForm2 = formId === 'form2';

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    maidenName: '',
    phone: '',
    class: '',
    eventDates: [] as string[],
    companionStatus: '',
    companionAdults: '0',
    companionChildren: '0',
    hasAllergy: '',
    allergyDetails: '',
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const submitEndpoint = isForm2 ? '/api/responses-form2' : '/api/responses';

  // バリデーション関数
  const validateForm = (): string | null => {
    if (!formData.lastName.trim()) {
      return '姓を入力してください';
    }

    if (!formData.firstName.trim()) {
      return '名を入力してください';
    }

    if (!formData.phone.trim()) {
      return '電話番号を入力してください';
    }

    if (!/^\d{10,11}$|^(\d{2,4}-?){2}\d{3,4}$/.test(formData.phone.replace(/-/g, ''))) {
      return '正しい電話番号を入力してください（ハイフンなし10-11桁、またはハイフン付き形式）';
    }

    if (!formData.class) {
      return '組を選択してください';
    }

    if (formData.eventDates.length === 0) {
      return '参加可能な日程を選択してください';
    }

    if (!formData.companionStatus) {
      return '同伴者の有無を選択してください';
    }

    if (formData.companionStatus === '有り') {
      const adults = Number(formData.companionAdults);
      const children = Number(formData.companionChildren);
      if (adults + children === 0) {
        return '同伴者ありを選択した場合は、大人または子供の人数を選択してください';
      }
    }

    if (!formData.hasAllergy) {
      return 'アレルギーの有無を選択してください';
    }

    if (formData.hasAllergy === '有り' && !formData.allergyDetails.trim()) {
      return 'アレルギーが有りの場合は、詳細を入力してください';
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // バリデーション実行
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(submitEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          lastName: formData.lastName,
          firstName: formData.firstName,
          maidenName: formData.maidenName || null,
          phone: formData.phone,
          class: formData.class,
          eventDates: formData.eventDates,
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
          phone: '',
          class: '',
          eventDates: [],
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8">
          {/* ヘッダー */}
          <div className="text-center mb-6 sm:mb-8 border-b pb-4 sm:pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              {isForm2 ? '🌸 第2回 同窓会アンケート 🌸' : '🌸 第1回 同窓会アンケート 🌸'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">下記の内容で同窓会を開催予定ですので、アンケートへご協力ください。</p>
            <p className="text-xs sm:text-base text-gray-600 mb-2">
              {isForm2 ? '開催内容をご確認のうえ、参加可否をご回答ください。' : '集計結果によって開催日程を決定します。'}
            </p>
            <p className="text-xs sm:text-sm text-red-600 font-semibold">
              {isForm2 ? '※回答期限:2026年7月26日(日)' : '※回答期限:2026年2月15日(日)'}
            </p>
          </div>

          {/* イベント詳細 */}
          <div className="bg-pink-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">■ 開催概要</h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
              <div className="space-y-2">
                <p className="font-semibold text-pink-600 mb-2">開催日程</p>
                {isForm2 ? (
                  <label className="flex items-center ml-3 sm:ml-4">
                    <span className="text-sm sm:text-base">2026年9月20日(日)</span>
                  </label>
                ) : (
                  <>
                    <label className="flex items-center ml-3 sm:ml-4">
                      <span className="text-sm sm:text-base">案1:2026年5月3日(日)</span>
                    </label>
                    <label className="flex items-center ml-3 sm:ml-4">
                      <span className="text-sm sm:text-base">案2:2026年9月20日(日)</span>
                    </label>
                  </>
                )}
              </div>
              <div>
                <p className="font-semibold text-pink-600 mb-2">場所</p>
                <p className="ml-3 sm:ml-4 text-sm sm:text-base">{isForm2 ? 'サクラマチ屋上 Cafe & Garden Bar クラック' : 'サクラマチ熊本 RHCカフェ'}</p>
                {isForm2 ? (
                  <p className="ml-3 sm:ml-4"><a href="https://sakuramachi-kumamoto.jp/shop/cafegardenbar-craic" className="text-pink-600 underline text-sm sm:text-base" target="_blank" rel="noopener noreferrer">会場サイト</a></p>
                ) : (
                  <p className="ml-3 sm:ml-4"><a href="https://sakuramachi-kumamoto.jp/shop/rhcronherman_cafe" className="text-pink-600 underline text-sm sm:text-base" target="_blank" rel="noopener noreferrer">お店の詳細</a></p>
                )}
              </div>
              <div>
                <p className="font-semibold text-pink-600 mb-2">時間</p>
                {isForm2 ? (
                  <>
                    <p className="ml-3 sm:ml-4 text-sm sm:text-base">受付開始：16:00</p>
                    <p className="ml-3 sm:ml-4 text-sm sm:text-base">同窓会開始：16:30</p>
                    <p className="ml-3 sm:ml-4 text-sm sm:text-base">終了：18:30</p>
                  </>
                ) : (
                  <>
                    <p className="ml-3 sm:ml-4 text-sm sm:text-base">受付：17:30</p>
                    <p className="ml-3 sm:ml-4 text-sm sm:text-base">開始：18:00</p>
                    <p className="ml-3 sm:ml-4 text-sm sm:text-base">終了：20:00</p>
                  </>
                )}
              </div>
              <div>
                <p className="font-semibold text-pink-600 mb-2">形式・予算</p>
                {isForm2 ? (
                  <>
                    <p className="ml-3 sm:ml-4 text-sm sm:text-base">形式：着席</p>
                    <p className="ml-4">ドレスコード：なし</p>
                    <p className="ml-4">参加費：3,800円</p>
                    <p className="ml-4">集金方法：当日現金 もしくは オンライン送金（PayPay）</p>
                    <p className="ml-4">キャンセルポリシー：現在交渉中のため、後日ご案内します。</p>
                  </>
                ) : (
                  <>
                    <p className="ml-4">立食形式</p>
                    <p className="ml-4">会費:5,000円前後予定</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* 姓 */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                姓 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                placeholder="山田"
              />
            </div>

            {/* 名 */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                placeholder="太郎"
              />
            </div>

            {/* 旧姓 */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                旧姓(あれば記入お願いします)
              </label>
              <input
                type="text"
                value={formData.maidenName}
                onChange={(e) => setFormData({ ...formData, maidenName: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                placeholder="鈴木"
              />
            </div>

            {/* 電話番号 */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                電話番号 <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                placeholder="09012345678"
              />
            </div>

            {/* 組 */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                3年生の時の組 <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
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
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-3">
                {isForm2 ? '参加可否を選択してください' : '参加可能な日程を選択してください'} <span className="text-red-600">*</span>
              </label>
              <div className="space-y-3 sm:space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                {!isForm2 && (
                  <label className="flex items-start cursor-pointer p-2 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-gray-100 sm:hover:bg-transparent">
                    <input
                      type="checkbox"
                      value="5月3日"
                      checked={formData.eventDates.includes('5月3日')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            eventDates: [...formData.eventDates.filter((d) => d !== '不参加'), '5月3日'],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            eventDates: formData.eventDates.filter((d) => d !== '5月3日'),
                          });
                        }
                      }}
                      className="mr-2 sm:mr-3 mt-1 w-5 h-5 sm:w-4 sm:h-4 text-pink-600 focus:ring-pink-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-sm sm:text-base">2026年5月3日(日)</span>
                    </div>
                  </label>
                )}
                <label className="flex items-start cursor-pointer p-2 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-gray-100 sm:hover:bg-transparent">
                  <input
                    type="checkbox"
                    value="9月20日"
                    checked={formData.eventDates.includes('9月20日')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          eventDates: [...formData.eventDates.filter((d) => d !== '不参加'), '9月20日'],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          eventDates: formData.eventDates.filter((d) => d !== '9月20日'),
                        });
                      }
                    }}
                    className="mr-2 sm:mr-3 mt-1 w-5 h-5 sm:w-4 sm:h-4 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-sm sm:text-base">2026年9月20日(日)</span>
                  </div>
                </label>
                <label className="flex items-start cursor-pointer p-2 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-gray-100 sm:hover:bg-transparent">
                  <input
                    type="checkbox"
                    value="不参加"
                    checked={formData.eventDates.includes('不参加')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          eventDates: ['不参加'],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          eventDates: formData.eventDates.filter((d) => d !== '不参加'),
                        });
                      }
                    }}
                    className="mr-2 sm:mr-3 mt-1 w-5 h-5 sm:w-4 sm:h-4 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-sm sm:text-base">不参加</span>
                  </div>
                </label>
              </div>
              {formData.eventDates.length === 0 && (
                <p className="text-sm text-red-500 mt-2">少なくとも1つの日程を選択してください</p>
              )}
            </div>

            {/* アレルギー */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-3">
                食べ物のアレルギーの有無 <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-center cursor-pointer p-2 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-gray-100 sm:hover:bg-transparent">
                  <input
                    type="radio"
                    value="無し"
                    checked={formData.hasAllergy === '無し'}
                    onChange={(e) => setFormData({ ...formData, hasAllergy: e.target.value, allergyDetails: '' })}
                    className="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className="text-sm sm:text-base">無し</span>
                </label>
                <label className="flex items-center cursor-pointer p-2 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-gray-100 sm:hover:bg-transparent">
                  <input
                    type="radio"
                    value="有り"
                    checked={formData.hasAllergy === '有り'}
                    onChange={(e) => setFormData({ ...formData, hasAllergy: e.target.value })}
                    className="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className="text-sm sm:text-base">有り</span>
                </label>
              </div>
              {formData.hasAllergy === '有り' && (
                <textarea
                  value={formData.allergyDetails}
                  onChange={(e) => setFormData({ ...formData, allergyDetails: e.target.value })}
                  className="mt-3 w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                  rows={3}
                  placeholder="アレルギーの詳細をご記入ください"
                />
              )}
            </div>

            {/* 同伴者 */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-3">
                同伴者の有無（お子さん歓迎） <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2 sm:space-y-3">
                <label className="flex items-center cursor-pointer p-2 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-gray-100 sm:hover:bg-transparent">
                  <input
                    type="radio"
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
                    className="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className="text-sm sm:text-base">無し</span>
                </label>
                <label className="flex items-center cursor-pointer p-2 sm:p-0 -mx-2 sm:mx-0 rounded hover:bg-gray-100 sm:hover:bg-transparent">
                  <input
                    type="radio"
                    value="有り"
                    checked={formData.companionStatus === '有り'}
                    onChange={(e) => setFormData({ ...formData, companionStatus: e.target.value })}
                    className="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className="text-sm sm:text-base">有り</span>
                </label>
              </div>

              {formData.companionStatus === '有り' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                      大人の人数 <span className="text-red-600">*</span>
                      <span className="ml-2 text-xs text-gray-500">※参加費がかかります。</span>
                    </label>
                    <select
                      value={formData.companionAdults}
                      onChange={(e) => setFormData({ ...formData, companionAdults: e.target.value })}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
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
                    <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                      子供の人数 <span className="text-red-600">*</span>
                      <span className="ml-2 text-xs text-gray-500">※無料</span>
                    </label>
                    <select
                      value={formData.companionChildren}
                      onChange={(e) => setFormData({ ...formData, companionChildren: e.target.value })}
                      className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
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
              <label className="block text-sm sm:text-base font-bold text-gray-700 mb-2">
                備考欄(任意)
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                rows={4}
                placeholder="不明点や要望があればご記入ください"
              />
            </div>

            {/* 送信ボタン */}
            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-base sm:text-lg"
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
