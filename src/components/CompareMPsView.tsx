import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Download,
  Building,
  User
} from 'lucide-react';
import { MP } from '../types';
import { exportMPsToCSV } from '../services/exportService';

interface CompareMPsViewProps {
  allMPs: MP[];
  onSelectMP: (mpId: string) => void;
}

export const CompareMPsView: React.FC<CompareMPsViewProps> = ({
  allMPs,
  onSelectMP
}) => {
  // Default with 2 representative MPs
  const [selectedMPIds, setSelectedMPIds] = useState<string[]>([
    allMPs[0]?.id || 'mp-tariq-anwar-kat',
    allMPs[1]?.id || 'mp-rahul-gandhi-rbl',
    allMPs[2]?.id || 'mp-shashi-tharoor-tvm'
  ]);

  const selectedMPs = selectedMPIds
    .map(id => allMPs.find(m => m.id === id))
    .filter((m): m is MP => m !== undefined);

  const addMP = (id: string) => {
    if (!selectedMPIds.includes(id) && selectedMPIds.length < 4) {
      setSelectedMPIds([...selectedMPIds, id]);
    }
  };

  const removeMP = (id: string) => {
    if (selectedMPIds.length > 2) {
      setSelectedMPIds(selectedMPIds.filter(i => i !== id));
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Dossier */}
      <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Comparative Performance Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl font-black text-stone-950 tracking-tight">
              Compare Members of Parliament
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1">
              Side-by-side empirical comparison of fund release, district sanction speed, certified expenditure, and sectoral allocation.
            </p>
          </div>

          <button
            onClick={() => exportMPsToCSV(selectedMPs)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold text-xs rounded-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Comparison CSV</span>
          </button>
        </div>

        {/* MP Selector Bar */}
        <div className="mt-5 pt-4 border-t border-stone-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase text-stone-500 font-semibold mr-2">
            Add MP to compare (max 4):
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addMP(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 text-stone-800 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          >
            <option value="" disabled>+ Choose Member of Parliament...</option>
            {allMPs.filter(m => !selectedMPIds.includes(m.id)).map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.constituency}, {m.state} - {m.party})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#faf9f5] border-b border-stone-200">
              <th className="py-4 px-5 font-mono text-[11px] uppercase tracking-wider text-stone-500 font-semibold w-56">
                Metric / Indicator
              </th>
              {selectedMPs.map((mp) => (
                <th key={mp.id} className="py-4 px-5 font-sans min-w-[220px]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-serif font-black text-stone-950 text-base">
                        {mp.name}
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium">
                        {mp.constituency} • {mp.party}
                      </div>
                    </div>
                    {selectedMPs.length > 2 && (
                      <button
                        onClick={() => removeMP(mp.id)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                        title="Remove MP"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-200 font-sans text-xs">
            
            {/* House & State */}
            <tr>
              <td className="py-3.5 px-5 font-mono text-stone-500 font-semibold bg-stone-50/50">
                House & State
              </td>
              {selectedMPs.map(m => (
                <td key={m.id} className="py-3.5 px-5 text-stone-900">
                  <span className="font-semibold">{m.state}</span>
                  <div className="text-[11px] text-stone-500">{m.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha'}</div>
                </td>
              ))}
            </tr>

            {/* Fund Utilization % */}
            <tr className="bg-amber-50/20">
              <td className="py-3.5 px-5 font-mono text-amber-900 font-bold bg-amber-50/40">
                Fund Utilization Rate
              </td>
              {selectedMPs.map(m => (
                <td key={m.id} className="py-3.5 px-5">
                  <div className="font-serif font-black text-2xl text-emerald-800">
                    {m.utilizationRate}%
                  </div>
                  <div className="w-32 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(m.utilizationRate, 100)}%` }} />
                  </div>
                </td>
              ))}
            </tr>

            {/* Funds Released */}
            <tr>
              <td className="py-3.5 px-5 font-mono text-stone-500 font-semibold bg-stone-50/50">
                GoI Funds Released
              </td>
              {selectedMPs.map(m => (
                <td key={m.id} className="py-3.5 px-5 font-mono font-bold text-stone-900 text-sm">
                  ₹{m.fundsReleasedCr.toFixed(2)} Cr
                </td>
              ))}
            </tr>

            {/* Certified Expenditure */}
            <tr>
              <td className="py-3.5 px-5 font-mono text-stone-500 font-semibold bg-stone-50/50">
                Certified Expenditure
              </td>
              {selectedMPs.map(m => (
                <td key={m.id} className="py-3.5 px-5 font-mono font-bold text-emerald-900 text-sm">
                  ₹{m.expenditureCr.toFixed(2)} Cr
                </td>
              ))}
            </tr>

            {/* Unspent Escrow Balance */}
            <tr>
              <td className="py-3.5 px-5 font-mono text-stone-500 font-semibold bg-stone-50/50">
                Unspent Escrow Balance
              </td>
              {selectedMPs.map(m => (
                <td key={m.id} className="py-3.5 px-5 font-mono font-bold text-amber-800 text-sm">
                  ₹{m.unspentBalanceCr.toFixed(2)} Cr
                </td>
              ))}
            </tr>

            {/* Works Completed vs Sanctioned */}
            <tr>
              <td className="py-3.5 px-5 font-mono text-stone-500 font-semibold bg-stone-50/50">
                Completed / Sanctioned Works
              </td>
              {selectedMPs.map(m => (
                <td key={m.id} className="py-3.5 px-5">
                  <div className="font-mono font-bold text-stone-900">
                    {m.completedCount} <span className="text-stone-400 font-normal">/ {m.sanctionedCount}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {Math.round((m.completedCount / m.sanctionedCount) * 100)}% completion rate
                  </div>
                </td>
              ))}
            </tr>

            {/* Top Priority Sector */}
            <tr>
              <td className="py-3.5 px-5 font-mono text-stone-500 font-semibold bg-stone-50/50">
                Top Priority Sector
              </td>
              {selectedMPs.map(m => {
                const top = m.sectorDistribution[0];
                return (
                  <td key={m.id} className="py-3.5 px-5">
                    <div className="font-semibold text-stone-900">{top?.sector || 'General'}</div>
                    <div className="text-[11px] font-mono text-stone-500">₹{top?.spentCr.toFixed(2)} Cr spent</div>
                  </td>
                );
              })}
            </tr>

            {/* Action Button */}
            <tr>
              <td className="py-3.5 px-5 font-mono text-stone-500 font-semibold bg-stone-50/50">
                Detailed Dossier
              </td>
              {selectedMPs.map(m => (
                <td key={m.id} className="py-3.5 px-5">
                  <button
                    onClick={() => onSelectMP(m.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-800 uppercase tracking-wider font-mono cursor-pointer"
                  >
                    <span>View Full Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
};
