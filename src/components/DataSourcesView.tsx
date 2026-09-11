import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Server,
  FileSpreadsheet,
  FileCheck,
  Building,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { OFFICIAL_DATA_SOURCES } from '../data/mpladsData';
import { OfficialDataSourceBanner } from './OfficialDataSourceBanner';
import { OfficialSyncReport } from '../types/officialDataSource';

export const DataSourcesView: React.FC = () => {
  const [sourceStatus, setSourceStatus] = useState<any>(null);
  const [lastSyncReport, setLastSyncReport] = useState<OfficialSyncReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const [statusRes, syncRes] = await Promise.all([
        fetch('/api/data-source/status').then(r => r.json()).catch(() => null),
        fetch('/api/data-source/last-sync').then(r => r.json()).catch(() => null)
      ]);
      if (statusRes?.success) {
        setSourceStatus(statusRes);
      }
      if (syncRes?.success && syncRes.report) {
        setLastSyncReport(syncRes.report);
      }
    } catch (err) {
      console.error('Failed to load official data source telemetry:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Dossier */}
      <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Data Provenance & Open Government Registry</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-stone-950 tracking-tight">
            Official Data Sources & Ingestion Architecture
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1 leading-relaxed">
            SATYAKSH is an open public integrity platform consuming official public data published by ministries and departments of the Government of India under NDSAP and RTI Act 2005. Zero synthetic records are represented as official figures.
          </p>
        </div>
      </div>

      {/* Prominent Official Data Source Status Banner */}
      <OfficialDataSourceBanner />

      {/* Technical Inspection & Public API Analysis Card */}
      <div className="bg-stone-900 text-stone-200 border border-stone-800 p-6 rounded-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
              Technical Source Audit: https://mplads.gov.in/
            </span>
          </div>
          <span className="px-2 py-0.5 bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-mono rounded-xs">
            NIC Gov Cloud Host: 164.100.213.140
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-stone-850 p-4 rounded-xs border border-stone-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Public API Existence Audit</span>
            <span className="text-rose-400 font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              NO Public Unauthenticated REST API
            </span>
            <p className="text-[11px] text-stone-400 mt-1">
              Portal does not expose public swagger/REST endpoints. Machine-readable data requires session tokens, ASP.NET ViewStates, or periodic open data dumps.
            </p>
          </div>

          <div className="bg-stone-850 p-4 rounded-xs border border-stone-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">SATYAKSH Ingestion Strategy</span>
            <span className="text-amber-300 font-mono font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Multi-Feed Official Ingestion Layer
            </span>
            <p className="text-[11px] text-stone-400 mt-1">
              Consumes normalized official MoSPI Work Registers, PFMS Single Nodal Accounts, and national open government data catalogs (data.gov.in).
            </p>
          </div>

          <div className="bg-stone-850 p-4 rounded-xs border border-stone-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Integrity Rule</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Synthetic Data As Official
            </span>
            <p className="text-[11px] text-stone-400 mt-1">
              If connection fails or is restricted, system explicitly flags "Official MPLADS data synchronization unavailable" and maintains audited government records.
            </p>
          </div>
        </div>

        {/* 10 Supported Ingestion Streams */}
        <div className="pt-2 border-t border-stone-800">
          <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold mb-2">
            10 Mandatory Official Ingestion Pipelines Active in SATYAKSH
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              '1. Work Register',
              '2. Recommended Works',
              '3. Completed Works',
              '4. Non Progress Works',
              '5. Status of Works',
              '6. Expenditure Reports',
              '7. State-wise Data',
              '8. MP-wise Data',
              '9. Fund Release Data',
              '10. State/District Profile Data'
            ].map(feed => (
              <div key={feed} className="px-2.5 py-1.5 bg-stone-800 text-stone-200 text-[11px] font-mono border border-stone-700/80 rounded-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{feed}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {OFFICIAL_DATA_SOURCES.map((source) => (
          <div 
            key={source.id}
            className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xs uppercase">
                    {source.status}
                  </span>
                  <h2 className="font-serif text-xl font-bold text-stone-950 mt-1.5">
                    {source.name}
                  </h2>
                </div>
                <a
                  href={source.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-stone-400 hover:text-stone-900 border border-stone-200 hover:border-stone-400 rounded-xs transition-colors"
                  title="Visit Official Government Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <p className="text-xs text-stone-700 font-sans leading-relaxed">
                {source.description}
              </p>

              <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xs space-y-2 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Publishing Ministry / Agency</span>
                  <span className="font-semibold text-stone-900">{source.publisher}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Dataset Covered</span>
                  <span className="text-stone-800">{source.dataset}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Geographic & Parliamentary Coverage</span>
                  <span className="text-stone-800">{source.coverage}</span>
                </div>
              </div>

              {/* Data Fields */}
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold mb-1.5">
                  Normalized Schema Fields
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {source.dataFields.map((field) => (
                    <span 
                      key={field}
                      className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-mono rounded-xs"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Ingestion Telemetry */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-stone-400" />
                <span>Sync: {source.frequency}</span>
              </span>
              <a
                href={source.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 hover:text-amber-900 font-semibold underline"
              >
                Official Portal ↗
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* Institutional Legal & Public Policy Notice */}
      <div className="bg-stone-900 text-stone-300 p-6 rounded-xs border border-stone-800 text-xs space-y-2">
        <div className="font-mono text-amber-400 text-xs font-bold uppercase tracking-wider">
          Statutory Attribution & Transparency Notice
        </div>
        <p className="leading-relaxed text-stone-400 font-sans">
          All records, fund allocations, work codes, district sanction authorizations, and financial progress figures displayed on <strong>SATYAKSH</strong> are curated from publicly available government documents published under the <em>National Data Sharing and Accessibility Policy (NDSAP)</em> and the <em>Right to Information Act, 2005</em>.
        </p>
      </div>

    </div>
  );
};
