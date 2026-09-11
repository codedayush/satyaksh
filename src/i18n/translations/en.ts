import { TranslationDictionary } from '../types';

export const en: TranslationDictionary = {
  // App brand & header
  'app.name': 'JanNirmaan',
  'app.tagline': 'National Infrastructure Transparency & Accountability Platform',
  'app.subtitle': 'Track public projects from cabinet sanction to ground reality.',
  
  // Navigation
  'nav.home': 'National Overview',
  'nav.projects': 'Project Explorer',
  'nav.map': 'Geospatial Map',
  'nav.hierarchy': 'State & District Drilldown',
  'nav.complaints': 'Citizen Grievance Portal',
  'nav.contractors': 'Contractor Registry',
  'nav.analytics': 'Macro Analytics',
  'nav.authority': 'Authority Command Desk',
  'nav.sources': 'Open Data Sources',
  'nav.askAI': 'JanNirmaan Sahayak AI',
  'nav.language': 'Language',
  'nav.simpleMode': 'Simple Mode',
  'nav.detailedMode': 'Detailed Mode',

  // Language banner suggestion
  'lang.suggest': 'Would you like to browse in {langName}?',
  'lang.switch': 'Switch to {langName}',
  'lang.keepEnglish': 'Keep English',
  'lang.searchPlaceholder': 'Search language or type native name...',
  'lang.eighthSchedule': 'Eighth Schedule Recognized Languages of India',
  'lang.otherLanguages': 'Other Supported Official Languages',

  // Voice & TTS
  'voice.speakComplaint': 'Speak your issue in your language',
  'voice.listening': 'Listening... Speak clearly now',
  'voice.stopListening': 'Done speaking',
  'voice.searchByVoice': 'Search by Voice',
  'voice.transcribedText': 'Transcribed Speech (Editable):',
  'voice.listenAudio': 'Listen to summary',
  'voice.stopAudio': 'Stop audio playback',
  'voice.notSupported': 'Voice recognition is not supported in this browser.',

  // Simple Mode toggle
  'simple.title': 'Citizen-Friendly Simple Mode',
  'simple.description': 'Simplified terms, large visual indicators, and audio guides.',
  'simple.enable': 'Turn on Simple Mode',
  'simple.disable': 'Switch to Detailed Mode',

  // Search & Filter
  'search.placeholder': 'Search by project name, highway code, district, or contractor...',
  'search.voiceBtn': 'Voice Search',
  'search.categoryAll': 'All Infrastructure Sectors',
  'search.stateAll': 'All States & UTs',
  'search.districtAll': 'All Districts',
  'search.statusAll': 'All Progress States',
  'search.healthAll': 'All Health Indicators',
  'search.localityAll': 'All Sectors (Rural & Urban)',
  'search.localityRural': '🌾 Rural Infrastructure',
  'search.localityUrban': '🏙️ Urban Infrastructure',
  'search.resultsCount': 'Found {count} infrastructure projects',

  // Metrics & Headers
  'metric.sanctionedBudget': 'Total Sanctioned Outlay',
  'metric.expenditure': 'Certified Disbursed Spend',
  'metric.fundsReleased': 'PFMS Released Funds',
  'metric.physicalProgress': 'Physical Milestone Progress',
  'metric.financialUtilization': 'Financial Utilization',
  'metric.activeProjects': 'Active Projects',
  'metric.completedProjects': 'Completed Projects',
  'metric.delayedProjects': 'Delayed Projects',
  'metric.attentionRequired': 'High Monitoring Priority',
  'metric.avgProgress': 'National Physical Average',
  'metric.avgUtilization': 'National Budget Utilization',

  // Project Details
  'project.overview': 'Project Overview',
  'project.moneyTrail': 'Open Money Trail & Bill Ledger',
  'project.digitalTwin': '3D Structural Digital Twin',
  'project.inspections': 'Quality Lab & Inspection Log',
  'project.auditTrail': 'District Verification & Audit Trail',
  'project.timeline': 'Milestone Lifecycle Timeline',
  'project.evidenceMismatch': 'Reported vs Ground Evidence Reality',
  'project.officialReported': 'Official Reported Progress',
  'project.visualEvidence': 'Independent Visual/Satellite Evidence',
  'project.mismatchAlert': 'Verification Required: Physical milestone discrepancy detected between field upload and certified ledger.',
  'project.contractorDetails': 'Awarded Contractor Details',
  'project.nodalOfficer': 'Statutory Nodal Officer',
  'project.reportIssue': 'Report Ground Issue / File Observation',

  // Grievance Portal
  'complaint.title': 'Citizen Grievance & Ground Audit Portal',
  'complaint.subtitle': 'Submit geotagged observations with photo evidence. AI triaged and routed directly to the nodal engineer.',
  'complaint.formTitle': 'File a New Ground Grievance',
  'complaint.selectProject': 'Select Target Project',
  'complaint.category': 'Issue Category',
  'complaint.description': 'Describe the Ground Reality',
  'complaint.location': 'Ground Landmark / Coordinates',
  'complaint.captureGps': 'Use Current GPS Coordinates',
  'complaint.uploadPhoto': 'Upload Site Photo Evidence',
  'complaint.submitBtn': 'Submit Verified Grievance',
  'complaint.submitting': 'Registering on Public Ledger...',
  'complaint.trackTitle': 'Track Existing Grievance Status',
  'complaint.trackPlaceholder': 'Enter Complaint ID (e.g. JN-CMP-2027-001284)...',
  'complaint.trackBtn': 'Track Status',
  'complaint.slaDeadline': 'Statutory SLA Deadline',
  'complaint.slaBreached': 'SLA Breached - Escalated to DM',
  'complaint.aiTriage': 'AI Triage & Categorization Assessment',
  'complaint.viewOriginal': 'View Original Submission',
  'complaint.viewTranslated': 'View Translated Version',
  'complaint.officialReply': 'Official Government Response',

  // JanNirmaan Sahayak AI Assistant
  'sahayak.title': 'JanNirmaan Sahayak — Multilingual AI Assistant',
  'sahayak.subtitle': 'Ask any question about public budgets, contractors, project delays, or civic rights in your mother tongue.',
  'sahayak.inputPlaceholder': 'Ask in Hindi, Tamil, Bengali, Telugu, Marathi, English...',
  'sahayak.sendBtn': 'Ask Sahayak',
  'sahayak.thinking': 'Analyzing verified public records...',
  'sahayak.disclaimer': 'JanNirmaan Sahayak only answers from verified government project filings. Never hallucinates.',
  'sahayak.sample1': 'How many delayed road projects in Bihar?',
  'sahayak.sample2': 'Show expenditure details of the Ganga Bridge project',
  'sahayak.sample3': 'How to file a grievance against poor road asphalt quality?',

  // Authority Dashboard
  'authority.title': 'Government Authority Command Desk',
  'authority.subtitle': 'Authorized nodal desk for Measurement Book (MB) recordings and grievance triage.',
  'authority.switchRole': 'Switch Administrative Role',
  'authority.recordLedger': 'Record Measurement Book (MB) Entry',
  'authority.resolveGrievance': 'Citizen Grievance Resolution Desk',
  'authority.actionGrievance': 'Action this Grievance',
  'authority.submitResolution': 'Submit Resolution & Notify Citizen',

  // Status labels
  'status.onTrack': 'On Track',
  'status.monitor': 'Monitor Closely',
  'status.attentionRequired': 'Attention Required',
  'status.highPriority': 'High Monitoring Priority',
  'status.completed': 'Completed',
  'status.underConstruction': 'Under Construction',
  'status.tenderApproved': 'Tender Awarded',

  // Common UI
  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.downloadPdf': 'Download Official Report (PDF)',
  'common.share': 'Share',
  'common.back': 'Back',
  'common.viewAll': 'View All',
  'common.loading': 'Loading verified public infrastructure ledger...',
  'common.error': 'Error connecting to data node',
  'common.noData': 'No matching records found for this filter.',
  'common.verifiedBadge': 'Govt Verified Record',
  'common.aiAdvisory': 'AI Analysis is strictly advisory based on public filings.'
};
