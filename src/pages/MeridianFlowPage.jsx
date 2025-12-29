import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import imgSrc from '../assets/img.png';

// 模擬圖標組件 (如果沒有安裝 lucide-react，可以用文字代替)
const SunIcon = () => <span className="text-xl">☀</span>;
const MoonIcon = () => <span className="text-xl">☾</span>;

const MeridianClock = () => {
  const navigate = useNavigate();
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // 子午流注數據
  const meridians = [
    { id: 1, time: '23:00-01:00', shichen: '子時', organ: '膽', meridian: '足少陽膽經', advice: '膽汁推陳出新，應熟睡養膽。', element: '木' },
    { id: 2, time: '01:00-03:00', shichen: '丑時', organ: '肝', meridian: '足厥陰肝經', advice: '肝血推陳出新，必須熟睡。', element: '木' },
    { id: 3, time: '03:00-05:00', shichen: '寅時', organ: '肺', meridian: '手太陰肺經', advice: '肺氣輸布全身，宜深度睡眠。', element: '金' },
    { id: 4, time: '05:00-07:00', shichen: '卯時', organ: '大腸', meridian: '手陽明大腸經', advice: '大腸蠕動，宜排便、喝溫水。', element: '金' },
    { id: 5, time: '07:00-09:00', shichen: '辰時', organ: '胃', meridian: '足陽明胃經', advice: '胃酸分泌最旺，一定要吃早餐。', element: '土' },
    { id: 6, time: '09:00-11:00', shichen: '巳時', organ: '脾', meridian: '足太陰脾經', advice: '脾運化水穀，宜適量飲水，忌冰。', element: '土' },
    { id: 7, time: '11:00-13:00', shichen: '午時', organ: '心', meridian: '手少陰心經', advice: '心氣推動血液，宜小睡養心。', element: '火' },
    { id: 8, time: '13:00-15:00', shichen: '未時', organ: '小腸', meridian: '手太陽小腸經', advice: '小腸分清泌濁，午餐應已吃完。', element: '火' },
    { id: 9, time: '15:00-17:00', shichen: '申時', organ: '膀胱', meridian: '足太陽膀胱經', advice: '排毒最佳時機，多喝水、運動。', element: '水' },
    { id: 10, time: '17:00-19:00', shichen: '酉時', organ: '腎', meridian: '足少陰腎經', advice: '腎藏精，不宜過勞，稍作休息。', element: '水' },
    { id: 11, time: '19:00-21:00', shichen: '戌時', organ: '心包', meridian: '手厥陰心包經', advice: '保持心情愉快，散步放鬆。', element: '火' },
    { id: 12, time: '21:00-23:00', shichen: '亥時', organ: '三焦', meridian: '手少陽三焦經', advice: '百脈休養生息，準備入睡。', element: '火' },
  ];

  // 判斷當前時辰
  const getCurrentMeridianIndex = () => {
    // 將23點處理為索引0 (子時)
    if (currentHour >= 23 || currentHour < 1) return 0;
    return Math.floor((currentHour - 1) / 2) + 1;
  };

  const activeIndex = getCurrentMeridianIndex();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // 每分鐘更新
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#2c2c2c] font-serif selection:bg-[#8b0000] selection:text-white">
      {/* 返回按鈕 */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white border border-[#8b0000]/30 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 text-[#8b0000] font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>返回首頁</span>
        </button>
      </div>

      {/* 頂部導航與主圖 */}
      <header className="relative w-full h-64 md:h-80 overflow-hidden border-b-4 border-[#8b0000]">
        <img
          src={imgSrc}
          alt="子午流注背景"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f4f1ea]/90 flex flex-col items-center justify-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-widest text-[#8b0000] drop-shadow-sm" style={{ fontFamily: '"Noto Serif TC", "Songti TC", serif' }}>
            子午流注
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-[#4a4a4a] tracking-widest">
            十二時辰養生指南
          </p>
        </div>
      </header>

      {/* 主要內容區 */}
      <main className="max-w-6xl mx-auto px-4 py-12">

        {/* 當前時辰提示 */}
        <div className="mb-12 text-center">
          <div className="inline-block p-8 border-2 border-[#8b0000] rounded-full bg-[#fffcf5] shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-[#8b0000]"></div>
             <h2 className="text-2xl text-[#555] mb-2">當前時辰</h2>
             <div className="text-6xl font-bold text-[#8b0000] mb-2">{meridians[activeIndex].shichen}</div>
             <div className="text-xl text-[#888]">{meridians[activeIndex].time}</div>
             <div className="mt-4 text-lg font-medium">
                運行經絡：<span className="text-[#8b0000]">{meridians[activeIndex].meridian}</span>
             </div>
          </div>
        </div>

        {/* 十二時辰卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {meridians.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={item.id}
                className={`
                  relative p-6 rounded-lg border transition-all duration-300
                  ${isActive
                    ? 'border-[#8b0000] bg-[#fffcf5] shadow-xl scale-105 z-10'
                    : 'border-[#dcdcdc] bg-white hover:border-[#a89f91] hover:shadow-md'}
                `}
              >
                {/* 裝飾角標 */}
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  {index < 6 || index === 11 ? <SunIcon /> : <MoonIcon />}
                </div>

                <div className="flex items-baseline justify-between mb-4 border-b border-dashed border-[#ccc] pb-2">
                  <h3 className={`text-2xl font-bold ${isActive ? 'text-[#8b0000]' : 'text-[#333]'}`}>
                    {item.shichen}
                  </h3>
                  <span className="text-sm font-mono text-[#666]">{item.time}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-16 text-[#888] text-sm">對應臟腑</span>
                    <span className="font-medium text-lg">{item.organ}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-[#888] text-sm">五行屬性</span>
                    <span className="font-medium">{item.element}</span>
                  </div>
                  <div className="pt-2">
                    <p className={`text-sm leading-relaxed ${isActive ? 'text-[#8b0000] font-medium' : 'text-[#555]'}`}>
                      {item.advice}
                    </p>
                  </div>
                </div>

                {/* 激活狀態下的額外裝飾 */}
                {isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#8b0000] rounded-r"></div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* 頁尾 */}
      <footer className="mt-12 py-8 text-center text-[#888] border-t border-[#e5e5e5] bg-[#faf9f6]">
        <p className="text-sm tracking-widest">順應天時 · 調和陰陽</p>
      </footer>
    </div>
  );
};

export default MeridianClock;