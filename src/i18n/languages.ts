import { LanguageMeta } from './types';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    region: 'Pan-India / Official',
    dir: 'ltr',
    speechCode: 'en-IN',
    isEighthSchedule: false,
    sampleGreeting: 'Welcome to JanNirmaan'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    region: 'North & Central India',
    dir: 'ltr',
    speechCode: 'hi-IN',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माण में आपका स्वागत है'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    region: 'West Bengal, Tripura, Assam',
    dir: 'ltr',
    speechCode: 'bn-IN',
    isEighthSchedule: true,
    sampleGreeting: 'জননির্মাণে আপনাকে স্বাগতম'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    region: 'Tamil Nadu, Puducherry',
    dir: 'ltr',
    speechCode: 'ta-IN',
    isEighthSchedule: true,
    sampleGreeting: 'ஜன்னிர்மாண் தளத்திற்கு நல்வரவு'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    region: 'Andhra Pradesh, Telangana',
    dir: 'ltr',
    speechCode: 'te-IN',
    isEighthSchedule: true,
    sampleGreeting: 'జన్నిర్మాణ్‌కు స్వాగతం'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    region: 'Maharashtra, Goa',
    dir: 'ltr',
    speechCode: 'mr-IN',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माण मध्ये आपले स्वागत आहे'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    region: 'Gujarat, Daman & Diu',
    dir: 'ltr',
    speechCode: 'gu-IN',
    isEighthSchedule: true,
    sampleGreeting: 'જનનિર્માણમાં આપનું સ્વાગત છે'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    region: 'Karnataka',
    dir: 'ltr',
    speechCode: 'kn-IN',
    isEighthSchedule: true,
    sampleGreeting: 'ಜನ್ನಿರ್ಮಾಣ್‌ಗೆ ಸ್ವಾಗತ'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    region: 'Kerala, Lakshadweep',
    dir: 'ltr',
    speechCode: 'ml-IN',
    isEighthSchedule: true,
    sampleGreeting: 'ജൻനിർമ്മാണിലേക്ക് സ്വാഗതം'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    region: 'Punjab, Chandigarh, Delhi',
    dir: 'ltr',
    speechCode: 'pa-IN',
    isEighthSchedule: true,
    sampleGreeting: 'ਜਨਨਿਰਮਾਣ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia',
    region: 'Odisha',
    dir: 'ltr',
    speechCode: 'or-IN',
    isEighthSchedule: true,
    sampleGreeting: 'ଜନନିର୍ମାଣକୁ ସ୍ୱାଗତ'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'Bengali-Assamese',
    region: 'Assam',
    dir: 'ltr',
    speechCode: 'as-IN',
    isEighthSchedule: true,
    sampleGreeting: 'জননিৰ্মাণলৈ স্বাগতম'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Perso-Arabic (Nastaliq)',
    region: 'Pan-India, Telangana, UP, J&K',
    dir: 'rtl',
    speechCode: 'ur-IN',
    isEighthSchedule: true,
    sampleGreeting: 'جَن نِرمان میں خوش آمدید'
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    script: 'Devanagari / Mithilakshar',
    region: 'Bihar, Jharkhand',
    dir: 'ltr',
    speechCode: 'hi-IN',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माण मे अहाँक स्वागत अछि'
  },
  {
    code: 'doi',
    name: 'Dogri',
    nativeName: 'डोगरी',
    script: 'Devanagari',
    region: 'Jammu & Kashmir, Himachal Pradesh',
    dir: 'ltr',
    speechCode: 'hi-IN',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माण च तुंदा स्वागत ऐ'
  },
  {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    script: 'Devanagari / Roman',
    region: 'Goa, Karnataka, Maharashtra',
    dir: 'ltr',
    speechCode: 'mr-IN',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माणान्त तुमकां येवकार'
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'कश्मीरी / کٲشُر',
    script: 'Perso-Arabic / Devanagari',
    region: 'Jammu & Kashmir',
    dir: 'rtl',
    speechCode: 'ur-IN',
    isEighthSchedule: true,
    sampleGreeting: 'جَن نِرمان مَنز خوش آمدید'
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    script: 'Devanagari',
    region: 'Sikkim, West Bengal, Assam',
    dir: 'ltr',
    speechCode: 'ne-NP',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माणमा तपाईंलाई स्वागत छ'
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    script: 'Devanagari',
    region: 'Classical National Heritage',
    dir: 'ltr',
    speechCode: 'hi-IN',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माणम् प्रति भवतां स्वागतम्'
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي / सिंधी',
    script: 'Perso-Arabic / Devanagari',
    region: 'Gujarat, Maharashtra, Rajasthan',
    dir: 'rtl',
    speechCode: 'sd-IN',
    isEighthSchedule: true,
    sampleGreeting: 'جن نرمان ۾ ڀلي ڪري آيا'
  },
  {
    code: 'mni',
    name: 'Manipuri',
    nativeName: 'মৈতৈলোন / মণিপুরী',
    script: 'Meitei Mayek / Bengali',
    region: 'Manipur',
    dir: 'ltr',
    speechCode: 'bn-IN',
    isEighthSchedule: true,
    sampleGreeting: 'জননির্মাণদা তরামনা ওকচরি'
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    script: 'Ol Chiki',
    region: 'Jharkhand, Odisha, West Bengal',
    dir: 'ltr',
    speechCode: 'hi-IN',
    isEighthSchedule: true,
    sampleGreeting: 'ᱡᱟᱱ ᱱᱤᱨᱢᱟᱬ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ'
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बड़ो',
    script: 'Devanagari',
    region: 'Assam, Bodoland',
    dir: 'ltr',
    speechCode: 'as-IN',
    isEighthSchedule: true,
    sampleGreeting: 'जननिर्माण आव बरायबाय'
  }
];

export const LANGUAGE_MAP = new Map(SUPPORTED_LANGUAGES.map(l => [l.code, l]));
