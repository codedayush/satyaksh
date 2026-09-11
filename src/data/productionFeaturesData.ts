import { 
  EvidenceDocument, 
  FieldVerificationRequest, 
  OfficerNotification, 
  WatchlistItem, 
  SavedFilterItem, 
  DataSourceFreshness, 
  DataQualityAuditResult,
  MLModelStatus
} from '../types';

export const INITIAL_EVIDENCE_DOCS: EvidenceDocument[] = [
  {
    id: 'EVD-2026-0042',
    projectId: 'prj-mplads-kat-01',
    projectWorkCode: 'MPLADS/18LS/BR/KAT/2024/001',
    investigationId: 'INV-2026-001',
    fileName: 'Technical_Sanction_Order_TS_881_2024.pdf',
    fileType: 'SANCTION_ORDER',
    fileSizeFormatted: '1.8 MB',
    uploadedBy: 'Priyanka Sen, IAS',
    uploaderBadge: 'DM-NODAL-BR-04',
    uploadDate: '2024-07-20T11:30:00Z',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    url: 'https://mplads.gov.in/docs/TS_881_2024.pdf',
    documentIntelligence: {
      extractedTextSnippet: 'Sanctioned under MPLADS 2024-25: Construction of 2.4 km Concrete Road with Cross-Drainage Culvert at Kursela. Estimated amount Rs 28.50 Lakh.',
      ocrEngine: 'PaddleOCR v4',
      duplicateProbability: 92.4,
      matchedProjects: [
        {
          projectId: 'prj-mplads-kat-01-dup',
          workCode: 'MPLADS/18LS/BR/KAT/2025/088',
          title: 'Paving and Reinforced Concrete Road from Kursela Market to Batra Gram Settlement',
          similarityScore: 92
        }
      ],
      processingStatus: 'FLAGGED_DUPLICATE'
    },
    isIdenticalFoundInOtherProject: true,
    notes: 'Document schedule of rates matches work order 088/2025 almost verbatim.'
  },
  {
    id: 'EVD-2026-0043',
    projectId: 'prj-mplads-kat-01',
    projectWorkCode: 'MPLADS/18LS/BR/KAT/2024/001',
    investigationId: 'INV-2026-001',
    fileName: 'Field_Site_Geotagged_Photo_Plaque.jpg',
    fileType: 'WORK_PHOTO',
    fileSizeFormatted: '3.4 MB',
    uploadedBy: 'Anil Kumar Jha',
    uploaderBadge: 'OFF-BR-KAT-8891',
    uploadDate: '2025-02-16T14:35:00Z',
    sha256Hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80',
    photoMetadata: {
      captureDate: '2025-02-16 14:15:22',
      gpsCoordinates: [25.4312, 87.2415],
      cameraModel: 'Trimble Geo 7X Handheld',
      distanceFromSanctionMeters: 0.2
    },
    documentIntelligence: {
      extractedTextSnippet: 'MPLADS SCHEME 18TH LOK SABHA - SH. TARIQ ANWAR (MP) - COST RS 28.50 LAKH - COMPLETED 2025',
      ocrEngine: 'PaddleOCR v4',
      duplicateProbability: 12.0,
      matchedProjects: [],
      processingStatus: 'COMPLETED'
    },
    notes: 'Plaque clearly visible with sanctioned amount and official MP insignia.'
  },
  {
    id: 'EVD-2026-0044',
    projectId: 'prj-mplads-kat-01-dup',
    projectWorkCode: 'MPLADS/18LS/BR/KAT/2025/088',
    investigationId: 'INV-2026-001',
    fileName: 'Bill_Voucher_Advance_Claim_RA_01.pdf',
    fileType: 'BILL_VOUCHER',
    fileSizeFormatted: '2.1 MB',
    uploadedBy: 'Suman Sinha',
    uploaderBadge: 'OFF-BR-KAT-4421',
    uploadDate: '2026-08-30T16:10:00Z',
    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    url: 'https://mplads.gov.in/docs/Voucher_RA_01.pdf',
    documentIntelligence: {
      extractedTextSnippet: 'Running Account Bill No. 1 submitted by M/s Bharat Roadlines Infrastructure. Claim Rs 18.00 Lakh against Rs 22.00 Lakh sanctioned expenditure.',
      ocrEngine: 'PDF Text Extraction',
      duplicateProbability: 88.0,
      matchedProjects: [
        {
          projectId: 'prj-mplads-kat-01',
          workCode: 'MPLADS/18LS/BR/KAT/2024/001',
          title: 'Construction of 2.4 km Concrete Road with Cross-Drainage Culvert',
          similarityScore: 88
        }
      ],
      processingStatus: 'FLAGGED_DUPLICATE'
    },
    isIdenticalFoundInOtherProject: true,
    notes: 'Identical measurement book entries noted for sub-base gravel laying.'
  }
];

