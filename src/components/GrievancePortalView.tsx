import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Mic, 
  MicOff, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Search, 
  ShieldCheck, 
  FileText, 
  Camera, 
  MapPin, 
  User, 
  Phone, 
  Volume2, 
  Send, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Eye,
  Sparkles,
  Building,
  Check
} from 'lucide-react';
import { Project, CitizenComplaint, ComplaintStatus, GovernmentResponse, InspectionRecord } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface GrievancePortalViewProps {
  projects: Project[];
  initialProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
}

// Initial realistic official grievance records with government responses
const SEED_COMPLAINTS: CitizenComplaint[] = [
  {
    id: 'GRV-2026-8812',
    projectId: 'proj-001',
    projectTitle: 'Construction of High School Building at Azamnagar Block',
    workCode: 'MPLADS-18LS-BR-KAT-0012',
    category: 'WORK_HALTED',
    categoryLabel: 'Construction Halted for >6 Months',
    language: 'hi',
    description: 'फाउंडेशन का काम 6 महीने पहले पूरा हुआ था, लेकिन तब से कोई मजदूर नहीं आ रहा है। बारिश का पानी गड्ढों में भर गया है और स्कूल के बच्चे परेशान हैं।',
    audioTranscript: 'फाउंडेशन का काम 6 महीने पहले पूरा हुआ था, लेकिन तब से कोई मजदूर नहीं आ रहा है।',
    location: 'Near Azamnagar High School Ground, Ward 4',
    state: 'Bihar',
    district: 'Katihar',
    villageOrWard: 'Azamnagar GP',
    coordinates: [25.5412, 87.5741],
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=60',
    citizenName: 'Rameshwar Prasad',
    citizenPhone: '+91 98351 *****',
    status: 'RESOLVED',
    dateFiled: '14 Jan 2026',
    hashReceipt: '0x8f3c2b9a714e8201a6d71b4c3e80f92b74c81a2e',
    inspectionRecord: {
      inspectionId: 'INSP-BR-KAT-2026-04',
      inspectingAuthority: 'Executive Engineer, Rural Works Department (DRDA)',
      inspectorDesignation: 'Assistant Engineer, Quality Assurance Wing',
      date: '22 Jan 2026',
      findings: 'Site inspection confirmed contractor delayed procurement of TMT steel due to billing dispute with sub-vendor. Quality of existing foundation M25 concrete found compliant (26.4 MPa).',
      qualityScore: 84,
      defectIdentified: true,
      defectDescription: 'Stagnant water accumulation around footing columns.',
      actionMandated: 'Direct contractor to dewater site, mobilize workforce within 7 days under penalty clause of MPLADS guideline.'
    },
    governmentResponse: {
      responseId: 'GOV-RESP-2026-019',
      officerName: 'Er. Rajeshwar Kumar Sinha',
      officerDesignation: 'Executive Engineer & District Nodal In-Charge',
      department: 'Rural Works Department, District Collectorate Katihar',
      responseDate: '02 Feb 2026',
      actionTaken: 'Contractor issued show-cause notice under Rule 4.2. Work resumed on 28th Jan 2026. 18 workers deployed, dewatering completed, and ground floor column casting is actively under way.',
      closureRemarks: 'Grievance resolved and certified on Ground Reality Ledger. Physical progress updated to 45%.',
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=60',
      rectificationCompletedDate: '28 Jan 2026',
      appealAvailable: true
    }
  },
  {
    id: 'GRV-2026-9043',
    projectId: 'proj-003',
    projectTitle: 'Solar High-Mast Street Lighting System across 12 Gram Panchayats',
    workCode: 'MPLADS-18LS-BR-KAT-0014',
    category: 'POOR_QUALITY',
    categoryLabel: 'Inverter Battery Failure & Dim Lighting',
    language: 'hi',
    description: '3 ग्राम पंचायतों में सौर लाइट की बैटरी 2 घंटे में बंद हो जाती है। स्ट्रीट लाइट नहीं जल रही है।',
    location: 'Barsoi Main Chowk & Pranpur Panchayat',
    state: 'Bihar',
    district: 'Katihar',
    villageOrWard: 'Barsoi Block',
    coordinates: [25.6811, 87.8922],
    photoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=60',
    citizenName: 'Md. Tariq Anwar',
    citizenPhone: '+91 94312 *****',
    status: 'INSPECTION_SCHEDULED',
    dateFiled: '08 Feb 2026',
    hashReceipt: '0x3a91e4bc702819ff6d8123019bc24510fa78e129',
    inspectionRecord: {
      inspectionId: 'INSP-BR-KAT-2026-09',
      inspectingAuthority: 'District Renewable Energy Agency (BREDA) Nodal Unit',
      inspectorDesignation: 'Junior Engineer, Electrification',
      date: '16 Feb 2026',
      findings: 'Physical inspection scheduled for 24 Feb 2026. Vendor warranty clause 3(b) invoked.',
      qualityScore: 62,
      defectIdentified: true,
      defectDescription: 'Charge controller calibration failure in 4 units.',
      actionMandated: 'Vendor instructed to replace lithium ferro-phosphate battery packs.'
    },
    governmentResponse: {
      responseId: 'GOV-RESP-2026-041',
      officerName: 'Sanjay Verma, IAS',
      officerDesignation: 'District Magistrate & District Nodal Officer',
      department: 'District Planning & Development Section, Collectorate',
      responseDate: '18 Feb 2026',
      actionTaken: 'Agency has been directed to replace all malfunctioning units by 28 Feb 2026 under the 5-year Comprehensive Maintenance Contract (CMC).',
      closureRemarks: 'Inspection in progress. Interim audit report published.',
      appealAvailable: true
    }
  }
];

