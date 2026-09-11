import { TranslationDictionary } from '../types';

export const hi: TranslationDictionary = {
  // App brand & header
  'app.name': 'जननिर्माण',
  'app.tagline': 'राष्ट्रीय अवसंरचना पारदर्शिता एवं जवाबदेही मंच',
  'app.subtitle': 'कैबिनेट मंजूरी से लेकर जमीनी हकीकत तक सरकारी निर्माण कार्यों की निगरानी।',
  
  // Navigation
  'nav.home': 'राष्ट्रीय अवलोकन',
  'nav.projects': 'परियोजना एक्सप्लोरर',
  'nav.map': 'भू-स्थानिक मानचित्र',
  'nav.hierarchy': 'राज्य एवं जिला स्तर',
  'nav.complaints': 'नागरिक शिकायत पोर्टल',
  'nav.contractors': 'ठेकेदार निर्देशिका',
  'nav.analytics': 'समग्र विश्लेषण',
  'nav.authority': 'अधिकारी कमान केंद्र',
  'nav.sources': 'ओपन डेटा स्रोत',
  'nav.askAI': 'जननिर्माण सहायक AI',
  'nav.language': 'भाषा बदलें',
  'nav.simpleMode': 'सरल मोड',
  'nav.detailedMode': 'विस्तृत मोड',

  // Language banner suggestion
  'lang.suggest': 'क्या आप हिन्दी में जननिर्माण का उपयोग करना चाहते हैं?',
  'lang.switch': 'हिन्दी चुनें',
  'lang.keepEnglish': 'English जारी रखें',
  'lang.searchPlaceholder': 'भाषा खोजें या अपनी मातृभाषा का नाम लिखें...',
  'lang.eighthSchedule': 'संविधान की आठवीं अनुसूची में मान्यता प्राप्त भारतीय भाषाएं',
  'lang.otherLanguages': 'अन्य समर्थित आधिकारिक भाषाएं',

  // Voice & TTS
  'voice.speakComplaint': 'अपनी भाषा में बोलकर समस्या बताएं',
  'voice.listening': 'सुन रहे हैं... कृपया स्पष्ट बोलें',
  'voice.stopListening': 'बोलना पूरा हुआ',
  'voice.searchByVoice': 'बोलकर खोजें',
  'voice.transcribedText': 'आवाज से लिखा गया विवरण (बदलाव कर सकते हैं):',
  'voice.listenAudio': 'विवरण सुनें',
  'voice.stopAudio': 'आवाज बंद करें',
  'voice.notSupported': 'इस ब्राउज़र में आवाज पहचान समर्थित नहीं है।',

  // Simple Mode toggle
  'simple.title': 'नागरिक-हितैषी सरल मोड',
  'simple.description': 'आसान बोलचाल, बड़े संकेत और आवाज से जानकारी।',
  'simple.enable': 'सरल मोड चालू करें',
  'simple.disable': 'विस्तृत मोड पर जाएं',

  // Search & Filter
  'search.placeholder': 'परियोजना का नाम, सड़क कोड, जिला या ठेकेदार खोजें...',
  'search.voiceBtn': 'बोलकर खोजें',
  'search.categoryAll': 'सभी अवसंरचना क्षेत्र',
  'search.stateAll': 'सभी राज्य और केंद्र शासित प्रदेश',
  'search.districtAll': 'सभी जिले',
  'search.statusAll': 'सभी कार्य स्थितियां',
  'search.healthAll': 'सभी स्वास्थ्य संकेतक',
  'search.localityAll': 'सभी क्षेत्र (ग्रामीण और शहरी)',
  'search.localityRural': '🌾 ग्रामीण अवसंरचना',
  'search.localityUrban': '🏙️ शहरी अवसंरचना',
  'search.resultsCount': '{count} सरकारी निर्माण परियोजनाएं उपलब्ध हैं',

  // Metrics & Headers
  'metric.sanctionedBudget': 'कुल स्वीकृत बजट',
  'metric.expenditure': 'प्रमाणित खर्च की गई राशि',
  'metric.fundsReleased': 'PFMS द्वारा जारी राशि',
  'metric.physicalProgress': 'भौतिक कार्य प्रगति',
  'metric.financialUtilization': 'वित्तीय उपयोगिता',
  'metric.activeProjects': 'सक्रिय परियोजनाएं',
  'metric.completedProjects': 'पूर्ण परियोजनाएं',
  'metric.delayedProjects': 'विलंबित परियोजनाएं',
  'metric.attentionRequired': 'उच्च निगरानी प्राथमिकता',
  'metric.avgProgress': 'राष्ट्रीय औसत प्रगति',
  'metric.avgUtilization': 'राष्ट्रीय बजट उपयोग',

  // Project Details
  'project.overview': 'परियोजना विवरण',
  'project.moneyTrail': 'खुला वित्तीय बहीखाता (Money Trail)',
  'project.digitalTwin': '3D डिजिटल ट्विन मॉडल',
  'project.inspections': 'गुणवत्ता जांच एवं लैब रिपोर्ट',
  'project.auditTrail': 'जिला सत्यापन एवं ऑडिट ट्रेल',
  'project.timeline': 'समय-सीमा एवं चरणबद्ध प्रगति',
  'project.evidenceMismatch': 'सरकारी रिपोर्ट बनाम जमीनी हकीकत',
  'project.officialReported': 'अधिकारिक दर्ज प्रगति',
  'project.visualEvidence': 'स्वतंत्र फोटोग्राफिक/उपग्रह साक्ष्य',
  'project.mismatchAlert': 'सत्यापन आवश्यक: मौके के साक्ष्य और आधिकारिक लेजर में अंतर पाया गया है।',
  'project.contractorDetails': 'आवंटित ठेकेदार का विवरण',
  'project.nodalOfficer': 'नामित नोडल अधिकारी',
  'project.reportIssue': 'जमीनी समस्या बताएं / शिकायत दर्ज करें',

  // Grievance Portal
  'complaint.title': 'नागरिक शिकायत एवं जमीनी ऑडिट पोर्टल',
  'complaint.subtitle': 'फोटो साक्ष्य के साथ जीपीएस-सत्यापित शिकायत दर्ज करें। AI द्वारा सीधे नोडल इंजीनियर को भेजा जाएगा।',
  'complaint.formTitle': 'नई जमीनी शिकायत दर्ज करें',
  'complaint.selectProject': 'लक्षित परियोजना चुनें',
  'complaint.category': 'समस्या की श्रेणी',
  'complaint.description': 'जमीनी स्थिति का विवरण दें',
  'complaint.location': 'स्थान / लैंडमार्क / जीपीएस पिन',
  'complaint.captureGps': 'वर्तमान जीपीएस स्थान लें',
  'complaint.uploadPhoto': 'स्थल की फोटो अपलोड करें',
  'complaint.submitBtn': 'सत्यापित शिकायत जमा करें',
  'complaint.submitting': 'पब्लिक लेजर में दर्ज हो रहा है...',
  'complaint.trackTitle': 'शिकायत की स्थिति ट्रैक करें',
  'complaint.trackPlaceholder': 'शिकायत आईडी दर्ज करें (उदा. JN-CMP-2027-001284)...',
  'complaint.trackBtn': 'स्थिति देखें',
  'complaint.slaDeadline': 'कानूनी समाधान समय-सीमा (SLA)',
  'complaint.slaBreached': 'समय-सीमा समाप्त - जिलाधिकारी को प्रेषित',
  'complaint.aiTriage': 'AI वर्गीकरण एवं प्राथमिकता मूल्यांकन',
  'complaint.viewOriginal': 'मूल नागरिक शिकायत देखें',
  'complaint.viewTranslated': 'अनुवादित प्रति देखें',
  'complaint.officialReply': 'अधिकारिक सरकारी जवाब',

  // JanNirmaan Sahayak AI Assistant
  'sahayak.title': 'जननिर्माण सहायक — बहुभाषी AI सहायक',
  'sahayak.subtitle': 'अपनी मातृभाषा में बजट, ठेकेदार, काम में देरी या नागरिक अधिकारों पर कोई भी सवाल पूछें।',
  'sahayak.inputPlaceholder': 'हिन्दी, தமிழ், বাংলা, తెలుగు, मराठी या अंग्रेजी में पूछें...',
  'sahayak.sendBtn': 'सहायक से पूछें',
  'sahayak.thinking': 'सत्यापित सरकारी रिकॉर्ड का विश्लेषण हो रहा है...',
  'sahayak.disclaimer': 'जननिर्माण सहायक केवल सत्यापित सरकारी फाइलों से ही उत्तर देता है। कभी भी मनगढ़ंत बातें नहीं करता।',
  'sahayak.sample1': 'बिहार में कितनी सड़क परियोजनाएं विलंबित हैं?',
  'sahayak.sample2': 'गंगा पुल परियोजना के खर्च का ब्योरा दिखाएं',
  'sahayak.sample3': 'खराब डामर सड़क के खिलाफ शिकायत कैसे दर्ज करें?',

  // Authority Dashboard
  'authority.title': 'सरकारी अधिकारी कमान केंद्र',
  'authority.subtitle': 'मेजरमेंट बुक (MB) प्रविष्टि और नागरिक शिकायत निवारण हेतु आधिकारिक पोर्टल।',
  'authority.switchRole': 'प्रशासनिक पद बदलें',
  'authority.recordLedger': 'मेजरमेंट बुक (MB) में प्रगति दर्ज करें',
  'authority.resolveGrievance': 'नागरिक शिकायत समाधान पटल',
  'authority.actionGrievance': 'इस शिकायत पर कार्रवाई करें',
  'authority.submitResolution': 'समाधान रिपोर्ट दर्ज करें एवं नागरिक को सूचित करें',

  // Status labels
  'status.onTrack': 'समय पर अग्रसर',
  'status.monitor': 'निगरानी आवश्यक',
  'status.attentionRequired': 'ध्यान देने योग्य',
  'status.highPriority': 'उच्च निगरानी प्राथमिकता',
  'status.completed': 'सफलतापूर्वक पूर्ण',
  'status.underConstruction': 'निर्माणाधीन',
  'status.tenderApproved': 'टेंडर स्वीकृत',

  // Common UI
  'common.close': 'बंद करें',
  'common.cancel': 'रद्द करें',
  'common.save': 'सहेजें',
  'common.downloadPdf': 'सरकारी रिपोर्ट डाउनलोड करें (PDF)',
  'common.share': 'साझा करें',
  'common.back': 'पीछे जाएं',
  'common.viewAll': 'सभी देखें',
  'common.loading': 'सत्यापित सार्वजनिक अवसंरचना लेजर लोड हो रहा है...',
  'common.error': 'डेटा नोड से संपर्क करने में त्रुटि',
  'common.noData': 'इस फिल्टर के लिए कोई रिकॉर्ड नहीं मिला।',
  'common.verifiedBadge': 'सरकारी सत्यापित रिकॉर्ड',
  'common.aiAdvisory': 'AI विश्लेषण सार्वजनिक फाइलों पर आधारित एवं केवल परामर्श हेतु है।'
};
