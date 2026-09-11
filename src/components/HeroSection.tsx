import React from 'react';
import { ArrowRight, Sparkles, Download, ShieldCheck, Database, Scale } from 'lucide-react';
import { NationalAnalytics } from '../types';
import { exportMPsToCSV } from '../services/exportService';
import { OFFICIAL_MPS_DATA } from '../data/mpladsData';

interface HeroSectionProps {
  analytics: NationalAnalytics;
  onExploreData: () => void;
  onCompareMPs: () => void;
  onOpenAi: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  analytics,
  onExploreData,
  onCompareMPs,
  onOpenAi
}) => {
  return (
    <div className="relative border-b border-stone-200 bg-[#f7f5ef] overflow-hidden">
      {/* Editorial Decorative Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 relative z-10">
        
        {/* Top Badging */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 border border-stone-800 rounded-xs text-[11px] font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Official MPLADS Intelligence Platform</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-stone-700 border border-stone-300 rounded-xs text-[11px] font-mono">
            <Database className="w-3 h-3 text-stone-500" />
            <span>Direct MoSPI, PFMS & Data.gov.in Aggregation</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-950 leading-[1.08]">
              Follow Every Rupee.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-stone-700 max-w-3xl font-sans leading-relaxed">
              Track statutory allocations, district sanctions, certified vendor expenditures, and physical completion of public works recommended by every Member of Parliament across India.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreData}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 font-semibold text-xs tracking-wide uppercase transition-all rounded-xs shadow-xs cursor-pointer"
              >
                <span>Explore MPLADS Data</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onCompareMPs}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-xs tracking-wide uppercase transition-all rounded-xs shadow-xs cursor-pointer"
              >
                <Scale className="w-4 h-4 text-stone-600" />
                <span>Compare MPs</span>
              </button>

              <button
                onClick={onOpenAi}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300 font-semibold text-xs tracking-wide rounded-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Ask SATYAKSH AI</span>
              </button>

              <button
                onClick={() => exportMPsToCSV(OFFICIAL_MPS_DATA)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-stone-600 hover:text-stone-900 text-xs font-mono font-medium underline underline-offset-4 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Master CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Stat Ribbon Highlight */}
          <div className="lg:col-span-4 bg-white/90 border border-stone-300 p-5 rounded-xs shadow-xs backdrop-blur-xs">
            <div className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold mb-2">
              National Transparency Benchmark
            </div>
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="font-serif text-3xl font-black text-stone-900">
                  {analytics.nationalUtilizationRate}%
                </span>
                <span className="text-xs text-stone-500 ml-1.5 font-sans font-medium">Fund Utilization</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xs">
                ACTIVE 18th LS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
              <div>
                <div className="text-[11px] text-stone-500 font-sans">Funds Disbursed</div>
                <div className="font-mono font-bold text-stone-900 text-sm">
                  ₹{analytics.totalFundsReleasedCr.toLocaleString('en-IN')} Cr
                </div>
              </div>
              <div>
                <div className="text-[11px] text-stone-500 font-sans">Unspent Balance</div>
                <div className="font-mono font-bold text-amber-700 text-sm">
                  ₹{analytics.totalUnspentBalanceCr.toLocaleString('en-IN')} Cr
                </div>
              </div>
              <div>
                <div className="text-[11px] text-stone-500 font-sans">Completed Works</div>
                <div className="font-mono font-bold text-emerald-800 text-sm">
                  {analytics.totalWorksCompleted.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-stone-500 font-sans">MPs Tracked</div>
                <div className="font-mono font-bold text-stone-900 text-sm">
                  {analytics.totalMPsTracked} (LS + RS)
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
