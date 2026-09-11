import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Award, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ExternalLink, 
  PieChart as PieIcon,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MP, Project } from '../types';
import { exportProjectsToCSV } from '../services/exportService';

interface MPProfileViewProps {
  mp: MP;
  projects: Project[];
  onBack: () => void;
  onSelectProject: (projectId: string) => void;
}

const SECTOR_PALETTE = ['#b45309', '#0284c7', '#059669', '#7c3aed', '#dc2626', '#475569'];

export const MPProfileView: React.FC<MPProfileViewProps> = ({
  mp,
  projects,
  onBack,
  onSelectProject
}) => {
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProjects = projects.filter(p => {
    if (sectorFilter !== 'all' && p.sector !== sectorFilter) return false;
    if (statusFilter !== 'all' && p.workStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.workCode.toLowerCase().includes(q);
    }
    return true;
  });

  const pieData = mp.sectorDistribution.map((s, idx) => ({
    name: s.sector,
    value: s.spentCr,
    count: s.count,
    color: SECTOR_PALETTE[idx % SECTOR_PALETTE.length]
  }));

  return (
    <div className="space-y-8 pb-20">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All India Ledger</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportProjectsToCSV(projects, { mpName: mp.name, constituency: mp.constituency })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-amber-300 hover:bg-stone-800 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MP Works Ledger</span>
          </button>
        </div>
      </div>

      {/* MP Profile Header Dossier */}
      <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
        
        {/* Top Header Strip */}
        <div className="p-6 sm:p-8 bg-[#faf9f5] border-b border-stone-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-xs bg-stone-900 text-amber-400 flex items-center justify-center font-serif text-2xl font-black border border-stone-700 shrink-0">
                {mp.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-900 text-stone-100 rounded-xs uppercase">
                    {mp.house === 'LOK_SABHA' ? 'Lok Sabha (18th)' : 'Rajya Sabha'}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-stone-200 text-stone-800 rounded-xs">
                    {mp.party}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono text-stone-600 border border-stone-300 rounded-xs">
                    Tenure: {mp.tenure}
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-black text-stone-950 tracking-tight mt-2">
                  {mp.name}
                </h1>
                {mp.hindiName && (
                  <p className="font-serif text-base text-stone-500">{mp.hindiName}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-2 font-sans">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <strong>Constituency:</strong> {mp.constituency} {mp.constituencyType ? `(${mp.constituencyType})` : ''}
                  </span>
                  <span>•</span>
                  <span><strong>State:</strong> {mp.state}</span>
                  <span>•</span>
                  <span><strong>Nodal Office:</strong> {mp.nodalDistrictCollector}</span>
                </div>
              </div>
            </div>

            {/* Big Utilization Metric */}
            <div className="bg-white border border-stone-200 p-4 rounded-xs text-right min-w-[200px] shadow-xs">
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-semibold">
                MPLADS Fund Utilization
              </div>
              <div className="font-serif text-4xl font-black text-emerald-800 mt-1">
                {mp.utilizationRate}%
              </div>
              <div className="text-xs text-stone-500 font-sans mt-0.5">
                ₹{mp.expenditureCr.toFixed(2)} Cr spent / ₹{mp.fundsReleasedCr.toFixed(2)} Cr released
              </div>
            </div>

          </div>
        </div>

        {/* 4-Tier Financial Breakdown Ledger */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-stone-200 bg-white text-xs">
          
          {/* Statutory Entitlement */}
          <div className="p-4 sm:p-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
              1. Statutory Entitlement
            </span>
            <div className="font-serif text-2xl font-black text-stone-900 mt-1">
              ₹{mp.entitlementCr.toFixed(2)} <span className="text-xs font-sans text-stone-500 font-normal">Cr</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 font-sans">
              Statutory 5-year budget outlay (₹5 Cr / Year)
            </p>
          </div>

          {/* GoI Funds Released */}
          <div className="p-4 sm:p-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
              2. GoI Funds Released
            </span>
            <div className="font-serif text-2xl font-black text-sky-900 mt-1">
              ₹{mp.fundsReleasedCr.toFixed(2)} <span className="text-xs font-sans text-stone-500 font-normal">Cr</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 font-sans">
              Direct PFMS transfer to District Single Nodal Escrow
            </p>
          </div>

          {/* Sanctioned Works */}
          <div className="p-4 sm:p-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
              3. Works Sanctioned (AS)
            </span>
            <div className="font-serif text-2xl font-black text-stone-900 mt-1">
              ₹{mp.sanctionedCostCr.toFixed(2)} <span className="text-xs font-sans text-stone-500 font-normal">Cr</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1 font-sans">
              {mp.sanctionedCount} works formally approved by District Authority
            </p>
          </div>

          {/* Unspent District Balance */}
          <div className="p-4 sm:p-5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 block font-semibold">
              4. Unspent Escrow Balance
            </span>
            <div className="font-serif text-2xl font-black text-amber-900 mt-1">
              ₹{mp.unspentBalanceCr.toFixed(2)} <span className="text-xs font-sans text-stone-500 font-normal">Cr</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-sans">
              Available with District Collector for pending works
            </p>
          </div>

        </div>

      </div>

      {/* Sectoral Breakdown & Annual Fiscal Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sectoral Allocation Chart */}
        <div className="lg:col-span-6 bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Sectoral Expenditure Distribution
              </h2>
              <p className="text-xs text-stone-500">
                Priority breakdown of public capital recommended by this MP
              </p>
            </div>
            <PieIcon className="w-4 h-4 text-stone-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)} Cr`, 'Expenditure']}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', fontSize: '11px', borderRadius: '2px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-6 space-y-2 text-xs">
              {mp.sectorDistribution.map((sec, idx) => (
                <div key={sec.sector} className="flex items-center justify-between border-b border-stone-100 pb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: SECTOR_PALETTE[idx % SECTOR_PALETTE.length] }} />
                    <span className="text-stone-700 truncate">{sec.sector}</span>
                  </div>
                  <span className="font-mono font-semibold text-stone-900">₹{sec.spentCr.toFixed(2)} Cr</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fiscal Year Installments & Nodal Administration */}
        <div className="lg:col-span-6 bg-white border border-stone-200 p-5 rounded-xs shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Fiscal Year Releases & Progress
                </h2>
                <p className="text-xs text-stone-500">
                  Installment tracking per financial cycle
                </p>
              </div>
              <Building className="w-4 h-4 text-stone-400" />
            </div>

            <div className="space-y-3">
              {mp.financialYearBreakdown.map((fy) => (
                <div key={fy.year} className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs">
                  <div className="flex items-center justify-between font-semibold text-stone-900">
                    <span className="font-mono font-bold text-amber-900">FY {fy.year}</span>
                    <span className="font-mono text-emerald-800">
                      ₹{fy.spentCr.toFixed(2)} Cr spent of ₹{fy.releasedCr.toFixed(2)} Cr
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-stone-600 text-[11px]">
                    <span>Works Recommended: {fy.worksRecommended}</span>
                    <span className="font-mono font-semibold text-emerald-700">Completed: {fy.worksCompleted}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-600 font-sans flex items-center justify-between">
            <span className="font-mono text-[11px] text-stone-500">Nodal Office: {mp.districtNodalOffice}</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>MoSPI Verified</span>
            </span>
          </div>
        </div>

      </div>

      {/* Project-Level Transparency Ledger for this MP */}
      <section className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
        
        <div className="p-5 border-b border-stone-200 bg-[#faf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-950 flex items-center gap-2">
              <FileText className="w-5 h-5 text-stone-800" />
              <span>Public Works Register ({filteredProjects.length})</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Verified ground assets recommended by {mp.name}
            </p>
          </div>

          {/* Mini Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-stone-300 text-xs text-stone-800 rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed Only</option>
              <option value="IN_PROGRESS">In Progress Only</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search works..."
              className="px-3 py-1.5 bg-white border border-stone-300 text-xs text-stone-800 rounded-xs font-medium placeholder-stone-400 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Project Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 text-stone-600 font-mono text-[11px] border-b border-stone-300">
                <th className="py-3 px-4 font-semibold">Work Code & Title</th>
                <th className="py-3 px-3 font-semibold">Sector & Location</th>
                <th className="py-3 px-3 font-semibold text-right">Sanctioned</th>
                <th className="py-3 px-3 font-semibold text-right">Expenditure</th>
                <th className="py-3 px-3 font-semibold text-center">Status & Progress</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans">
              {filteredProjects.map((proj) => (
                <tr
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                >
                  {/* Title & Code */}
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-mono text-[10px] text-stone-400 font-semibold">
                      {proj.workCode}
                    </div>
                    <div className="font-medium text-stone-900 group-hover:text-amber-900 text-xs mt-0.5 line-clamp-2">
                      {proj.title}
                    </div>
                  </td>

                  {/* Sector & Village */}
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-stone-800">{proj.sector}</div>
                    <div className="text-[11px] text-stone-500">
                      {proj.village || proj.gramPanchayat || proj.block || proj.district}
                    </div>
                  </td>

                  {/* Sanctioned Cost */}
                  <td className="py-3.5 px-3 text-right font-mono font-medium text-stone-800">
                    {proj.sanctionedCostFormatted}
                  </td>

                  {/* Certified Expenditure */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-900">
                    {proj.expenditureFormatted}
                  </td>

                  {/* Progress & Badge */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs ${
                      proj.workStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {proj.workStatus === 'COMPLETED' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-700" />
                      )}
                      <span>{proj.workStatus} ({proj.physicalProgress}%)</span>
                    </span>
                  </td>

                  {/* Link */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 group-hover:text-amber-900 font-mono">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>

    </div>
  );
};
