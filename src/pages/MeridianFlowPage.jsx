import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HEALTH_CLOCK_CONFIG, getCurrentHealthClock } from '../components/HealthClock';

// 器官动画组件
const OrganAnimation = ({ organKey }) => {
  const animations = {
    zi: { // 胆经
      name: '胆',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="gallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <animate id="pulse1" attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </defs>
          <ellipse cx="100" cy="100" rx="60" ry="80" fill="url(#gallGradient)" opacity="0.8">
            <animate attributeName="ry" values="80;90;80" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="100" cy="100" r="40" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="40;50;40" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    },
    chou: { // 肝经
      name: '肝',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="liverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dcfce7" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
          </defs>
          <path d="M 100 40 Q 140 60 150 100 Q 140 140 100 160 Q 60 140 50 100 Q 60 60 100 40 Z" fill="url(#liverGradient)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
          </path>
          <path d="M 100 60 L 120 100 L 100 140 L 80 100 Z" fill="#10b981" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" values="0 100 100;360 100 100" dur="8s" repeatCount="indefinite" />
          </path>
        </svg>
      )
    },
    yin: { // 肺经
      name: '肺',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="lungGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
          </defs>
          <ellipse cx="80" cy="100" rx="35" ry="70" fill="url(#lungGradient)" opacity="0.8">
            <animate attributeName="ry" values="70;75;70" dur="3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="120" cy="100" rx="35" ry="70" fill="url(#lungGradient)" opacity="0.8">
            <animate attributeName="ry" values="70;75;70" dur="3s" begin="0.5s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="80" cy="100" r="20" fill="none" stroke="#0284c7" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="20;25;20" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="120" cy="100" r="20" fill="none" stroke="#0284c7" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="20;25;20" dur="3s" begin="0.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    },
    mao: { // 大肠经
      name: '大腸',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="colonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
          </defs>
          <path d="M 40 100 Q 60 60 100 50 Q 140 60 160 100 Q 140 140 100 150 Q 60 140 40 100" fill="url(#colonGradient)" opacity="0.8">
            <animate attributeName="d" values="M 40 100 Q 60 60 100 50 Q 140 60 160 100 Q 140 140 100 150 Q 60 140 40 100;M 40 100 Q 60 70 100 60 Q 140 70 160 100 Q 140 130 100 140 Q 60 130 40 100;M 40 100 Q 60 60 100 50 Q 140 60 160 100 Q 140 140 100 150 Q 60 140 40 100" dur="3s" repeatCount="indefinite" />
          </path>
        </svg>
      )
    },
    chen: { // 胃经
      name: '胃',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="stomachGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#f9a8d4" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="100" rx="70" ry="50" fill="url(#stomachGradient)" opacity="0.8">
            <animate attributeName="rx" values="70;75;70" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="100" cy="100" rx="50" ry="35" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </svg>
      )
    },
    si: { // 脾经
      name: '脾',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="spleenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="100" rx="40" ry="60" fill="url(#spleenGradient)" opacity="0.8">
            <animate attributeName="ry" values="60;65;60" dur="2.5s" repeatCount="indefinite" />
          </ellipse>
          <path d="M 100 50 L 120 100 L 100 150 L 80 100 Z" fill="#eab308" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" values="0 100 100;360 100 100" dur="6s" repeatCount="indefinite" />
          </path>
        </svg>
      )
    },
    wu: { // 心经
      name: '心',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fee2e2" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>
          <path d="M 100 60 C 80 40 50 50 50 80 C 50 110 100 150 100 150 C 100 150 150 110 150 80 C 150 50 120 40 100 60 Z" fill="url(#heartGradient)" opacity="0.9">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
          </path>
          <circle cx="100" cy="100" r="30" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values="30;35;30" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    },
    wei: { // 小肠经
      name: '小腸',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="intestineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <path d="M 50 100 Q 70 60 100 60 Q 130 60 150 100 Q 130 140 100 140 Q 70 140 50 100" fill="url(#intestineGradient)" opacity="0.8">
            <animate attributeName="d" values="M 50 100 Q 70 60 100 60 Q 130 60 150 100 Q 130 140 100 140 Q 70 140 50 100;M 50 100 Q 70 70 100 70 Q 130 70 150 100 Q 130 130 100 130 Q 70 130 50 100;M 50 100 Q 70 60 100 60 Q 130 60 150 100 Q 130 140 100 140 Q 70 140 50 100" dur="2.5s" repeatCount="indefinite" />
          </path>
          <circle cx="100" cy="100" r="35" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="35;40;35" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    },
    shen: { // 膀胱经
      name: '膀胱',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="bladderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="100" rx="50" ry="70" fill="url(#bladderGradient)" opacity="0.8">
            <animate attributeName="ry" values="70;75;70" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="100" cy="100" rx="35" ry="50" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </svg>
      )
    },
    you: { // 肾经
      name: '腎',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="kidneyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
          </defs>
          <ellipse cx="70" cy="100" rx="30" ry="45" fill="url(#kidneyGradient)" opacity="0.8">
            <animate attributeName="ry" values="45;50;45" dur="2.5s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="130" cy="100" rx="30" ry="45" fill="url(#kidneyGradient)" opacity="0.8">
            <animate attributeName="ry" values="45;50;45" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="70" cy="100" r="20" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="20;25;20" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="130" cy="100" r="20" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="20;25;20" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    },
    xu: { // 心包经
      name: '心包',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="pericardiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="60" fill="url(#pericardiumGradient)" opacity="0.8">
            <animate attributeName="r" values="60;65;60" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="40" fill="none" stroke="#ec4899" strokeWidth="3" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="25" fill="#f472b6" opacity="0.4">
            <animate attributeName="r" values="25;30;25" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    },
    hai: { // 三焦经
      name: '三焦',
      svg: (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="tripleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="60" rx="50" ry="30" fill="url(#tripleGradient)" opacity="0.8">
            <animate attributeName="ry" values="30;35;30" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="100" cy="100" rx="60" ry="40" fill="url(#tripleGradient)" opacity="0.8">
            <animate attributeName="rx" values="60;65;60" dur="2.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="100" cy="140" rx="50" ry="30" fill="url(#tripleGradient)" opacity="0.8">
            <animate attributeName="ry" values="30;35;30" dur="2.4s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="100" cy="100" r="35" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="35;40;35" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      )
    }
  };

  const organ = animations[organKey] || animations.zi;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48">
        {organ.svg}
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-lg font-bold text-green-800 bg-white bg-opacity-80 px-3 py-1 rounded">
            {organ.name}
          </span>
        </div>
      </div>
    </div>
  );
};

const MeridianFlowPage = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentHealthClock());
  const [selectedPeriod, setSelectedPeriod] = useState(null); // 选中的时辰
  const [hoveredIndex, setHoveredIndex] = useState(null); // 鼠标悬停的索引

  // 更新当前时间和时辰
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCurrentPeriod(getCurrentHealthClock());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 获取当前时段的索引，用于高亮显示
  const getCurrentPeriodIndex = () => {
    return HEALTH_CLOCK_CONFIG.findIndex(p => p.key === currentPeriod.key);
  };

  const currentIndex = getCurrentPeriodIndex();
  
  // 处理点击时辰
  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
  };

  // 获取要显示的时辰（优先显示选中的，否则显示当前的）
  const displayPeriod = selectedPeriod || currentPeriod;

  return (
    <div className="container mx-auto max-w-6xl p-4" style={{ backgroundColor: '#fcfbf7', color: '#1e293b' }}>
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">子午流注</h1>
            <p className="text-gray-600">十二時辰養生法 - 順應自然，調和陰陽</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-800">
              {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* Current Period Highlight */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 mb-8 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">
              {selectedPeriod ? '選中時辰' : '當前時辰'}
            </h2>
          </div>
          {selectedPeriod && (
            <button
              onClick={() => setSelectedPeriod(null)}
              className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              返回當前時辰
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Organ Animation */}
          <div className="flex justify-center md:justify-start">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <OrganAnimation organKey={displayPeriod.key} />
            </div>
          </div>
          
          {/* Text Content */}
          <div className="text-center md:text-left">
            <h3 className="text-5xl font-bold text-green-800 mb-3">{displayPeriod.name}</h3>
            <p className="text-lg text-gray-700 mb-4 font-medium">{displayPeriod.range}</p>
            <p className="text-base text-gray-800 bg-white bg-opacity-60 rounded-lg p-4">
              {displayPeriod.advice}
            </p>
          </div>
        </div>
      </div>

      {/* Meridian Flow Wheel */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">子午流注轉盤</h2>
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <svg 
              viewBox="0 0 500 500" 
              className="w-full h-auto drop-shadow-2xl"
              style={{ maxWidth: '600px', maxHeight: '600px' }}
            >
              <defs>
                {/* Gradient for current period */}
                <linearGradient id="currentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
                
                {/* Gradient for normal period */}
                <linearGradient id="normalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dcfce7" />
                  <stop offset="100%" stopColor="#bbf7d0" />
                </linearGradient>
                
                {/* Shadow filter */}
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2"/>
                </filter>
              </defs>
              
              {/* Outer circle background with gradient */}
              <circle 
                cx="250" 
                cy="250" 
                r="240" 
                fill="url(#normalGradient)" 
                stroke="#10b981" 
                strokeWidth="5"
                filter="url(#shadow)"
              />
              
              {/* Center circle with gradient */}
              <circle 
                cx="250" 
                cy="250" 
                r="85" 
                fill="#ffffff" 
                stroke="#10b981" 
                strokeWidth="4"
                filter="url(#shadow)"
              />
              
              {/* Center text */}
              <text 
                x="250" 
                y="240" 
                textAnchor="middle" 
                fontSize="24" 
                fontWeight="bold" 
                fill="#10b981"
              >
                子午流注
              </text>
              <text 
                x="250" 
                y="270" 
                textAnchor="middle" 
                fontSize="14" 
                fill="#059669"
              >
                十二時辰
              </text>
              
              {/* Draw 12 sectors for each period */}
              {HEALTH_CLOCK_CONFIG.map((period, index) => {
                const isCurrent = index === currentIndex;
                const isSelected = selectedPeriod && selectedPeriod.key === period.key;
                const isHovered = hoveredIndex === index;
                const angle = (index * 30 - 90) * (Math.PI / 180);
                const nextAngle = ((index + 1) * 30 - 90) * (Math.PI / 180);
                const innerRadius = 110;
                const outerRadius = 230;
                const textRadius = (innerRadius + outerRadius) / 2;
                
                // Calculate sector path
                const x1 = 250 + innerRadius * Math.cos(angle);
                const y1 = 250 + innerRadius * Math.sin(angle);
                const x2 = 250 + outerRadius * Math.cos(angle);
                const y2 = 250 + outerRadius * Math.sin(angle);
                const x3 = 250 + outerRadius * Math.cos(nextAngle);
                const y3 = 250 + outerRadius * Math.sin(nextAngle);
                const x4 = 250 + innerRadius * Math.cos(nextAngle);
                const y4 = 250 + innerRadius * Math.sin(nextAngle);
                
                // Text position
                const textAngle = (angle + nextAngle) / 2;
                const textX = 250 + textRadius * Math.cos(textAngle);
                const textY = 250 + textRadius * Math.sin(textAngle);
                const rotation = (textAngle * 180 / Math.PI);
                
                // 处理点击事件
                const handleClick = (e) => {
                  e.stopPropagation();
                  handlePeriodClick(period);
                };
                
                return (
                  <g 
                    key={period.key}
                    onClick={handleClick}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Sector background */}
                    <path
                      d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`}
                      fill={
                        isSelected 
                          ? "url(#currentGradient)" 
                          : isCurrent 
                            ? "url(#currentGradient)" 
                            : "url(#normalGradient)"
                      }
                      stroke={
                        isSelected || isCurrent
                          ? "#10b981" 
                          : isHovered
                            ? "#34d399"
                            : "#86efac"
                      }
                      strokeWidth={isSelected || isCurrent ? "4" : isHovered ? "3" : "2"}
                      opacity={isSelected || isCurrent ? "1" : isHovered ? "0.9" : "0.8"}
                      className="transition-all duration-300"
                      style={(isSelected || isCurrent) ? { filter: 'url(#shadow)' } : {}}
                    />
                    
                    {/* Period name - rotated text */}
                    <g transform={`translate(${textX}, ${textY}) rotate(${rotation > 90 && rotation < 270 ? rotation + 180 : rotation})`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="20"
                        fontWeight="bold"
                        fill={isSelected || isCurrent ? "#065f46" : "#1f2937"}
                      >
                        {period.name}
                      </text>
                      
                      {/* Time range */}
                      <text
                        x="0"
                        y="18"
                        textAnchor="middle"
                        fontSize="11"
                        fill={isSelected || isCurrent ? "#047857" : "#6b7280"}
                      >
                        {period.range}
                      </text>
                    </g>
                  </g>
                );
              })}
              
              {/* Hour markers */}
              {Array.from({ length: 12 }).map((_, i) => {
                const markerAngle = (i * 30 - 90) * (Math.PI / 180);
                const x1 = 250 + 95 * Math.cos(markerAngle);
                const y1 = 250 + 95 * Math.sin(markerAngle);
                const x2 = 250 + 110 * Math.cos(markerAngle);
                const y2 = 250 + 110 * Math.sin(markerAngle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })}
              
              {/* Pointer to current period (only show if no selection) */}
              {!selectedPeriod && (() => {
                const pointerAngle = (currentIndex * 30 - 90) * (Math.PI / 180);
                const pointerLength = 175;
                const pointerX = 250 + pointerLength * Math.cos(pointerAngle);
                const pointerY = 250 + pointerLength * Math.sin(pointerAngle);
                
                return (
                  <g>
                    {/* Pointer line with animation */}
                    <line
                      x1="250"
                      y1="250"
                      x2={pointerX}
                      y2={pointerY}
                      stroke="#10b981"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    {/* Pointer circle */}
                    <circle 
                      cx={pointerX} 
                      cy={pointerY} 
                      r="15" 
                      fill="#10b981" 
                      stroke="#ffffff" 
                      strokeWidth="3"
                      className="animate-pulse"
                    />
                    {/* Inner dot */}
                    <circle 
                      cx={pointerX} 
                      cy={pointerY} 
                      r="6" 
                      fill="#ffffff"
                    />
                  </g>
                );
              })()}
            </svg>
            
            {/* Current period info card below wheel */}
            <div className="mt-8 text-center">
              <div className="inline-block bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-500 rounded-xl px-8 py-4 shadow-lg transform transition-all hover:scale-105">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  {selectedPeriod ? '選中時辰' : '當前時辰'}
                </p>
                <p className="text-3xl font-bold text-green-800 mb-2">{displayPeriod.name}</p>
                <p className="text-base text-gray-700 font-medium">{displayPeriod.range}</p>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm text-gray-600 italic">{displayPeriod.advice}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                點擊轉盤上的任意時辰查看詳情
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Periods Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">十二時辰詳解</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEALTH_CLOCK_CONFIG.map((period, index) => {
            const isCurrent = index === currentIndex;
            return (
              <div
                key={period.key}
                className={`rounded-lg p-5 shadow-sm transition-all ${
                  isCurrent
                    ? 'bg-green-100 border-2 border-green-500 transform scale-105'
                    : 'bg-white border border-green-100 hover:shadow-md hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      isCurrent ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'
                    }`}>
                      {index + 1}
                    </div>
                    <h3 className={`text-2xl font-bold ml-3 ${
                      isCurrent ? 'text-green-800' : 'text-gray-800'
                    }`}>
                      {period.name}
                    </h3>
                  </div>
                  {isCurrent && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      當前
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 font-medium">{period.range}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{period.advice}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traditional Medicine Knowledge */}
      <div className="bg-white border border-green-100 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">關於子午流注</h2>
        <div className="prose max-w-none text-gray-700 space-y-3">
          <p>
            子午流注是中醫理論中的重要概念，它根據人體十二經脈的氣血運行規律，將一天分為十二個時辰，
            每個時辰對應一條經脈的氣血最旺盛時段。
          </p>
          <p>
            遵循子午流注的養生原則，在對應的時辰進行相應的活動，可以更好地調和陰陽、平衡氣血，
            達到養生保健、預防疾病的目的。
          </p>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold text-green-800 mb-2">養生要點：</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>順應自然規律，按時作息</li>
              <li>在對應時辰進行相應的養生活動</li>
              <li>避免在氣血運行旺盛時段做對身體不利的事情</li>
              <li>結合個人體質，靈活調整養生方法</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeridianFlowPage;

