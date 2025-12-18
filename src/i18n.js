import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入语言资源
import translationEN from './locales/en.json';
import translationZH from './locales/zh.json';
import translationYUE from './locales/yue.json';

// 语言资源
const resources = {
  en: {
    translation: translationEN
  },
  zh: {
    translation: translationZH
  },
  yue: {
    translation: translationYUE
  }
};

// 初始化i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认语言
    fallbackLng: 'zh', // 回退语言
    interpolation: {
      escapeValue: false // React 已经转义了
    }
  });

export default i18n;