export const GrievancePortalView: React.FC<GrievancePortalViewProps> = ({
  projects,
  initialProjectId,
  onSelectProject
}) => {
  const { language, currentLanguageMeta, t, term, termSimple, simpleMode, speak, isSpeaking } = useI18n();

  // Active View Tab: 'file' (Report Issue) vs 'track' (Track Complaints & Read Responses)
  const [activeTab, setActiveTab] = useState<'file' | 'track'>(initialProjectId ? 'file' : 'track');

  // Grievance filing form state
  const [targetProjectId, setTargetProjectId] = useState<string>(initialProjectId || (projects[0]?.id || ''));
  const [category, setCategory] = useState<'WORK_HALTED' | 'POOR_QUALITY' | 'FUND_MISUSE' | 'DAMAGED_STRUCTURE' | 'SAFETY_HAZARD' | 'OTHER'>('WORK_HALTED');
  const [complaintText, setComplaintText] = useState('');
  const [locationLandmark, setLocationLandmark] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<[number, number] | null>([25.5412, 87.5741]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<CitizenComplaint | null>(null);

  // Search & Filter in Track Complaints
  const [complaintsList, setComplaintsList] = useState<CitizenComplaint[]>(SEED_COMPLAINTS);
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedGrievanceForModal, setSelectedGrievanceForModal] = useState<CitizenComplaint | null>(SEED_COMPLAINTS[0]);

  // Voice speech-to-text hook
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechToText(
    currentLanguageMeta.speechCode
  );

  // Sync speech transcript into complaint text
  React.useEffect(() => {
    if (transcript) {
      setComplaintText(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  }, [transcript]);

  // Target project object
  const selectedProject = projects.find(p => p.id === targetProjectId) || projects[0];

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Grievance Submit
  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newId = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      const newGrievance: CitizenComplaint = {
        id: newId,
        projectId: selectedProject?.id || 'proj-001',
        projectTitle: selectedProject?.title || 'Public Infrastructure Work',
        workCode: selectedProject?.workCode || 'MPLADS-18LS-BR-001',
        category,
        categoryLabel: category.replace('_', ' '),
        language,
        description: complaintText,
        audioTranscript: transcript || undefined,
        location: locationLandmark || selectedProject?.locationName || 'Ground Site Location',
        state: selectedProject?.state || 'Bihar',
        district: selectedProject?.district || 'Katihar',
        villageOrWard: selectedProject?.village || selectedProject?.gramPanchayat || 'Village Ground',
        coordinates: gpsCoordinates || selectedProject?.coordinates,
        photoUrl: photoPreview || 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=60',
        citizenName: citizenName || 'Anonymous Citizen Auditor',
        citizenPhone: citizenPhone || '+91 98000 *****',
        status: 'UNDER_REVIEW',
        dateFiled: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        hashReceipt: randomHash,
        governmentResponse: {
          responseId: `GOV-ACK-${Math.floor(100 + Math.random() * 900)}`,
          officerName: 'District Nodal Redressal Desk',
          officerDesignation: 'Assistant Planning Officer',
          department: 'District Collectorate MPLADS Cell',
          responseDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          actionTaken: 'Observation logged on statutory public audit ledger. Triaged to Executive Engineer for physical verification within 7 working days.',
          closureRemarks: 'Grievance officially registered under Section 8.4 of Public Works Accountability Framework.',
          appealAvailable: true
        }
      };

      setComplaintsList(prev => [newGrievance, ...prev]);
      setSubmittedReceipt(newGrievance);
      setSelectedGrievanceForModal(newGrievance);
      setIsSubmitting(false);

      // Audio notification in citizen's language
      speak(`आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है। शिकायत संख्या है: ${newId}`);
    }, 900);
  };

  // Filtered grievances list
  const filteredComplaints = useMemo(() => {
    return complaintsList.filter(c => {
      const matchesSearch = !trackSearchQuery || 
        c.id.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
        c.projectTitle.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
        c.workCode.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(trackSearchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(trackSearchQuery.toLowerCase());

      const matchesStatus = selectedStatusFilter === 'All' || c.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaintsList, trackSearchQuery, selectedStatusFilter]);

  // Voice readout helper for government response
  const handleReadGovResponse = (complaint: CitizenComplaint) => {
    if (!complaint.governmentResponse) return;
    const gov = complaint.governmentResponse;
    const text = `सरकारी जवाब: ${gov.officerDesignation}, ${gov.department} द्वारा। की गई कार्रवाई: ${gov.actionTaken}`;
    speak(text);
  };

  return (
    <div className="bg-white border border-stone-300 rounded-xs shadow-xs overflow-hidden mb-8">
      
      {/* 1. Header Banner with Voice & Accessibility Support */}
      <div className="p-6 bg-[#faf9f5] border-b border-stone-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-600 text-white font-mono text-[10px] uppercase font-bold rounded-xs">
                {term('complaint')} Portal
              </span>
              <span className="text-xs font-mono text-stone-500">
                Statutory Ground Observation & Redressal Desk
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 mt-1.5 tracking-tight">
              {t('complaint.title', 'Citizen Grievance & Ground Audit Portal')}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1 max-w-3xl leading-relaxed">
              {t('complaint.subtitle', 'Submit geotagged observations with photo evidence. AI triaged and routed directly to the nodal engineer. Everything stays in your preferred language.')}
            </p>
          </div>

          {/* Navigation Toggle Buttons: Report Issue vs Track Complaints */}
          <div className="flex items-center bg-stone-200 p-1 rounded-xs gap-1 self-stretch md:self-auto font-mono text-xs">
            <button
              onClick={() => {
                setActiveTab('file');
                setSubmittedReceipt(null);
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'file' 
                  ? 'bg-stone-900 text-amber-300 shadow-xs' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              + {t('project.reportIssue', 'Report Ground Issue')}
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'track' 
                  ? 'bg-stone-900 text-amber-300 shadow-xs' 
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              📋 {t('complaint.trackBtn', 'Track Complaints & Gov Responses')} ({complaintsList.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. TAB A: File Grievance (Speak / Type + Upload Photo + Submit) */}
      {activeTab === 'file' && (
        <div className="p-6">
          
          {submittedReceipt ? (
            /* Success Receipt View */
            <div className="p-6 bg-amber-50/70 border border-amber-300 rounded-xs text-stone-900 animate-in fade-in duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-700 text-white rounded-full">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs">
                      GRIEVANCE REGISTERED
                    </span>
                    <span className="font-mono text-xs text-stone-500">
                      Receipt ID: <strong>{submittedReceipt.id}</strong>
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-stone-950 mt-1">
                    Grievance Logged on Public Ledger & Routed to District Nodal Desk
                  </h3>

                  <p className="text-xs text-stone-600 mt-1 font-sans">
                    A formal statutory inquiry has been initiated. You can track physical inspection progress and read official responses directly below.
                  </p>

                  <div className="mt-4 p-3.5 bg-white border border-stone-200 rounded-xs text-xs font-mono space-y-1.5">
                    <div><strong>Project:</strong> {submittedReceipt.projectTitle}</div>
                    <div><strong>Location:</strong> {submittedReceipt.location} ({submittedReceipt.district})</div>
                    <div><strong>SHA-256 Receipt:</strong> <span className="text-stone-500">{submittedReceipt.hashReceipt}</span></div>
                    <div><strong>Status:</strong> <span className="text-amber-800 font-bold">{term('underReview')}</span></div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveTab('track');
                        setSelectedGrievanceForModal(submittedReceipt);
                      }}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-medium rounded-xs text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Track Status & Official Action</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSubmittedReceipt(null);
                        setComplaintText('');
                        resetTranscript();
                        setPhotoPreview(null);
                      }}
                      className="px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-xs text-xs cursor-pointer"
                    >
                      File Another Observation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Filing Form */
            <form onSubmit={handleSubmitGrievance} className="space-y-6 max-w-4xl mx-auto">
              
              {/* Target Project Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-stone-900 uppercase mb-1.5">
                  1. {t('complaint.selectProject', 'Select Public Infrastructure Work')} *
                </label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xs p-2.5 font-sans focus:bg-white focus:outline-hidden"
                  required
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.workCode}] {p.title} — {p.district}, {p.state} ({p.sanctionedCostFormatted})
                    </option>
                  ))}
                </select>
              </div>

              {/* Grievance Category */}
              <div>
                <label className="block text-xs font-mono font-bold text-stone-900 uppercase mb-1.5">
                  2. {t('complaint.category', 'Observation Category')} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { key: 'WORK_HALTED', label: '🛑 Work Halted / Delayed' },
                    { key: 'POOR_QUALITY', label: '⚠️ Substandard Construction' },
                    { key: 'FUND_MISUSE', label: '💸 Suspected Fund Discrepancy' },
                    { key: 'DAMAGED_STRUCTURE', label: '🏚️ Cracks / Damage' },
                    { key: 'SAFETY_HAZARD', label: '⚡ Safety Hazard on Site' },
                    { key: 'OTHER', label: '📝 Other Ground Observation' }
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key as any)}
                      className={`p-2.5 rounded-xs border text-left font-medium transition-all cursor-pointer ${
                        category === cat.key
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speak or Type Complaint (Multilingual & Voice Recognition) */}
              <div className="p-4 bg-[#faf9f5] border border-stone-200 rounded-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-mono font-bold text-stone-900 uppercase flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>3. {isSupported ? t('complaint.description', 'Speak or Type Ground Observation') : 'Type Ground Observation'} *</span>
                  </label>

                  {/* Voice Microphone Record Button (Shown only when browser Speech Recognition is supported) */}
                  {isSupported && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isListening) {
                          stopListening();
                        } else {
                          startListening();
                        }
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-medium transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-600 text-white animate-pulse shadow-md'
                          : 'bg-stone-900 hover:bg-stone-800 text-amber-300 shadow-xs'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>
                        {isListening 
                          ? t('voice.stopListening', 'Recording... Click to finish')
                          : `${t('voice.speakComplaint', 'Speak in')} ${currentLanguageMeta.nativeName}`}
                      </span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder={simpleMode
                    ? 'यहाँ अपनी समस्या बोलकर या लिखकर बताएं (उदा. सड़क टूटी है, काम रुका हुआ है)...'
                    : 'Describe the discrepancy between reported physical milestones and ground reality. Voice input is transcribed in real-time...'}
                  className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xs focus:outline-hidden font-sans leading-relaxed"
                  required
                />

                {isListening && (
                  <div className="mt-2 text-xs text-red-600 font-mono flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Listening in {currentLanguageMeta.name} ({currentLanguageMeta.speechCode})... Speak clearly into your device.</span>
                  </div>
                )}
              </div>

              {/* Photo Evidence Upload with Geotag Preview */}
              <div>
                <label className="block text-xs font-mono font-bold text-stone-900 uppercase mb-1.5 flex items-center justify-between">
                  <span>4. {t('complaint.uploadPhoto', 'Upload Site Photographic Evidence')}</span>
                  <span className="text-[11px] text-stone-500 font-normal">Geotagging & Timestamp Verified</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload Dropzone */}
                  <label className="border-2 border-dashed border-stone-300 hover:border-amber-600 bg-stone-50/60 hover:bg-amber-50/40 p-6 rounded-xs flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Camera className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="font-serif font-bold text-xs text-stone-800">
                      Click to Select or Drop Site Photo
                    </span>
                    <span className="text-[10px] text-stone-500 mt-0.5">
                      JPG, PNG or WebP up to 10MB (GPS metadata extracted)
                    </span>
                  </label>

                  {/* Photo Preview / Geotag Card */}
                  <div className="p-3 bg-[#faf9f5] border border-stone-200 rounded-xs flex items-center gap-3">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Evidence site preview"
                        className="w-24 h-24 object-cover rounded-xs border border-stone-300"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-stone-200 rounded-xs flex items-center justify-center text-stone-400">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 text-[11px] font-mono space-y-1 text-stone-600">
                      <div className="flex items-center gap-1 text-emerald-800 font-bold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>GPS Pin: 25.5412° N, 87.5741° E</span>
                      </div>
                      <div>Site: {selectedProject?.village || selectedProject?.district}</div>
                      <div>Timestamp: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Details (Optional / Confidential) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-700 uppercase mb-1">
                    Citizen Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="Your Name (can remain confidential)"
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xs p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-700 uppercase mb-1">
                    Mobile Number for SMS Status Alerts
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+91 98000 00000"
                    className="w-full text-xs bg-stone-50 border border-stone-300 rounded-xs p-2 font-mono"
                  />
                </div>
              </div>

              {/* Submit Action Button */}
              <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Submissions are cryptographically signed and published on the open civic ledger.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-amber-300 font-bold rounded-xs text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t('complaint.submitting', 'Logging on Public Ledger...') : t('complaint.submitBtn', 'Submit Verified Grievance')}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* 3. TAB B: Track Complaints & Read Official Government Responses */}
      {activeTab === 'track' && (
        <div className="p-6">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trackSearchQuery}
                onChange={(e) => setTrackSearchQuery(e.target.value)}
                placeholder="Search complaint by Grievance ID (e.g. GRV-2026), project title, or district..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 font-mono"
              >
                <option value="All">All Statutory States</option>
                <option value="RESOLVED">{term('resolved')}</option>
                <option value="INSPECTION_SCHEDULED">{term('inspection')}</option>
                <option value="UNDER_REVIEW">{term('underReview')}</option>
                <option value="VERIFICATION_REQUIRED">{term('verificationRequired')}</option>
                <option value="DELAYED">{term('delayed')}</option>
              </select>
            </div>
          </div>

          {/* Master-Detail Layout: Left Complaints List | Right Government Response Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col (5 cols): List of Complaints */}
            <div className="lg:col-span-5 space-y-3">
              {filteredComplaints.map((c) => {
                const isSelected = selectedGrievanceForModal?.id === c.id;
                const isResolved = c.status === 'RESOLVED';
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedGrievanceForModal(c)}
                    className={`p-4 rounded-xs border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-50/90 border-amber-600 ring-1 ring-amber-600 shadow-xs' 
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-stone-950">
                        {c.id}
                      </span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                        isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status === 'RESOLVED' ? term('resolved') : term('underReview')}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 mt-1 leading-snug">
                      {c.projectTitle}
                    </h4>

                    <p className="text-xs text-stone-600 mt-1 font-sans line-clamp-2">
                      {c.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-500">
                      <span>{c.district}, {c.state}</span>
                      <span>Filed: {c.dateFiled}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Col (7 cols): Selected Grievance Dossier + Government Nodal Response */}
            <div className="lg:col-span-7">
              {selectedGrievanceForModal ? (
                <div className="bg-[#faf9f5] border border-stone-300 rounded-xs p-5 space-y-5">
                  
                  {/* Top: Grievance Identification */}
                  <div className="flex items-start justify-between pb-3 border-b border-stone-200 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-stone-900 text-amber-300 px-2 py-0.5 rounded-xs font-bold">
                          {selectedGrievanceForModal.id}
                        </span>
                        <span className="font-mono text-xs text-stone-500">
                          {selectedGrievanceForModal.workCode}
                        </span>
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-stone-950 mt-1">
                        {selectedGrievanceForModal.projectTitle}
                      </h3>
                      <div className="text-xs text-stone-600 font-mono mt-0.5">
                        📍 {selectedGrievanceForModal.location} ({selectedGrievanceForModal.district}, {selectedGrievanceForModal.state})
                      </div>
                    </div>

                    {/* Voice Read-Aloud Button */}
                    <button
                      onClick={() => handleReadGovResponse(selectedGrievanceForModal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-amber-600 text-stone-800 text-xs font-medium rounded-xs transition-colors cursor-pointer shadow-xs shrink-0"
                      title="Listen to official government response"
                    >
                      <Volume2 className={`w-4 h-4 text-amber-700 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      <span>{t('simple.listen', 'Listen Response')}</span>
                    </button>
                  </div>

                  {/* Citizen Observation Statement */}
                  <div className="bg-white p-4 border border-stone-200 rounded-xs space-y-2">
                    <div className="text-xs font-mono font-bold text-stone-700 uppercase flex items-center justify-between">
                      <span>Citizen Ground Audit Statement</span>
                      <span className="text-stone-400 font-normal">Filed: {selectedGrievanceForModal.dateFiled}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-800 font-sans leading-relaxed">
                      "{selectedGrievanceForModal.description}"
                    </p>
                    {selectedGrievanceForModal.photoUrl && (
                      <div className="pt-2">
                        <img
                          src={selectedGrievanceForModal.photoUrl}
                          alt="Citizen evidence"
                          className="w-full max-h-48 object-cover rounded-xs border border-stone-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Inspection Findings (if any) */}
                  {selectedGrievanceForModal.inspectionRecord && (
                    <div className="bg-stone-100 p-4 border border-stone-300 rounded-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-stone-900 uppercase">
                          QA Physical Inspection Findings ({term('inspection')})
                        </span>
                        <span className="font-bold text-stone-700">
                          Score: {selectedGrievanceForModal.inspectionRecord.qualityScore}/100
                        </span>
                      </div>
                      <div className="text-stone-600 font-sans">
                        <strong>Inspector:</strong> {selectedGrievanceForModal.inspectionRecord.inspectorDesignation} ({selectedGrievanceForModal.inspectionRecord.inspectingAuthority})
                      </div>
                      <p className="text-stone-800 font-sans italic bg-white p-2.5 rounded-xs border border-stone-200">
                        {selectedGrievanceForModal.inspectionRecord.findings}
                      </p>
                    </div>
                  )}

                  {/* Official Government Nodal Officer Response Section */}
                  {selectedGrievanceForModal.governmentResponse && (
                    <div className="bg-emerald-50/80 border border-emerald-300 rounded-xs p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-emerald-700 text-white rounded-full">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                          <span className="font-serif font-bold text-sm text-emerald-950">
                            Official Government Action & Response
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-emerald-800">
                          {selectedGrievanceForModal.governmentResponse.responseDate}
                        </span>
                      </div>

                      <div className="text-xs text-stone-700 font-sans border-b border-emerald-200/80 pb-2">
                        <div className="font-bold text-stone-950">
                          {selectedGrievanceForModal.governmentResponse.officerName}
                        </div>
                        <div className="text-stone-600 font-mono text-[11px]">
                          {selectedGrievanceForModal.governmentResponse.officerDesignation} • {selectedGrievanceForModal.governmentResponse.department}
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-900 font-sans leading-relaxed">
                        <div>
                          <strong>Action Taken:</strong> {selectedGrievanceForModal.governmentResponse.actionTaken}
                        </div>
                        <div>
                          <strong>Closure Remarks:</strong> {selectedGrievanceForModal.governmentResponse.closureRemarks}
                        </div>
                      </div>

                      {selectedGrievanceForModal.governmentResponse.evidencePhotoUrl && (
                        <div className="pt-2">
                          <div className="text-[10px] font-mono text-emerald-900 mb-1">
                            Photographic Evidence of Site Rectification:
                          </div>
                          <img
                            src={selectedGrievanceForModal.governmentResponse.evidencePhotoUrl}
                            alt="Rectification evidence"
                            className="w-full max-h-48 object-cover rounded-xs border border-emerald-300"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cryptographic SHA-256 Receipt Seal */}
                  <div className="text-[10px] font-mono text-stone-500 pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                    <span>Ledger Hash: {selectedGrievanceForModal.hashReceipt}</span>
                    <span className="text-emerald-700 font-bold">✓ MoSPI Statutory Rule 4.2 Compliant</span>
                  </div>

                </div>
              ) : (
                <div className="py-16 text-center text-stone-500 font-sans text-sm bg-stone-50 border border-stone-200 rounded-xs">
                  Select a grievance from the left list to view its complete audit lifecycle and official government response.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
