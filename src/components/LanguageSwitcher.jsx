import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    console.log('=============== Language changed to:', lng);
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded text-xs font-medium ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('zh')}
        className={`px-2 py-1 rounded text-xs font-medium ${i18n.language === 'zh' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        中文
      </button>
      <button
        onClick={() => changeLanguage('yue')}
        className={`px-2 py-1 rounded text-xs font-medium ${i18n.language === 'yue' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        粵語
      </button>
    </div>
  );
};

export default LanguageSwitcher;