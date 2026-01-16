import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import i18n from '../i18n'; // Import i18n instance

type Language = 'en' | 'es' | 'zh' | 'ja' | 'tl' | 'fr' | 'bn' | 'ru' | 'pt' | 'ur' | 'id' | 'de' | 'vi' | 'tr' | 'te' | 'mr' | 'ta' | 'sw' | 'ha' | 'am' | 'yo' | 'om' | 'ig' | 'zu' | 'ff' | 'xh' | 'sn' | 'so' | 'ak' | 'ms' | 'fa' | 'uk' | 'ro' | 'cs' | 'he' | 'nl' | 'sv' | 'ko' | 'it' | 'th' | 'pl' | 'hi' | 'el' | 'bg' | 'sr' | 'et' | 'lt' | 'lv' | 'sl' | 'ps' | 'ne' | 'si' | 'km' | 'zh-TW' | 'ar' | 'fi' | 'no' | 'da' | 'hr' | 'hu' | 'sk' | 'ku' | 'kk' | 'my' | 'lo' | 'mg' | 'rw' | 'af' | 'bm' | 'pa' | 'gu' | 'yue' | 'ca' | 'pcm' | 'ht' | 'sq';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: LanguageOption[];
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);
const STORAGE_KEY = 'tiger-rails-language';
const FEATURED_LANGUAGE_CODES: Language[] = ['en', 'es', 'zh', 'hi', 'ar'];

const LANGUAGE_DATA: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yoruba' },
  { code: 'om', name: 'Oromo', nativeName: 'Oromo' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'ff', name: 'Fula', nativeName: 'Fulfulde' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali' },
  { code: 'ak', name: 'Akan', nativeName: 'Akan' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'fa', name: 'Farsi', nativeName: 'فارسی' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'ku', name: 'Kurdish', nativeName: 'کوردی' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'yue', name: 'Cantonese', nativeName: '廣東話' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'pcm', name: 'Nigerian Pidgin', nativeName: 'Naija' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
];

const LANGUAGE_MAP = new Map(LANGUAGE_DATA.map((lang) => [lang.code, lang]));

const featuredLanguages = FEATURED_LANGUAGE_CODES
  .map((code) => LANGUAGE_MAP.get(code))
  .filter((lang): lang is LanguageOption => Boolean(lang));

const otherLanguages = LANGUAGE_DATA
  .filter(({ code }) => !FEATURED_LANGUAGE_CODES.includes(code))
  .sort((a, b) => a.name.localeCompare(b.name));

export const LANGUAGES: LanguageOption[] = [...featuredLanguages, ...otherLanguages];
const LANGUAGE_CODES: Language[] = LANGUAGES.map(({ code }) => code);
const DEFAULT_LANGUAGE: Language = 'en';

const matchLanguage = (value?: string | null): Language | undefined => {
  if (!value) {
    return undefined;
  }

  const lowerValue = value.toLowerCase();

  const directMatch = LANGUAGE_CODES.find((code) => code.toLowerCase() === lowerValue);
  if (directMatch) {
    return directMatch;
  }

  const base = lowerValue.split('-')[0];
  return LANGUAGE_CODES.find((code) => code.toLowerCase().split('-')[0] === base);
};

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    const storedMatch = matchLanguage(stored);
    if (storedMatch) {
      return storedMatch;
    }

    const browserLang = typeof navigator !== 'undefined' ? navigator.language : undefined;
    const browserMatch = matchLanguage(browserLang);
    return browserMatch ?? DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    // Set HTML lang attribute
    document.documentElement.lang = language;
    i18n.changeLanguage(language); // Update i18n language
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, newLanguage);
    }
  };

  return (
    <LocalizationContext.Provider value={{
      language,
      setLanguage,
      availableLanguages: LANGUAGES,
    }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}
