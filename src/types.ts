export type HouseType = 'LOK_SABHA' | 'RAJYA_SABHA';

export type LokSabhaPeriod = 
  | '18th Lok Sabha (2024-2029)' 
  | '17th Lok Sabha (2019-2024)' 
  | '16th Lok Sabha (2014-2019)';

export type WorkStatus = 
  | 'COMPLETED' 
  | 'IN_PROGRESS' 
  | 'SANCTIONED' 
  | 'RECOMMENDED' 
  | 'UNDER_AUDIT';

export type SectorCategory = 
  | 'Drinking Water'
  | 'Education & Schools'
  | 'Health & Family Welfare'
  | 'Roads, Pathways & Bridges'
  | 'Sanitation & Drainage'
  | 'Rural Development'
  | 'Community Buildings & Halls'
  | 'Electricity & Solar Energy'
  | 'Irrigation & Flood Control'
  | 'Sports & Youth Welfare'
  | 'Other Public Works';

export interface SectorDistribution {
  sector: string;
  spentCr: number;
  count: number;
}

export interface MP {
  id: string;
  name: string;
  hindiName?: string;
  party: string;
  partyColor?: string;
  partySymbol?: string;
  house: HouseType;
  state: string;
  stateCode: string;
  constituency: string;
  constituencyType?: 'GEN' | 'SC' | 'ST';
  constituencyNo?: number;
  gender?: string;
  photoUrl?: string;
  tenure: string;
  lokSabhaPeriod: string;
  
  // Explicit Financial Entitlements & Ledgers (in ₹ Crores)
  entitlementCr: number; // e.g., ₹25.00 Cr for a 5-year term
  fundsReleasedCr: number; // GoI Funds Released to District
  fundsAvailableCr: number; // Released + Accrued Interest available with District
  recommendedCostCr: number; // Cost of all works recommended by MP
  sanctionedCostCr: number; // Cost of works approved by District Collector
  expenditureCr: number; // Actual expenditure certified & booked
  unspentBalanceCr: number; // Available minus Expenditure
  unsanctionedBalanceCr: number; // Released minus Sanctioned
  utilizationRate: number; // (Expenditure / Funds Released) * 100
  
  // Work Counts
  projectsCount: number;
  completedCount: number;
  inProgressCount: number;
  sanctionedCount: number;
  recommendedCount: number;
  pendingCount: number;

  // Sectoral Breakdown
  sectorDistribution: {
    sector: SectorCategory | string;
    count: number;
    sanctionedCr: number;
    spentCr: number;
  }[];

  // Financial Year Trends
  financialYearBreakdown: {
    year: string;
    entitlementCr: number;
    releasedCr: number;
    sanctionedCr: number;
    spentCr: number;
    worksRecommended: number;
    worksCompleted: number;
  }[];

  districtNodalOffice: string;
  nodalDistrictCollector?: string;
  lastUpdated: string;
  source: string;
  sourceUrl?: string;
}

export interface Constituency {
  id: string;
  name: string;
  state: string;
  stateCode: string;
  type: 'GEN' | 'SC' | 'ST';
  mpId: string;
  mpName: string;
  mpParty: string;
  district: string;
  fundsReleasedCr: number;
  expenditureCr: number;
  unspentBalanceCr: number;
  utilizationRate: number;
  totalWorks: number;
  completedWorks: number;
  inProgressWorks: number;
  topSectors: { sector: string; count: number; spentCr: number }[];
}

export interface StateStats {
  stateName: string;
  stateCode: string;
  lokSabhaSeats: number;
  rajyaSabhaSeats: number;
  totalMPs: number;
  fundsEntitledCr: number;
  fundsReleasedCr: number;
  expenditureCr: number;
  unspentFundsCr: number;
  unsanctionedFundsCr: number;
  utilizationRate: number;
  totalWorks: number;
  completedWorks: number;
  inProgressWorks: number;
  sanctionedWorks: number;
  recommendedWorks: number;
  topSectors: { sector: string; amountCr: number; percentage: number }[];
  districts: {
    name: string;
    worksCount: number;
    releasedCr: number;
    expenditureCr: number;
    unspentCr: number;
    utilizationRate: number;
  }[];
}