export const INITIAL_VERIFICATION_REQUESTS: FieldVerificationRequest[] = [
  {
    id: 'FVRQ-2026-012',
    projectId: 'prj-mplads-kat-01-dup',
    projectWorkCode: 'MPLADS/18LS/BR/KAT/2025/088',
    projectTitle: 'Paving and Reinforced Concrete Road from Kursela Market to Batra Gram Settlement',
    investigationId: 'INV-2026-001',
    requestedBy: 'Priyanka Sen, IAS (DM Katihar)',
    assignedOfficer: 'Vikramaditya Sharma (Forensic Auditor)',
    createdDate: '2026-08-31T09:00:00Z',
    dueDate: '2026-09-07T18:00:00Z',
    reason: 'Spatial proximity detection alert (28.3m from completed 2024 road). Require physical cross-sectional core verification.',
    requiredChecks: {
      checkProjectExists: true,
      checkLocationGps: true,
      checkPhysicalWork: true,
      checkPlaqueBoard: true,
      checkEstimatedMatchesActual: true,
      collectPhotographs: true,
      beneficiaryInterview: true,
      verifyBillsDocuments: true
    },
    status: 'IN_PROGRESS',
    result: 'DISCREPANCY_FOUND',
    discrepancyNotes: 'Physical work overlays the identical 2024 alignment. No separate culvert constructed.'
  },
  {
    id: 'FVRQ-2026-013',
    projectId: 'prj-mplads-pat-02',
    projectWorkCode: 'MPLADS/18LS/BR/PAT/2024/002',
    projectTitle: 'Solar Powered Deep Tube-well Community Water Tank System',
    investigationId: 'INV-2026-002',
    requestedBy: 'State Vigilance Cell',
    assignedOfficer: 'Anil Kumar Jha (Executive Engineer)',
    createdDate: '2026-08-25T10:00:00Z',
    dueDate: '2026-09-05T18:00:00Z',
    reason: 'Expenditure disbursed (Rs 25.0 Lakh, 100%) but physical progress recorded at only 35%. Verify pump commissioning.',
    requiredChecks: {
      checkProjectExists: true,
      checkLocationGps: true,
      checkPhysicalWork: true,
      checkPlaqueBoard: true,
      checkEstimatedMatchesActual: true,
      collectPhotographs: true,
      beneficiaryInterview: true,
      verifyBillsDocuments: true
    },
    status: 'PENDING'
  }
];

