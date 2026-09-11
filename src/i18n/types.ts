export type LanguageCode = 
  | 'en' // English
  | 'hi' // Hindi - हिन्दी
  | 'bn' // Bengali - বাংলা
  | 'ta' // Tamil - தமிழ்
  | 'te' // Telugu - తెలుగు
  | 'mr' // Marathi - मराठी
  | 'gu' // Gujarati - ગુજરાતી
  | 'kn' // Kannada - ಕನ್ನಡ
  | 'ml' // Malayalam - മലയാളം
  | 'pa' // Punjabi - ਪੰਜਾਬੀ
  | 'or' // Odia - ଓଡ଼ିଆ
  | 'as' // Assamese - অসমীয়া
  | 'ur' // Urdu - اردو (RTL)
  | 'mai' // Maithili - मैथिली
  | 'doi' // Dogri - डोगरी
  | 'kok' // Konkani - कोंकणी
  | 'ks' // Kashmiri - कश्मीरी / کٲشُر
  | 'ne' // Nepali - नेपाली
  | 'sa' // Sanskrit - संस्कृतम्
  | 'sd' // Sindhi - سنڌي / सिंधी (RTL)
  | 'mni' // Manipuri - মৈতৈলোন / মণিপুরী
  | 'sat' // Santali - ᱥᱟᱱᱛᱟᱲᱤ
  | 'brx'; // Bodo - बड़ो

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
  region: string;
  dir: 'ltr' | 'rtl';
  speechCode: string;
  isEighthSchedule: boolean;
  sampleGreeting?: string;
}

export type TranslationKey = string;

export interface TranslationDictionary {
  [key: string]: string;
}
