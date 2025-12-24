import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

const savedLanguage = localStorage.getItem('language') || 'ja';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      ja: { translation: ja },
    },
    lng: savedLanguage,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;