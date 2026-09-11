import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Filter, 
  ArrowRight, 
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { TransparencySignal } from '../types';
import { OFFICIAL_TRANSPARENCY_SIGNALS } from '../data/mpladsData';

interface TransparencySignalsViewProps {
  onSelectProject?: (projectId: string) => void;
  onSelectMP?: (mpId: string) => void;
}

export const TransparencySignalsView: React.FC<TransparencySignalsViewProps> = ({
  onSelectProject,
  onSelectMP
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredSignals = OFFICIAL_TRANSPARENCY_SIGNALS.filter(sig => {
    if (selectedCategory !== 'all' && sig.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && sig.severity !== selectedSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Automated Audit Engine</span>
            </div>
            <h1 className="font-serif text-3xl font-black text-stone-950 tracking-tight">
              Transparency Signals
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1">
              Objective, data-driven observations highlighting timeline overruns, unspent escrow balances, and sanction lags based strictly on MoSPI operational benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-3 rounded-xs text-xs text-stone-600 max-w-sm font-sans">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Signals are neutral statistical flags generated from official portal filings, not accusations of wrongdoing.</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-mono uppercase text-stone-700 font-semibold">Signal Filter:</span>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">All Anomaly Categories</option>
            <option value="UNSPENT_FUNDS">Unspent Fund Balance</option>
            <option value="LONG_RUNNING">Long-Running Work (Over 18 Months)</option>
            <option value="SANCTION_DELAY">District Sanction Delay</option>
            <option value="PENDING_UC">Pending Utilization Certificates</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="all">All Severity Levels</option>
            <option value="HIGH_REVIEW">High Review Required</option>
            <option value="REVIEW_RECOMMENDED">Review Recommended</option>
            <option value="DATA_GAP">Data Reporting Gap</option>
          </select>
        </div>

        <span className="text-xs font-mono text-stone-500 ml-auto">
          Active Signals: <strong>{filteredSignals.length}</strong>
        </span>
      </div>

      {/* Signals Cards Grid */}
      <div className="space-y-4">
        {filteredSignals.map((sig) => (
          <div 
            key={sig.id}
            className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs hover:border-amber-400 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-900 text-stone-100 rounded-xs">
                    {sig.signalNumber}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs ${
                    sig.severity === 'HIGH_REVIEW'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : sig.severity === 'REVIEW_RECOMMENDED'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone-100 text-stone-800 border border-stone-300'
                  }`}>
                    {sig.severity.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    Target: <strong>{sig.targetName}</strong> ({sig.state})
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold text-stone-950">
                  {sig.title}
                </h2>

                <p className="text-sm text-stone-800 font-sans leading-relaxed">
                  {sig.signal}
                </p>

                <div className="bg-stone-50 border border-stone-200 p-3 rounded-xs text-xs space-y-1.5 font-sans mt-3">
                  <div className="text-stone-700">
                    <strong className="text-stone-900 font-mono">Why Flagged:</strong> {sig.whyFlagged}
                  </div>
                  <div className="text-stone-700">
                    <strong className="text-stone-900 font-mono">Empirical Metric:</strong> <span className="font-mono font-bold text-amber-900">{sig.relevantMetric}</span>
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    <strong className="text-stone-700 font-mono">Data Source:</strong> {sig.dataUsed} • {sig.source}
                  </div>
                </div>
              </div>

              {/* Action */}
              {sig.targetType === 'PROJECT' && onSelectProject && (
                <button
                  onClick={() => onSelectProject(sig.targetId)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold rounded-xs transition-colors shrink-0 self-start cursor-pointer"
                >
                  <span>Inspect Work</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