export interface Project {
  id: string;
  workCode: string; // e.g. "MPLADS-18LS-BR-KAT-0012"
  title: string;
  description?: string;
  mpId: string;
  mpName: string;
  mpParty: string;
  house: HouseType;
  constituency: string;
  state: string;
  district: string;
  block?: string;
  gramPanchayat?: string;
  village?: string;
  sector: SectorCategory | string;
  category?: string;
  
  // Clear financial metrics
  recommendedCost: number; // in ₹ Lakhs or Crores
  recommendedCostFormatted: string; // e.g. "₹18.50 Lakh"
  sanctionedCost: number;
  sanctionedCostFormatted: string;
  expenditure: number;
  expenditureFormatted: string;
  unspentBalance: number;
  unspentBalanceFormatted: string;
  
  workStatus: WorkStatus;
  physicalProgress: number; // 0 - 100%
  financialYear: string; // e.g. "2024-25"
  
  recommendationDate: string;
  sanctionDate: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  
  implementingAgency: string; // e.g., "District Rural Development Agency (DRDA)"
  executingAuthority: string;
  nodalDistrict: string;
  
  coordinates?: [number, number]; // [lat, lng]
  locationName: string;
  
  utilizationCertificateStatus: 'SUBMITTED' | 'PENDING' | 'VERIFIED';
  auditStatus: 'CLEARED' | 'OBSERVATION_NOTED' | 'PENDING';
  
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  
  // Project Lifecycle Steps
  stages: {
    stageNumber: number;
    stageName: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
    date?: string;
    authority?: string;
    amount?: string;
    notes?: string;
    documentNumber?: string;
  }[];

  // Associated Audit Documents
  documents?: {
    id: string;
    title: string;
    docType: 'MP Recommendation Letter' | 'Administrative Sanction (AS)' | 'Technical Sanction (TS)' | 'Work Order / LoA' | 'Utilization Certificate (UC)' | 'Completion Certificate' | 'Third-Party Inspection';
    date: string;
    authority: string;
    docNumber: string;
    size: string;
    verificationStatus: 'Officially Verified' | 'Data Unavailable';
  }[];
}

export interface TransparencySignal {
  id: string;
  signalNumber: string;
  title: string;
  severity: 'HIGH_REVIEW' | 'REVIEW_RECOMMENDED' | 'DATA_GAP' | 'HIGH_UNSPENT' | 'TIME_OVERRUN';
  category: 'UNSPENT_FUNDS' | 'LONG_RUNNING' | 'COST_EXPENDITURE_GAP' | 'LOW_UTILIZATION' | 'PENDING_UC' | 'SANCTION_DELAY';
  targetType: 'MP' | 'CONSTITUENCY' | 'PROJECT' | 'STATE';
  targetName: string;
  targetId: string;
  state: string;
  constituency?: string;
  
  signal: string;
  whyFlagged: string;
  relevantMetric: string;
  dataUsed: string;
  source: string;
  lastUpdated: string;
}

export interface NationalAnalytics {
  totalEntitlementCr: number;
  totalFundsReleasedCr: number;
  totalExpenditureCr: number;
  totalUnspentBalanceCr: number;
  totalUnsanctionedBalanceCr: number;
  nationalUtilizationRate: number;
  
  totalWorksRecommended: number;
  totalWorksSanctioned: number;
  totalWorksCompleted: number;
  totalWorksInProgress: number;
  totalWorksPending: number;
  
  totalMPsTracked: number;
  lokSabhaMPsCount: number;
  rajyaSabhaMPsCount: number;
  totalConstituenciesTracked: number;
  totalStatesTracked: number;
  
  sectorBreakdown: {
    sector: string;
    worksCount: number;
    sanctionedCr: number;
    expenditureCr: number;
    utilization: number;
  }[];
  
  stateLeaderboard: {
    stateName: string;
    stateCode: string;
    releasedCr: number;
    expenditureCr: number;
    utilizationRate: number;
    completedWorks: number;
    totalWorks: number;
  }[];

  yearlyTrends: {
    year: string;
    releasedCr: number;
    spentCr: number;
    worksCompleted: number;
  }[];
  