export const INITIAL_NOTIFICATIONS: OfficerNotification[] = [
  {
    id: 'NOTIF-01',
    type: 'CRITICAL_PROJECT',
    title: 'High Risk Work Flagged (82/100)',
    message: 'Work MPLADS/18LS/BR/KAT/2025/088 triggered Clause 7.1 proximity alert (28.3m) with 92% lexical similarity.',
    timestamp: '18 minutes ago',
    read: false,
    relatedProjectId: 'prj-mplads-kat-01-dup',
    relatedInvestigationId: 'INV-2026-001',
    severity: 'CRITICAL'
  },
  {
    id: 'NOTIF-02',
    type: 'INVESTIGATION_ASSIGNED',
    title: 'New Investigation Assigned: INV-2026-001',
    message: 'District Magistrate assigned you to lead the forensic inquiry on Kursela duplicate road works.',
    timestamp: '42 minutes ago',
    read: false,
    relatedProjectId: 'prj-mplads-kat-01-dup',
    relatedInvestigationId: 'INV-2026-001',
    severity: 'HIGH'
  },
  {
    id: 'NOTIF-03',
    type: 'VERIFICATION_REQUESTED',
    title: 'Field Verification Ordered',
    message: 'FVRQ-2026-012 initiated for Kursela Market settlement alignment. Due date: 07 Sept 2026.',
    timestamp: '2 hours ago',
    read: true,
    relatedProjectId: 'prj-mplads-kat-01-dup',
    relatedInvestigationId: 'INV-2026-001',
    severity: 'MEDIUM'
  },
  {
    id: 'NOTIF-04',
    type: 'DATA_SYNC_ISSUE',
    title: 'MoSPI National Sync Completed',
    message: 'All 7,850 parliamentary work records synchronized across 36 States & UTs. 0 fatal sync drops.',
    timestamp: '4 hours ago',
    read: true,
    severity: 'INFO'
  }
];

export const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    id: 'WCH-01',
    entityType: 'PROJECT',
    entityId: 'prj-mplads-kat-01-dup',
    name: 'Kursela Overlapping Road Works',
    subText: 'Katihar, Bihar • Work Code: MPLADS/18LS/BR/KAT/2025/088',
    addedAt: '2026-08-30',
    lastKnownRiskScore: 82,
    alertTriggerCondition: 'Notify on status change, evidence upload, or verification result'
  },
  {
    id: 'WCH-02',
    entityType: 'CONTRACTOR',
    entityId: 'Bharat Roadlines Infrastructure',
    name: 'M/s Bharat Roadlines Infrastructure',
    subText: 'Associated with 6 projects across Katihar and Purnia',
    addedAt: '2026-08-28',
    lastKnownRiskScore: 78,
    alertTriggerCondition: 'Notify if newly sanctioned project awarded in any district'
  },
  {
    id: 'WCH-03',
    entityType: 'MP',
    entityId: 'mp-tariq-anwar-kat',
    name: 'Tariq Anwar (Lok Sabha)',
    subText: 'Katihar, Bihar • INC • Total Sanctioned: ₹4.80 Cr',
    addedAt: '2026-08-15',
    lastKnownRiskScore: 48,
    alertTriggerCondition: 'Notify when utilization shifts > 10% or UC deficit flagged'
  }
];

export const INITIAL_SAVED_FILTERS: SavedFilterItem[] = [
  {
    id: 'FIL-01',
    title: 'Critical Bihar Projects (Score > 75)',
    criteria: {
      state: 'Bihar',
      riskCategory: 'CRITICAL',
      minSanctionedCostCr: 0.2
    },
    createdAt: '2026-08-20'
  },
  {
    id: 'FIL-02',
    title: 'Delayed Projects > 12 Months',
    criteria: {
      delayMonths: 12
    },
    createdAt: '2026-08-22'
  },
  {
    id: 'FIL-03',
    title: 'Contractors with >50% Flagged Projects',
    criteria: {
      hasFlaggedContractor: true
    },
    createdAt: '2026-08-25'
  }
];

