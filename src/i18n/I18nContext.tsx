import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LanguageCode, LanguageMeta, TranslationDictionary } from './types';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from './languages';
import { GOVERNMENT_GLOSSARY } from './glossary';

// Import Translation Dictionaries
import { en } from './translations/en';
import { hi } from './translations/hi';
import { bn } from './translations/bn';
import { ta } from './translations/ta';
import { te } from './translations/te';
import { mr } from './translations/mr';
import { gu } from './translations/gu';
import { kn } from './translations/kn';
import { ml } from './translations/ml';
import { pa } from './translations/pa';
import { or } from './translations/or';
import { as } from './translations/as';
import { ur } from './translations/ur';

const TRANSLATIONS: Partial<Record<LanguageCode, TranslationDictionary>> = {
  en,
  hi,
  bn,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  or,
  as,
  ur,
};

export type CentralTerm =
  | 'project'
  | 'contractor'
  | 'sanctionedAmount'
  | 'releasedAmount'
  | 'expenditure'
  | 'physicalProgress'
  | 'financialProgress'
  | 'complaint'
  | 'inspection'
  | 'delayed'
  | 'underReview'
  | 'resolved'
  | 'verificationRequired';

export interface I18nContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  dir: 'ltr' | 'rtl';
  currentLanguageMeta: LanguageMeta;
  supportedLanguages: LanguageMeta[];
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
  lowBandwidthMode: boolean;
  setLowBandwidthMode: (enabled: boolean) => void;
  t: (key: string, fallback?: string) => string;
  term: (termKey: CentralTerm) => string;
  termSimple: (termKey: 'expenditure' | 'progress' | 'budget' | 'status' | 'report' | 'listen' | 'speak') => string;
  speak: (text: string, customSpeechCode?: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('satyaksh_lang') as LanguageCode;
      if (saved && LANGUAGE_MAP.has(saved)) return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const [simpleMode, setSimpleModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('satyaksh_simple_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [lowBandwidthMode, setLowBandwidthModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('satyaksh_low_bandwidth') === 'true';
    } catch {
      return false;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentLanguageMeta = LANGUAGE_MAP.get(language) || SUPPORTED_LANGUAGES[0];
  const dir = currentLanguageMeta.dir;

  // Sync document direction and lang attribute
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    try {
      localStorage.setItem('satyaksh_lang', language);
    } catch {
      // ignore
    }
  }, [language, dir]);

  const setLanguage = useCallback((code: LanguageCode) => {
    if (LANGUAGE_MAP.has(code)) {
      setLanguageState(code);
    }
  }, []);

  const setSimpleMode = useCallback((enabled: boolean) => {
    setSimpleModeState(enabled);
    try {
      localStorage.setItem('satyaksh_simple_mode', String(enabled));
    } catch {
      // ignore
    }
  }, []);

  const setLowBandwidthMode = useCallback((enabled: boolean) => {
    setLowBandwidthModeState(enabled);
    try {
      localStorage.setItem('satyaksh_low_bandwidth', String(enabled));
    } catch {
      // ignore
    }
  }, []);

  // Translation lookup with intelligent fallback chain
  const t = useCallback((key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to Hindi if not English
    if (language !== 'hi' && TRANSLATIONS.hi && TRANSLATIONS.hi[key]) {
      return TRANSLATIONS.hi[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  }, [language]);

  // Centralized Statutory Terminology Lookup
  const term = useCallback((termKey: CentralTerm): string => {
    const langGlossary = GOVERNMENT_GLOSSARY[language];
    if (langGlossary && langGlossary[termKey]) {
      return langGlossary[termKey];
    }
    const hiGlossary = GOVERNMENT_GLOSSARY.hi;
    if (hiGlossary && hiGlossary[termKey]) {
      return hiGlossary[termKey];
    }
    const enGlossary = GOVERNMENT_GLOSSARY.en;
    return (enGlossary && enGlossary[termKey]) || termKey;
  }, [language]);

  // Simple Mode Conversational Questions
  const termSimple = useCallback((termKey: 'expenditure' | 'progress' | 'budget' | 'status' | 'report' | 'listen' | 'speak'): string => {
    const simpleKey = `simple.${termKey}`;
    const langGlossary = GOVERNMENT_GLOSSARY[language];
    if (langGlossary && langGlossary[simpleKey]) {
      return langGlossary[simpleKey];
    }
    const hiGlossary = GOVERNMENT_GLOSSARY.hi;
    if (hiGlossary && hiGlossary[simpleKey]) {
      return hiGlossary[simpleKey];
    }
    const enGlossary = GOVERNMENT_GLOSSARY.en;
    return (enGlossary && enGlossary[simpleKey]) || termKey;
  }, [language]);

  // Web Speech API Voice Text-to-Speech (TTS)
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string, customSpeechCode?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis is not supported in this environment.');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const speechLang = customSpeechCode || currentLanguageMeta.speechCode || 'hi-IN';
      utterance.lang = speechLang;
      utterance.rate = 0.95; // Slightly slower for clarity in rural/low-literacy settings
      utterance.pitch = 1.0;

      // Match native voices if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(speechLang.split('-')[0]) || v.lang === speechLang);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, [currentLanguageMeta]);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        currentLanguageMeta,
        supportedLanguages: SUPPORTED_LANGUAGES,
        simpleMode,
        setSimpleMode,
        lowBandwidthMode,
        setLowBandwidthMode,
        t,
        term,
        termSimple,
        speak,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
