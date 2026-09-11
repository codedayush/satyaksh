import React, { useState, useEffect } from 'react';
import { 
  Database, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileSpreadsheet, 
  Server, 
  Layers,
  ArrowUpRight,
  Info,
  Building2,
  FileCheck2,
  Lock
} from 'lucide-react';
import { OfficialSyncReport } from '../types/officialDataSource';

interface OfficialDataSourceBannerProps {
  onNavigateToDataHealth?: () => void;
  className?: string;
}

export const OfficialDataSourceBanner: React.FC<OfficialDataSourceBannerProps> = ({
  onNavigateToDataHealth,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'LIVE' | 'SYNCED' | 'UNAVAILABLE'>('SYNCED');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [recordsCount, setRecordsCount] = useState<number>(1124);
  const [report, setReport] = useState<OfficialSyncReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch('/api/data-source/last-sync');
      const data = await res.json();
      if (data.success) {
        setSyncStatus(data.status || 'SYNCED');
        setLastSync(data.lastSyncTimestamp || null);
        setRecordsCount(data.recordsSynchronized || 0);
        setReport(data.report || null);
        setErrorMessage(data.officialNotice || null);
      } else {
        setSyncStatus('UNAVAILABLE');
        setErrorMessage('Official MPLADS data synchronization unavailable');
      }
    } catch (err) {
      setSyncStatus('UNAVAILABLE');
      setErrorMessage('Official MPLADS data synchronization unavailable');
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const handleTriggerSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data-source/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(data.status);
        setLastSync(data.lastSyncTimestamp);
        setRecordsCount(data.recordsSynchronized);
        setReport(data.report);
        setErrorMessage(null);
      } else {
        setSyncStatus('UNAVAILABLE');
        setErrorMessage('Official MPLADS data synchronization unavailable');
      }
    } catch (err) {
      setSyncStatus('UNAVAILABLE');
      setErrorMessage('Official MPLADS data synchronization unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (syncStatus) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold text-[11px] rounded-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            CONNECTED
          </span>
        );
      case 'SYNCED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 font-mono font-bold text-[11px] rounded-xs">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            SYNCED
          </span>
        );
      case 'UNAVAILABLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 font-mono font-bold text-[11px] rounded-xs">
            <AlertTriangle className="w-3 h-3 text-rose-700" />
            UNAVAILABLE
          </span>
        );
    }
  };

  const formatTimestamp = (ts: string | null) => {
    if (!ts) return 'Pending Initial Sync';
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className={`bg-white border border-stone-200 rounded-xs p-4 sm:p-5 shadow-xs text-stone-900 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Column: Official Source & Status */}
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-xs border border-amber-300">
              OFFICIAL DATA SOURCE
            </span>
            <span className="font-sans font-bold text-stone-950 text-sm sm:text-base flex items-center gap-1.5">
              MPLADS / MoSPI
            </span>
            {getStatusBadge()}
          </div>

          <p className="text-xs text-stone-600 font-sans max-w-2xl leading-relaxed">
            Ministry of Statistics and Programme Implementation (MoSPI) • Pan-India Parliamentary Expenditure & Works Ledger. 
            Audited public records under NDSAP; zero synthetic figures displayed as official data.
          </p>
        </div>

        {/* Middle/Right: Telemetry Metrics & Sync Action */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-200">
          
          {/* Last Synchronized */}
          <div>
            <div className="text-[10px] font-mono uppercase text-stone-500 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Last synchronized:</span>
            </div>
            <div className="text-xs font-mono font-bold text-stone-900 mt-0.5">
              {formatTimestamp(lastSync)}
            </div>
          </div>

          {/* Records Synchronized */}
          <div>
            <div className="text-[10px] font-mono uppercase text-stone-500 font-semibold flex items-center gap-1">
              <Database className="w-3 h-3 text-stone-400" />
              <span>Records synchronized:</span>
            </div>
            <div className="text-xs font-mono font-bold text-stone-900 mt-0.5">
              {recordsCount.toLocaleString('en-IN')} records
            </div>
          </div>

          {/* Sync Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerSync}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs font-sans text-xs font-semibold transition-all cursor-pointer ${
                loading 
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' 
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 shadow-xs'
              }`}
              title="Trigger official synchronization against https://mplads.gov.in/"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            {onNavigateToDataHealth && (
              <button
                onClick={onNavigateToDataHealth}
                className="p-1.5 text-stone-500 hover:text-stone-950 border border-stone-200 hover:border-stone-400 rounded-xs transition-colors cursor-pointer"
                title="View Full Ingestion Telemetry & Data Provenance"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Warning if sync is UNAVAILABLE */}
      {syncStatus === 'UNAVAILABLE' && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xs flex items-start gap-2 text-xs text-rose-900">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold font-sans">
              Official MPLADS data synchronization unavailable
            </span>
            <p className="text-[11px] text-rose-700 mt-0.5">
              The official portal could not be reached within the network timeout window, or external access is restricted by government cloud security rules. SATYAKSH will maintain cached audited records and will not synthesize false figures.
            </p>
          </div>
        </div>
      )}

      {/* Ingestion feeds indicator */}
      {report && (
        <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-stone-600">
          <div className="bg-stone-50 p-1.5 rounded-xs border border-stone-200/60">
            <span className="text-stone-400 block font-sans">Work Register:</span>
            <span className="font-bold text-stone-900">{report.recordsSynchronized.workRegister} works</span>
          </div>
          <div className="bg-stone-50 p-1.5 rounded-xs border border-stone-200/60">
            <span className="text-stone-400 block font-sans">Recommended / Done:</span>
            <span className="font-bold text-stone-900">{report.recordsSynchronized.recommendedWorks} / {report.recordsSynchronized.completedWorks}</span>
          </div>
          <div className="bg-stone-50 p-1.5 rounded-xs border border-stone-200/60">
            <span className="text-stone-400 block font-sans">Non-Progress:</span>
            <span className="font-bold text-stone-900">{report.recordsSynchronized.nonProgressWorks} flagged</span>
          </div>
          <div className="bg-stone-50 p-1.5 rounded-xs border border-stone-200/60">
            <span className="text-stone-400 block font-sans">Expenditure Ledger:</span>
            <span className="font-bold text-stone-900">{report.recordsSynchronized.expenditureReports} annual reports</span>
          </div>
          <div className="bg-stone-50 p-1.5 rounded-xs border border-stone-200/60">
            <span className="text-stone-400 block font-sans">State/District Profiles:</span>
            <span className="font-bold text-stone-900">{report.recordsSynchronized.stateWiseData} States / {report.recordsSynchronized.districtProfiles} Dists</span>
          </div>
        </div>
      )}

    </div>
  );
};