  lastSynchronized: string;
  dataSourceCitation: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  publisher: string;
  dataset: string;
  coverage: string;
  lastFetched: string;
  lastUpdated: string;
  dataFields: string[];
  officialUrl: string;
  frequency: string;
  format: string;
  apiAvailable: boolean;
  status: 'ONLINE' | 'ACTIVE_FEED' | 'OFFICIAL_STATIC_PORTAL';
  description: string;
}

export interface MoneyFlowStage {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  authority: string;
  amountCr: number;
  amountFormatted: string;
  percentageOfReleased: number;
  description: string;
  statutoryRule: string;
  keyMetrics: { label: string; value: string }[];
  auditChecks: string[];
}

export type ComplaintStatus = 
  | 'UNDER_REVIEW' 
  | 'INSPECTION_SCHEDULED' 
  | 'VERIFICATION_REQUIRED' 
  | 'RESOLVED' 
  | 'DELAYED';

export interface InspectionRecord {
  inspectionId: string;
  inspectingAuthority: string;
  inspectorDesignation: string;
  date: string;
  findings: string;
  qualityScore: number; // 0 - 100
  defectIdentified: boolean;
  defectDescription?: string;
  actionMandated: string;
}

export interface GovernmentResponse {
  responseId: string;
  officerName: string;
  officerDesignation: string;
  department: string;
  responseDate: string;
  actionTaken: string;
  closureRemarks: string;
  evidencePhotoUrl?: string;
  rectificationCompletedDate?: string;
  appealAvailable: boolean;
}

export interface CitizenComplaint {
  id: string; // e.g. "GRV-2026-8812"
  projectId: string;
  projectTitle: string;
  workCode: string;
  category: 'WORK_HALTED' | 'POOR_QUALITY' | 'FUND_MISUSE' | 'DAMAGED_STRUCTURE' | 'SAFETY_HAZARD' | 'OTHER';
  categoryLabel?: string;
  language: string;
  description: string;
  audioTranscript?: string;
  location: string;
  state: string;
  district: string;
  villageOrWard?: string;
  coordinates?: [number, number];
  photoUrl?: string;
  citizenName?: string;
  citizenPhone?: string;
  status: ComplaintStatus;
  dateFiled: string;
  hashReceipt: string;
  inspectionRecord?: InspectionRecord;
  governmentResponse?: GovernmentResponse;
}

export interface DigitalTwinLayer {
  id: string;
  name: string;
  category: 'FOUNDATION' | 'SUPERSTRUCTURE' | 'FINISHES' | 'UTILITIES_SOLAR' | 'SAFETY_AUDIT';
  progress: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  costLakhs: number;
  specs: string;
  inspected: boolean;
  defectFlag?: boolean;
}

// ==========================================
// SATYAKSH INTELLIGENCE & DEDUPLICATION TYPES
// ==========================================

export type DuplicateConfidence = 'CERTAIN' | 'HIGH' | 'SUSPECT' | 'COINCIDENTAL';

export interface SpatialDuplicatePair {
  id: string;
  projectAId: string;
  projectBId: string;
  projectA: Project;
  projectB: Project;
  distanceMeters: number; // Precise Haversine distance in meters
  similarityScore: number; // 0 - 100% lexical/structural similarity
  duplicateConfidence: DuplicateConfidence;
  reasons: string[];
  detectedAt: string;
  status: 'UNRESOLVED' | 'CONFIRMED_DUPLICATE' | 'LEGITIMATE_SEPARATE_PHASE' | 'UNDER_INVESTIGATION';
}

export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface HybridRiskBreakdown {
  mlAnomalyScore: number;       // 30% weight
  financialRiskScore: number;   // 20% weight
  timelineRiskScore: number;    // 15% weight
  contractorRiskScore: number;  // 15% weight
  geographicRiskScore: number;  // 10% weight
  documentRiskScore: number;    // 10% weight
  totalRiskScore: number;       // 0 - 100
  riskCategory: RiskCategory;
}

export interface RiskFactorEvidence {
  factor: string;
  category: 'ML_ANOMALY' | 'FINANCIAL' | 'TIMELINE' | 'CONTRACTOR' | 'GEOGRAPHIC' | 'DOCUMENT';
  points: number; // e.g. +25
  title: string;
  explanation: string;
  metric: string;
  evidence: string;
}

