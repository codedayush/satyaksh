import React, { useState } from 'react';
import { 
  Languages, 
  Search, 
  Volume2, 
  VolumeX, 
  Check, 
  X, 
  Sparkles, 
  WifiOff, 
  Eye, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { LanguageMeta } from '../i18n/types';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { 
    language, 
    setLanguage, 
    supportedLanguages, 
    simpleMode, 
    setSimpleMode, 
    lowBandwidthMode, 
    setLowBandwidthMode,
    speak, 
    stopSpeaking, 
    isSpeaking,
    t 
  } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '8th' | 'popular'>('all');
  const [testedCode, setTestedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLanguages = supportedLanguages.filter((lang) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.region.toLowerCase().includes(q) ||
      lang.script.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (selectedFilter === '8th') return lang.isEighthSchedule;
    if (selectedFilter === 'popular') {
      return ['hi', 'en', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur'].includes(lang.code);
    }
    return true;
  });

  const handleSelectLanguage = (lang: LanguageMeta) => {
    setLanguage(lang.code);
    if (lang.sampleGreeting) {
      speak(lang.sampleGreeting, lang.speechCode);
    }
  };

  const handleTestAudio = (e: React.MouseEvent, lang: LanguageMeta) => {
    e.stopPropagation();
    setTestedCode(lang.code);
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const greeting = lang.sampleGreeting || `सत्याक्ष ${lang.nativeName} में`;
      speak(greeting, lang.speechCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="bg-white border border-stone-300 rounded-xs shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-stone-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
      >
        
        {/* Header Strip */}
        <div className="p-5 bg-[#faf9f5] border-b border-stone-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-amber-300 rounded-xs">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h2 id="language-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-stone-950 tracking-tight">
                {t('nav.language', 'Choose Your Preferred Language')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-sans mt-0.5">
                {t('lang.eighthSchedule', '22 Eighth Schedule Recognized Languages of India & Accessibility Modes')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Close language selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accessibility & Rural Mode Toggles Banner */}
        <div className="px-5 py-3.5 bg-amber-50/70 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Simple Mode Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xs border font-medium transition-all cursor-pointer ${
                simpleMode 
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs' 
                  : 'bg-white text-stone-700 border-amber-300 hover:bg-amber-100/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{simpleMode ? '✓ ' + t('nav.simpleMode', 'Simple Mode Active') : t('simple.title', 'Enable Citizen-Friendly Simple Mode')}</span>
            </button>
            <span className="text-[11px] text-stone-600 hidden md:inline">
              Plain conversational words & audio guidance
            </span>
          </div>

          {/* Low Bandwidth Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border font-mono text-[11px] transition-all cursor-pointer ${
                lowBandwidthMode
                  ? 'bg-stone-900 text-amber-300 border-stone-950'
                  : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Low-Bandwidth (2G/Rural)</span>
            </button>
          </div>

        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('lang.searchPlaceholder', 'Search language by English name or native script (e.g. हिन्दी, தமிழ், বাংলা)...')}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xs focus:bg-white focus:outline-hidden focus:border-stone-900 font-sans"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer ${
                selectedFilter === 'all' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All (23)
            </button>
            <button
              onClick={() => setSelectedFilter('8th')}
              className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer ${
                selectedFilter === '8th' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              8th Schedule (22)
            </button>
            <button
              onClick={() => setSelectedFilter('popular')}
              className={`px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer ${
                selectedFilter === 'popular' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Most Spoken
            </button>
          </div>

        </div>

        {/* Languages Grid Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#faf9f5]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`p-3.5 rounded-xs border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-amber-50/90 border-amber-600 ring-1 ring-amber-600 shadow-xs' 
                      : 'bg-white border-stone-200 hover:border-stone-400 hover:shadow-xs'
                  }`}
                >
                  
                  {/* Top: Native Name & Script */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-lg font-bold text-stone-950 font-serif leading-tight">
                        {lang.nativeName}
                      </div>
                      <div className="text-xs text-stone-600 font-sans mt-0.5">
                        {lang.name} <span className="text-stone-400">• {lang.script}</span>
                      </div>
                    </div>

                    {/* Active Checkmark */}
                    {isSelected && (
                      <div className="p-1 bg-amber-600 text-white rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Middle: Region & RTL Badge */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate max-w-[170px]" title={lang.region}>
                      {lang.region}
                    </span>
                    {lang.dir === 'rtl' && (
                      <span className="font-mono text-[9px] bg-stone-100 border border-stone-300 text-stone-700 px-1 py-0.5 rounded-xs">
                        RTL
                      </span>
                    )}
                  </div>

                  {/* Bottom: Audio Test Button */}
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => handleTestAudio(e, lang)}
                      className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-amber-800 transition-colors"
                      title={`Listen to greeting in ${lang.name}`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('simple.listen', 'Listen Voice')}</span>
                    </button>

                    <span className="text-[10px] font-mono text-stone-400">
                      {lang.speechCode}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="py-12 text-center text-stone-500 font-sans text-sm">
              No languages matched your search "{searchQuery}". Try typing in English or your native script.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-stone-600 font-sans flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Voice synthesis and Web Speech recognition use browser-native high-accuracy Indian accents.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue in {supportedLanguages.find(l => l.code === language)?.nativeName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