export const DATA_SOURCES_FRESHNESS_REGISTRY: DataSourceFreshness[] = [
  {
    sourceId: 'SRC-MOSPI-LIVE',
    sourceName: 'Official MoSPI MPLADS Portal',
    publisher: 'Ministry of Statistics and Programme Implementation',
    dataset: 'MPLADS Master Expenditure & Physical Progress Ledger',
    officialUrl: 'https://mplads.gov.in/',
    coverage: 'All 543 Lok Sabha + 245 Rajya Sabha Constituencies (PAN-India)',
    lastSuccessfulSync: '18 minutes ago',
    lastAttemptedSync: '18 minutes ago',
    recordsFetched: 7850,
    recordsUpdated: 412,
    recordsFailed: 0,
    syncStatus: 'Healthy',
    dataFields: ['Work Code', 'MP Name', 'Sanction Date', 'Sanctioned Cost', 'Certified Expenditure', 'Physical Progress', 'GPS Coordinates'],
    licenseNotes: 'Open Government Data License (OGDL India) • Public Integrity Domain'
  },
  {
    sourceId: 'SRC-PFMS-CNA',
    sourceName: 'PFMS Single Nodal Escrow Feed',
    publisher: 'Public Financial Management System (CGA, Ministry of Finance)',
    dataset: 'Central Nodal Agency (CNA) Escrow Account Disbursals',
    officialUrl: 'https://pfms.nic.in/',
    coverage: 'State & District Nodal Escrow Accounts (SNA/CNA Framework)',
    lastSuccessfulSync: '45 minutes ago',
    lastAttemptedSync: '45 minutes ago',
    recordsFetched: 3200,
    recordsUpdated: 95,
    recordsFailed: 0,
    syncStatus: 'Healthy',
    dataFields: ['Transaction ID', 'Escrow Balance', 'Beneficiary Account Hash', 'Disbursal Amount', 'Treasury Clearance Date'],
    licenseNotes: 'Ministry of Finance Treasury Clearance Data Guidelines'
  },
  {
    sourceId: 'SRC-DATA-GOV-IN',
    sourceName: 'Data.gov.in Open Data Registry',
    publisher: 'National Informatics Centre (NIC)',
    dataset: 'Historical Parliament Scheme Sanctions (16th, 17th, 18th Lok Sabha)',
    officialUrl: 'https://data.gov.in/',
    coverage: '28 States & 8 Union Territories Historical Time-Series',
    lastSuccessfulSync: '1 day ago',
    lastAttemptedSync: '1 day ago',
    recordsFetched: 15400,
    recordsUpdated: 0,
    recordsFailed: 0,
    syncStatus: 'Healthy',
    dataFields: ['Financial Year', 'State Code', 'Constituency', 'Recommended Amount', 'Utilization Rate'],
    licenseNotes: 'National Data Sharing and Accessibility Policy (NDSAP)'
  },
  {
    sourceId: 'SRC-E-GRAM-SWARAJ',
    sourceName: 'e-GramSwaraj & Panchayat Works Portal',
    publisher: 'Ministry of Panchayati Raj',
    dataset: 'Gram Panchayat Asset Geo-Tagging & Spatial Verification',
    officialUrl: 'https://egramswaraj.gov.in/',
    coverage: '2.5 Lakh Gram Panchayats across India',
    lastSuccessfulSync: '3 hours ago',
    lastAttemptedSync: '3 hours ago',
    recordsFetched: 18200,
    recordsUpdated: 120,
    recordsFailed: 2,
    syncStatus: 'Healthy',
    dataFields: ['LGD Code', 'GP Name', 'Asset Type', 'Geo-Tag Lat/Long', 'mActionSoft Photo Hash'],
    licenseNotes: 'MoPR Rural Asset Accountability Standards'
  }
];

export const ML_MODEL_ACTIVE_STATUS: MLModelStatus = {
  modelVersion: 'SATYAKSH-HYBRID-v2.4.1',
  featureVersion: 'FEAT-V3-GEO-FIN-TIME',
  trainingDate: '2026-08-15T00:00:00Z',
  datasetSize: 74200,
  featureCount: 38,
  operatingMode: 'ACTIVE_ML_PIPELINE',
  confidenceScore: 96.8,
  anomaliesDetected: 14,
  avgInferenceLatencyMs: 42,
  lastComputedAt: '2026-09-01T08:00:00Z'
};