export interface ContractorNodeInfo {
  name: string;
  totalProjects: number;
  flaggedProjects: number;
  flaggedRatio: number;
  totalSanctionedCr: number;
  states: string[];
  districts: string[];
  relatedProjectIds: string[];
  associatedAgencies: string[];
  mpsConnected: string[];
}

export interface DuplicateProjectMatch {
  sourceProjectId: string;
  matchedProjectId: string;
  matchedProjectTitle: string;
  matchedProjectWorkCode: string;
  matchedProjectSanctionedCost: number;
  similarityScore: number; // e.g. 0.92 (92%)
  matchType: 'GEO_SPATIAL_50M' | 'NLP_SEMANTIC_TITLE_DESC' | 'DOCUMENT_HASH' | 'COMBINED';
  documentSimilarityScore?: number;
  spatialDistanceMeters?: number;
  confidence: DuplicateConfidence;
  details: string;
}

export type InvestigationStatus = 'New' | 'Investigating' | 'Resolved';
export type InvestigationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface InvestigationRemark {
  id: string;
  officerName: string;
  role: string;
  timestamp: string;
  text: string;
  actionTaken?: string;
}

export interface InvestigationCase {
  id: string; // e.g. "INV-2026-001"
  projectId: string;
  projectWorkCode: string;
  projectTitle: string;
  state: string;
  district: string;
  sanctionedCostCr: number;
  riskScore: number;
  riskCategory: RiskCategory;
  flagReasons: string[];
  priority: InvestigationPriority;
  status: InvestigationStatus;
  assignedOfficer?: string;
  assignedDepartment?: string;
  verificationRequested: boolean;
  remarks: InvestigationRemark[];
  createdAt: string;
  updatedAt: string;
  resolutionSummary?: string;
}

export interface RiskSignalItem {
  signalKey: string;
  name: string;
  category: 'SPATIAL' | 'FINANCIAL' | 'SCHEDULE' | 'CONTRACTOR' | 'AUDIT_DOC';
  scoreContribution: number; // Points added to risk score
  maxScore: number;
  status: 'FLAGGED' | 'WARNING' | 'CLEAR';
  explanation: string;
  metric: string;
  evidence: string;
}

export interface RiskAssessment {
  projectId: string;
  projectWorkCode: string;
  projectTitle: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskCategory: RiskCategory;
  confidence: 'HIGH' | 'MEDIUM' | 'MODERATE';
  spatialDuplicateDetected: boolean;
  nearestNeighborDistanceMeters?: number;
  nearestNeighborProjectId?: string;
  hybridBreakdown?: HybridRiskBreakdown;
  factors?: RiskFactorEvidence[];
  duplicateMatches?: DuplicateProjectMatch[];
  contractorDetails?: ContractorNodeInfo;
  signals: RiskSignalItem[];
  detectionReasons: string[];
  supportingEvidence: { label: string; value: string }[];
  recommendedAction: string;
  evaluatedAt: string;
  evaluationHash: string;
}

export type FieldVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEEDS_INVESTIGATION';

export interface FieldVerificationRecord {
  id: string; // e.g. "FVR-2026-0914"
  projectId: string;
  projectWorkCode: string;
  projectTitle?: string;
  officerName: string;
  officerDesignation: string;
  officerBadgeId: string;
  deviceCoordinates?: [number, number];
  sanctionedCoordinates?: [number, number];
  gpsDistanceDiscrepancyMeters?: number;
  gpsAccuracyMeters?: number;
  photoUrl?: string;
  photoTimestamp?: string;
  evidenceDescription?: string;
  structurePresent: 'YES' | 'NO' | 'PARTIAL';
  plaqueInstalled: boolean;
  qualityRating: number; // 1 - 5
  verificationNotes: string;
  status: FieldVerificationStatus;
  submittedAt: string;
  signatureHash: string;
}

export type AuditTrailAction = 
  | 'PROJECT_INGESTED'
  | 'SPATIAL_DUPLICATE_DETECTED'
  | 'RISK_SCORE_EVALUATED'
  | 'FIELD_VERIFICATION_SUBMITTED'
  | 'INVESTIGATION_STATUS_CHANGED'
  | 'EVIDENCE_ATTACHED'
  | 'DISBURSAL_HELD'
  | 'DISBURSAL_CLEARED';

