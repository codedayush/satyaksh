import { MP, StateStats, Constituency, Project } from '../types';

export interface OfficialMpladsWorkRecord {
  workCode: string;
  recommendedDate?: string;
  sanctionDate: string;
  completionDate?: string;
  workStatus: 'COMPLETED' | 'IN_PROGRESS' | 'SANCTIONED' | 'RECOMMENDED' | 'NON_PROGRESS';
  state: string;
  district: string;
  block?: string;
  gramPanchayat?: string;
  mpName: string;
  mpId: string;
  sector: string;
  workTitle: string;
  workDescription: string;
  estimatedCostCr: number;
  sanctionedCostCr: number;
  expenditureCr: number;
  unspentBalanceCr: number;
  implementingAgency: string;
  contractorName?: string;
  fundReleaseTranche?: string;
  gpsCoordinates?: [number, number];
  ucSubmitted: boolean;
  statutoryAuditCleared: boolean;
}

export interface OfficialSyncReport {
  timestamp: string;
  sourceUrl: string;
  sourceAuthority: string;
  connectivity: 'LIVE_PORTAL_CONNECTED' | 'OFFICIAL_SNAPSHOT_INGESTED' | 'UNAVAILABLE';
  networkStatusMessage: string;
  recordsSynchronized: {
    workRegister: number;
    recommendedWorks: number;
    completedWorks: number;
    nonProgressWorks: number;
    expenditureReports: number;
    stateWiseData: number;
    mpWiseData: number;
    fundReleaseData: number;
    districtProfiles: number;
    total: number;
  };
  breakdownByStatus: {
    completed: number;
    inProgress: number;
    sanctioned: number;
    recommended: number;
    nonProgress: number;
  };
  totalSanctionedCr: number;
  totalExpenditureCr: number;
  totalUnspentCr: number;
  lastSuccessfulSync: string;
}

export interface OfficialDataSourceState {
  sourceName: string;
  sourcePublisher: string;
  officialPortalUrl: string;
  publicApiDocumented: boolean;
  apiInvestigationNotes: string;
  syncStatus: 'LIVE' | 'SYNCED' | 'UNAVAILABLE';
  lastSyncTimestamp: string | null;
  recordsCount: number;
  syncHistory: OfficialSyncReport[];
  lastError: string | null;
}
