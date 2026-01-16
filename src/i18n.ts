import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

// Only bundle English as the default/fallback - others load on demand
import enTranslation from './locales/en/translation.json';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation }
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: [
      'en', 'es', 'zh', 'ja', 'tl', 'fr', 'bn', 'ru', 'pt', 'ur',
      'id', 'de', 'vi', 'tr', 'te', 'mr', 'ta', 'sw', 'ha', 'am',
      'yo', 'om', 'ig', 'zu', 'ff', 'xh', 'sn', 'so', 'ak', 'ms',
      'fa', 'uk', 'ro', 'cs', 'he', 'nl', 'sv', 'ko', 'it', 'th',
      'pl', 'hi', 'el', 'bg', 'sr', 'et', 'lt', 'lv', 'sl', 'ps',
      'ne', 'si', 'km', 'zh-TW', 'ar', 'fi', 'no', 'da', 'hr', 'hu',
      'sk', 'ku', 'kk', 'my', 'lo', 'mg', 'rw', 'af', 'bm', 'pa',
      'gu', 'yue', 'ca', 'pcm', 'ht', 'sq'
    ],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: {
      escapeValue: false
    },
    partialBundledLanguages: true,
  });

export default i18n;