export interface AuditTrailEntry {
  id: string;
  index: number;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: AuditTrailAction;
  entityType: 'PROJECT' | 'VERIFICATION' | 'CONTRACTOR' | 'INGESTION';
  entityId: string;
  previousState?: any;
  newState: any;
  summary: string;
  previousHash: string;
  recordHash: string; // Cryptographic SHA-256 hash
}

export interface IngestionSource {
  sourceId: string;
  sourceName: string;
  sourceType: 'MOU_MOSPI' | 'PFMS_FEED' | 'STATE_WORKS_PORTAL' | 'E_GRAM_SWARAJ' | 'FIELD_AUDIT_APP';
  status: 'HEALTHY' | 'SYNCING' | 'OFFLINE';
  recordsCount: number;
  lastSyncTimestamp: string;
  rawFormat: string;
  description: string;
}

export interface IngestionPayload {
  source: string;
  rawRecord: any;
  normalizedProject: Partial<Project>;
  contractorName?: string;
  gpsCoordinates?: [number, number];
  ingestedAt: string;
  status: 'SUCCESS' | 'VALIDATION_ERROR';
}

// ==========================================
// 1. OFFICER AUTHENTICATION & ROLE-BASED ACCESS
// ==========================================
export type OfficerRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN_OFFICER' 
  | 'INVESTIGATION_OFFICER' 
  | 'ANALYST' 
  | 'VIEWER';

export interface OfficerUser {
  id: string;
  badgeId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  role: OfficerRole;
  jurisdiction: string; // e.g. "National / MoSPI", "Bihar - Katihar"
  assignedCasesCount?: number;
  avatarUrl?: string;
  lastLogin: string;
}

// ==========================================
// 2. EVIDENCE VAULT & DOCUMENT INTELLIGENCE
// ==========================================
export type EvidenceFileType = 
  | 'PDF' 
  | 'IMAGE' 
  | 'DOCUMENT' 
  | 'INSPECTION_REPORT' 
  | 'BILL_VOUCHER' 
  | 'SANCTION_ORDER' 
  | 'COMPLETION_CERTIFICATE' 
  | 'WORK_PHOTO';

export interface EvidenceDocument {
  id: string; // e.g. "EVD-2026-0042"
  projectId: string;
  projectWorkCode: string;
  investigationId?: string;
  fileName: string;
  fileType: EvidenceFileType;
  fileSizeFormatted: string;
  uploadedBy: string;
  uploaderBadge: string;
  uploadDate: string;
  sha256Hash: string;
  url?: string;
  photoMetadata?: {
    captureDate?: string;
    gpsCoordinates?: [number, number];
    cameraModel?: string;
    distanceFromSanctionMeters?: number;
  };
  documentIntelligence?: {
    extractedTextSnippet: string;
    ocrEngine: 'PaddleOCR v4' | 'PDF Text Extraction';
    duplicateProbability: number; // 0 - 100%
    matchedProjects: {
      projectId: string;
      workCode: string;
      title: string;
      similarityScore: number;
    }[];
    processingStatus: 'COMPLETED' | 'PROCESSING' | 'FLAGGED_DUPLICATE';
  };
  isIdenticalFoundInOtherProject?: boolean;
  notes?: string;
}

// ==========================================
// 3. FIELD VERIFICATION REQUESTS
// ==========================================
export interface FieldVerificationRequest {
  id: string; // "FVRQ-2026-012"
  projectId: string;
  projectWorkCode: string;
  projectTitle: string;
  investigationId?: string;
  requestedBy: string;
  assignedOfficer: string;
  createdDate: string;
  dueDate: string;
  reason: string;
  requiredChecks: {
    checkProjectExists: boolean;
    checkLocationGps: boolean;
    checkPhysicalWork: boolean;
    checkPlaqueBoard: boolean;
    checkEstimatedMatchesActual: boolean;
    collectPhotographs: boolean;
    beneficiaryInterview: boolean;
    verifyBillsDocuments: boolean;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  result?: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNABLE_TO_VERIFY' | 'DISCREPANCY_FOUND';
  discrepancyNotes?: string;
}

// ==========================================
// 4. NOTIFICATIONS & ALERTS
// ==========================================
export type NotificationType = 
  | 'CRITICAL_PROJECT' 
  | 'INVESTIGATION_ASSIGNED' 
  | 'INVESTIGATION_UPDATED' 
  | 'VERIFICATION_REQUESTED' 
  | 'DUPLICATE_DETECTED' 
  | 'OVERDUE_PROJECT' 
  | 'DATA_SYNC_ISSUE' 
  | 'RISK_THRESHOLD' 
  | 'EVIDENCE_UPLOADED';

export interface OfficerNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedProjectId?: string;
  relatedInvestigationId?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
}

