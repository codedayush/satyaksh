import React, { useState } from 'react';
import { 
  Map, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  ChevronRight, 
  MapPin, 
  PieChart as PieIcon,
  ShieldCheck
} from 'lucide-react';
import { StateStats, MP } from '../types';
import { exportStatesToCSV } from '../services/exportService';

interface StateIntelligenceViewProps {
  states: StateStats[];
  mps: MP[];
  onSelectMP: (mpId: string) => void;
}

export const StateIntelligenceView: React.FC<StateIntelligenceViewProps> = ({
  states,
  mps,
  onSelectMP
}) => {
  const [selectedStateCode, setSelectedStateCode] = useState<string>(states[0]?.stateCode || 'UP');

  const selectedState = states.find(s => s.stateCode === selectedStateCode) || states[0];
  const stateMPs = mps.filter(m => m.state.toLowerCase() === selectedState.stateName.toLowerCase());

  // Sort states by utilization for ranking
  const sortedStates = [...states].sort((a, b) => b.utilizationRate - a.utilizationRate);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-2">
              <Map className="w-3.5 h-3.5" />
              <span>Federal & State Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl font-black text-stone-950 tracking-tight">
              India by State & Territory
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1">
              Comparative state-level fund disbursals, district escrow balances, and sectoral development priorities across all 36 States and UTs.
            </p>
          </div>

          <button
            onClick={() => exportStatesToCSV(states)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold text-xs rounded-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export States Summary CSV</span>
          </button>
        </div>
      </div>

      {/* State Selector Buttons Grid */}
      <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs">
        <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-3">
          Select State to Inspect:
        </div>
        <div className="flex flex-wrap gap-2">
          {states.map((s) => {
            const isSelected = s.stateCode === selectedStateCode;
            return (
              <button
                key={s.stateCode}
                onClick={() => setSelectedStateCode(s.stateCode)}
                className={`px-3 py-2 text-xs font-semibold rounded-xs transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-stone-900 text-amber-400 border-stone-900 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <span>{s.stateName}</span>
                <span className={`ml-1.5 font-mono text-[10px] ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                  ({s.utilizationRate}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected State Intelligence Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: State Profile & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
            <div className="p-6 bg-[#faf9f5] border-b border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
                    State Dossier • Code: {selectedState.stateCode}
                  </span>
                  <h2 className="font-serif text-3xl font-black text-stone-950 mt-1">
                    {selectedState.stateName}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-black text-emerald-800">
                    {selectedState.utilizationRate}%
                  </div>
                  <div className="text-[10px] font-mono text-stone-500 uppercase">State Utilization</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-4 font-sans">
                <span><strong>Lok Sabha Seats:</strong> {selectedState.lokSabhaSeats}</span>
                <span>•</span>
                <span><strong>Rajya Sabha Seats:</strong> {selectedState.rajyaSabhaSeats}</span>
                <span>•</span>
                <span><strong>Total Parliamentary Delegation:</strong> {selectedState.totalMPs} MPs</span>
              </div>
            </div>

            {/* 4 Financial Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-stone-200 p-5 bg-white text-xs">
              <div className="p-2">
                <span className="text-stone-500 font-mono text-[10px] uppercase block">Total Entitled</span>
                <span className="font-serif text-xl font-bold text-stone-900 mt-1 block">₹{selectedState.fundsEntitledCr} Cr</span>
              </div>
              <div className="p-2">
                <span className="text-stone-500 font-mono text-[10px] uppercase block">Funds Released</span>
                <span className="font-serif text-xl font-bold text-sky-900 mt-1 block">₹{selectedState.fundsReleasedCr} Cr</span>
              </div>
              <div className="p-2">
                <span className="text-stone-500 font-mono text-[10px] uppercase block">Certified Spent</span>
                <span className="font-serif text-xl font-bold text-emerald-800 mt-1 block">₹{selectedState.expenditureCr} Cr</span>
              </div>
              <div className="p-2">
                <span className="text-amber-800 font-mono text-[10px] uppercase block font-semibold">Unspent Balance</span>
                <span className="font-serif text-xl font-bold text-amber-900 mt-1 block">₹{selectedState.unspentFundsCr} Cr</span>
              </div>
            </div>
          </div>

          {/* District Breakdown Table */}
          {selectedState.districts && selectedState.districts.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
              <div className="p-4 bg-stone-50 border-b border-stone-200 font-serif font-bold text-stone-900 text-sm">
                District Nodal Allocations & Progress ({selectedState.districts.length} Sample Districts)
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/60 text-stone-600 font-mono text-[11px] border-b border-stone-200">
                    <th className="py-2.5 px-4 font-semibold">District Name</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Works</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Released (Cr)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Spent (Cr)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Unspent (Cr)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-sans">
                  {selectedState.districts.map((d) => (
                    <tr key={d.name} className="hover:bg-stone-50">
                      <td className="py-3 px-4 font-medium text-stone-900">{d.name}</td>
                      <td className="py-3 px-3 text-right font-mono text-stone-700">{d.worksCount}</td>
                      <td className="py-3 px-3 text-right font-mono text-stone-900">₹{d.releasedCr.toFixed(1)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">₹{d.expenditureCr.toFixed(1)}</td>
                      <td className="py-3 px-3 text-right font-mono text-amber-800">₹{d.unspentCr.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">{d.utilizationRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Members of Parliament from this State */}
          <div className="bg-white border border-stone-200 rounded-xs shadow-xs p-5">
            <div className="font-serif font-bold text-stone-900 text-base mb-3">
              MPs from {selectedState.stateName}
            </div>
            <div className="space-y-2">
              {stateMPs.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMP(m.id)}
                  className="flex items-center justify-between p-3 bg-stone-50 hover:bg-amber-50/50 border border-stone-200 rounded-xs cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-stone-900 text-sm group-hover:text-amber-900">
                        {m.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {m.constituency} • {m.party}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-800 text-xs">{m.utilizationRate}%</span>
                    <div className="text-[10px] text-stone-500 font-mono">₹{m.expenditureCr.toFixed(2)} Cr spent</div>
                  </div>
                </div>
              ))}
              {stateMPs.length === 0 && (
                <p className="text-xs text-stone-500 italic py-2">
                  Full MP registry for this state is being synchronized via the MoSPI background ingestor.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Right: State Leaderboard & Sector Priorities */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Sectoral Priorities in this State */}
          <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
            <div className="font-serif font-bold text-stone-900 text-base mb-3 flex items-center justify-between border-b border-stone-200 pb-2">
              <span>Top Sectors in {selectedState.stateName}</span>
              <PieIcon className="w-4 h-4 text-stone-400" />
            </div>
            <div className="space-y-3 text-xs">
              {selectedState.topSectors.map((s, idx) => (
                <div key={s.sector} className="space-y-1">
                  <div className="flex items-center justify-between text-stone-800 font-medium">
                    <span className="truncate pr-2">{s.sector}</span>
                    <span className="font-mono font-bold shrink-0">₹{s.amountCr} Cr ({s.percentage}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-700 rounded-full" 
                      style={{ width: `${Math.min(s.percentage, 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All-India State Utilization Rankings */}
          <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
            <div className="font-serif font-bold text-stone-900 text-base mb-3 border-b border-stone-200 pb-2">
              All-India Utilization Leaderboard
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
              {sortedStates.map((st, idx) => (
                <div 
                  key={st.stateCode}
                  onClick={() => setSelectedStateCode(st.stateCode)}
                  className={`flex items-center justify-between p-2 rounded-xs cursor-pointer transition-colors ${
                    st.stateCode === selectedStateCode
                      ? 'bg-amber-100/70 border border-amber-300 font-semibold'
                      : 'hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-stone-400 text-[11px] w-4">{idx + 1}.</span>
                    <span className="text-stone-900">{st.stateName}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800">{st.utilizationRate}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
