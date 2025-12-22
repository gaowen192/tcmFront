import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// 12 時辰配置（本地時間），作為一個 JSON 對象使用
export const HEALTH_CLOCK_CONFIG = [
  { key: 'zi', name: '子時', range: '23:00 - 00:59', advice: '宜入睡養膽，避免熬夜，讓身體進入深度修復。' },
  { key: 'chou', name: '丑時', range: '01:00 - 02:59', advice: '肝血充盈，熟睡有助於排毒，切勿用腦或進食。' },
  { key: 'yin', name: '寅時', range: '03:00 - 04:59', advice: '肺經旺，睡眠中保持室內空氣流通但注意保暖。' },
  { key: 'mao', name: '卯時', range: '05:00 - 06:59', advice: '宜緩慢起床，可做伸展與深呼吸，幫助喚醒身體。' },
  { key: 'chen', name: '辰時', range: '07:00 - 08:59', advice: '胃氣最旺，適合吃一頓溫熱而有營養的早餐。' },
  { key: 'si', name: '巳時', range: '09:00 - 10:59', advice: '脾經運化佳，適合專注學習與工作，避免過度零食。' },
  { key: 'wu', name: '午時', range: '11:00 - 12:59', advice: '心火較旺，可稍作休息或小憩，避免情緒激動。' },
  { key: 'wei', name: '未時', range: '13:00 - 14:59', advice: '小睡片刻有助恢復氣力，但時間不宜過長。' },
  { key: 'shen', name: '申時', range: '15:00 - 16:59', advice: '膀胱經旺，宜多喝溫水，適量活動舒展筋骨。' },
  { key: 'you', name: '酉時', range: '17:00 - 18:59', advice: '腎經當令，宜放鬆心情，可做輕度運動或散步。' },
  { key: 'xu', name: '戌時', range: '19:00 - 20:59', advice: '適合家人交流與放鬆，晚餐勿過飽，避免重口味。' },
  { key: 'hai', name: '亥時', range: '21:00 - 22:59', advice: '準備入睡時間，可泡腳、放鬆心神，少用電子產品。' },
];

// 根據本地時間（小時）取得對應的時辰配置
export const getCurrentHealthClock = () => {
  const now = new Date();
  const hour = now.getHours(); // 0 - 23，本地時間

  if (hour === 23) return HEALTH_CLOCK_CONFIG[0]; // 子時
  if (hour >= 0 && hour < 1) return HEALTH_CLOCK_CONFIG[0]; // 子時
  if (hour >= 1 && hour < 3) return HEALTH_CLOCK_CONFIG[1]; // 丑時
  if (hour >= 3 && hour < 5) return HEALTH_CLOCK_CONFIG[2]; // 寅時
  if (hour >= 5 && hour < 7) return HEALTH_CLOCK_CONFIG[3]; // 卯時
  if (hour >= 7 && hour < 9) return HEALTH_CLOCK_CONFIG[4]; // 辰時
  if (hour >= 9 && hour < 11) return HEALTH_CLOCK_CONFIG[5]; // 巳時
  if (hour >= 11 && hour < 13) return HEALTH_CLOCK_CONFIG[6]; // 午時
  if (hour >= 13 && hour < 15) return HEALTH_CLOCK_CONFIG[7]; // 未時
  if (hour >= 15 && hour < 17) return HEALTH_CLOCK_CONFIG[8]; // 申時
  if (hour >= 17 && hour < 19) return HEALTH_CLOCK_CONFIG[9]; // 酉時
  if (hour >= 19 && hour < 21) return HEALTH_CLOCK_CONFIG[10]; // 戌時
  if (hour >= 21 && hour < 23) return HEALTH_CLOCK_CONFIG[11]; // 亥時

  // 安全兜底
  return HEALTH_CLOCK_CONFIG[0];
};

const HealthClock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = React.useState(getCurrentHealthClock);

  // 每分鐘刷新一次，跨時段時會自動更新顯示
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(getCurrentHealthClock());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    navigate('/meridian-flow');
  };

  return (
    <div>
      <div 
        className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
        onClick={handleClick}
      >
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-800">{t('home.tcm.healthClock')}</h2>
          <svg className="w-4 h-4 text-green-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="text-center py-6">
          <h3 className="text-4xl font-bold text-green-800 mb-2">{current.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{current.range}</p>
          <p className="text-sm text-gray-700">{current.advice}</p>
        </div>
        <div className="text-center mt-4">
          <span className="text-xs text-green-600 hover:text-green-800">點擊查看詳情 →</span>
        </div>
      </div>
    </div>
  );
};

export default HealthClock;