// ==========================================
// 5. WATCHLIST & SAVED FILTERS
// ==========================================
export type WatchlistEntityType = 'PROJECT' | 'MP' | 'CONTRACTOR' | 'CONSTITUENCY' | 'STATE';

export interface WatchlistItem {
  id: string;
  entityType: WatchlistEntityType;
  entityId: string;
  name: string;
  subText: string;
  addedAt: string;
  lastKnownRiskScore?: number;
  alertTriggerCondition: string;
}

export interface SavedFilterItem {
  id: string;
  title: string;
  criteria: {
    state?: string;
    riskCategory?: string;
    minSanctionedCostCr?: number;
    delayMonths?: number;
    hasFlaggedContractor?: boolean;
    searchQuery?: string;
  };
  createdAt: string;
}

// ==========================================
// 6. DATA HEALTH & QUALITY ENGINE
// ==========================================
export type DataSyncHealth = 'Healthy' | 'Delayed' | 'Failed' | 'Stale';

export interface DataSourceFreshness {
  sourceId: string;
  sourceName: string;
  publisher: string;
  dataset: string;
  officialUrl: string;
  coverage: string;
  lastSuccessfulSync: string;
  lastAttemptedSync: string;
  recordsFetched: number;
  recordsUpdated: number;
  recordsFailed: number;
  syncStatus: DataSyncHealth;
  dataFields: string[];
  licenseNotes: string;
}

export interface DataQualityAuditResult {
  dataQualityScore: number; // e.g. 94%
  totalRecordsChecked: number;
  criticalErrorsCount: number;
  warningsCount: number;
  missingFieldsCount: number;
  duplicateRecordsCount: number;
  invalidRecordsCount: number;
  reconciliationAlertsCount: number;
  checks: {
    id: string;
    name: string;
    type: 'CRITICAL' | 'WARNING' | 'RECONCILIATION';
    status: 'PASS' | 'FAIL';
    failingCount: number;
    description: string;
    affectedProjectIds: string[];
    affectedExamples: { workCode: string; issue: string; source: string }[];
  }[];
}

// ==========================================
// 7. HISTORICAL RISK TRAJECTORY & HEALTH SCORE
// ==========================================
export interface RiskHistoryPoint {
  date: string; // e.g. "Jan 2026"
  score: number;
  riskCategory: RiskCategory;
  primaryReason: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  dataCompletenessPct: number;
}

export interface ProjectHealthMetrics {
  healthScore: number; // 0 - 100 (Higher is healthier, unlike risk where higher is worse)
  healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL_CONCERN';
  progressRating: number;
  timelineRating: number;
  utilizationRating: number;
  documentationRating: number;
  verificationRating: number;
  financialConsistencyRating: number;
}

// ==========================================
// 8. REGIONAL BENCHMARKING
// ==========================================
export interface RegionalBenchmarking {
  projectCostLakhs: number;
  districtMedianLakhs: number;
  stateMedianLakhs: number;
  nationalMedianLakhs: number;
  sectorMedianLakhs: number;
  costDeviationVsRegionalMedianPct: number;
  averageSectorCompletionMonths: number;
  projectEstimatedMonths: number;
  timelineDeviationPct: number;
  benchmarkingNote: string;
}

// ==========================================
// 9. ML MODEL MONITORING & REPRODUCIBILITY
// ==========================================
export interface MLModelStatus {
  modelVersion: string;
  featureVersion: string;
  trainingDate: string;
  datasetSize: number;
  featureCount: number;
  operatingMode: 'ACTIVE_ML_PIPELINE' | 'FALLBACK_HEURISTIC';
  confidenceScore: number;
  anomaliesDetected: number;
  avgInferenceLatencyMs: number;
  lastComputedAt: string;
}


