import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Download, 
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { MP, StateStats, NationalAnalytics, SectorDistribution } from '../types';
import { exportMPsToCSV } from '../services/exportService';

interface DashboardViewProps {
  analytics: NationalAnalytics;
  mps: MP[];
  states: StateStats[];
  onSelectMP: (mpId: string) => void;
  onSelectState: (stateCode: string) => void;
  onNavigateToProjects: () => void;
  onNavigateToRealtimeDashboard?: () => void;
}

const SECTOR_COLORS = [
  '#b45309', // ochre / amber
  '#0284c7', // sky / ocean
  '#059669', // emerald
  '#7c3aed', // purple
  '#dc2626', // crimson
  '#475569', // slate
  '#d97706', // orange
  '#4f46e5'  // indigo
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  mps,
  states,
  onSelectMP,
  onSelectState,
  onNavigateToProjects,
  onNavigateToRealtimeDashboard
}) => {
  // Global Filters
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'utilization' | 'released' | 'spent' | 'works'>('utilization');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered MPs
  const filteredMPs = useMemo(() => {
    return mps.filter(mp => {
      if (selectedHouse !== 'all' && mp.house !== selectedHouse) return false;
      if (selectedState !== 'all' && mp.state.toLowerCase() !== selectedState.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = mp.name.toLowerCase().includes(q);
        const matchesConst = mp.constituency.toLowerCase().includes(q);
        const matchesParty = mp.party.toLowerCase().includes(q);
        if (!matchesName && !matchesConst && !matchesParty) return false;
      }
      return true;
    }).sort((a, b) => {
      let diff = 0;
      if (sortBy === 'utilization') diff = b.utilizationRate - a.utilizationRate;
      else if (sortBy === 'released') diff = b.fundsReleasedCr - a.fundsReleasedCr;
      else if (sortBy === 'spent') diff = b.expenditureCr - a.expenditureCr;
      else if (sortBy === 'works') diff = b.completedCount - a.completedCount;
      return sortOrder === 'asc' ? -diff : diff;
    });
  }, [mps, selectedHouse, selectedState, searchQuery, sortBy, sortOrder]);

  // Aggregate Metrics based on filter
  const currentReleasedCr = useMemo(() => {
    return Number(filteredMPs.reduce((acc, m) => acc + m.fundsReleasedCr, 0).toFixed(2));
  }, [filteredMPs]);

  const currentSpentCr = useMemo(() => {
    return Number(filteredMPs.reduce((acc, m) => acc + m.expenditureCr, 0).toFixed(2));
  }, [filteredMPs]);

  const currentUnspentCr = useMemo(() => {
    return Number((currentReleasedCr - currentSpentCr).toFixed(2));
  }, [currentReleasedCr, currentSpentCr]);

  const currentSanctionedCr = useMemo(() => {
    return Number(filteredMPs.reduce((acc, m) => acc + m.sanctionedCostCr, 0).toFixed(2));
  }, [filteredMPs]);

  const currentUtilization = currentReleasedCr > 0 ? Number(((currentSpentCr / currentReleasedCr) * 100).toFixed(1)) : 0;

  // Sector Data for Charts
  const sectorChartData = analytics.sectorBreakdown.map((s, idx) => ({
    name: s.sector,
    value: s.expenditureCr,
    works: s.worksCount,
    utilization: s.utilization,
    color: SECTOR_COLORS[idx % SECTOR_COLORS.length]
  }));

  return (
    <div className="space-y-8 pb-16">
      
      {/* REAL-TIME DASHBOARD DISCOVERY BANNER */}
      {onNavigateToRealtimeDashboard && (
        <div className="bg-stone-900 border border-stone-800 text-stone-100 p-4 sm:p-5 rounded-xs shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 sm:mt-0" />
            <div>
              <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                Project Monitoring & Analytics
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Explore project execution schedules, interactive geographic clusters, sector KPI analytics, and fund utilization tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRealtimeDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-stone-950 font-mono text-xs font-bold rounded-xs hover:bg-amber-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Open Project Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. GLOBAL FILTER BAR */}
      <section className="bg-white border border-stone-200 p-4 sm:p-5 rounded-xs shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-500" />
            <span className="font-mono text-xs uppercase tracking-wider text-stone-700 font-semibold">
              Filter Parameters:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 lg:max-w-4xl">
            {/* House Filter */}
            <div>
              <label className="block text-[10px] font-mono text-stone-500 uppercase">Parliamentary House</label>
              <select
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="all">All Houses (Lok Sabha + Rajya Sabha)</option>
                <option value="LOK_SABHA">Lok Sabha (Directly Elected)</option>
                <option value="RAJYA_SABHA">Rajya Sabha (States Council)</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-[10px] font-mono text-stone-500 uppercase">State / Union Territory</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="all">All India (36 States & UTs)</option>
                {states.map(s => (
                  <option key={s.stateCode} value={s.stateName}>{s.stateName}</option>
                ))}
              </select>
            </div>

            {/* Financial Year */}
            <div>
              <label className="block text-[10px] font-mono text-stone-500 uppercase">Financial Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="all">18th Lok Sabha Cumulative (2024-Present)</option>
                <option value="2024-25">FY 2024-25</option>
                <option value="2025-26">FY 2025-26</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[10px] font-mono text-stone-500 uppercase">Quick Search</label>
              <div className="relative mt-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="MP, Constituency..."
                  className="w-full pl-8 pr-2 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Reset & Export Actions */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            {(selectedHouse !== 'all' || selectedState !== 'all' || selectedYear !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedHouse('all');
                  setSelectedState('all');
                  setSelectedYear('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-900 font-mono underline"
              >
                Reset
              </button>
            )}
            <button
              onClick={() => exportMPsToCSV(filteredMPs)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-amber-300 hover:bg-stone-800 text-xs font-semibold rounded-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ({filteredMPs.length})</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. FOUR PRIMARY FINANCIAL METRIC CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Funds Released */}
        <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase font-semibold">
            <span>GoI Funds Disbursed</span>
            <span className="text-stone-400">MoSPI PFMS</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-black text-stone-900 tracking-tight">
            ₹{currentReleasedCr.toLocaleString('en-IN')} <span className="text-sm font-sans font-normal text-stone-500">Cr</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100 pt-2 font-sans">
            <span>Statutory Entitlement</span>
            <span className="font-mono font-semibold text-stone-800">
              ₹{(filteredMPs.length * 25).toLocaleString('en-IN')} Cr
            </span>
          </div>
        </div>

        {/* Card 2: Sanctioned Works */}
        <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase font-semibold">
            <span>District Sanctions (AS)</span>
            <span className="text-stone-400">Technical AS</span>
          </div>
          <div className="mt-2 font-serif text-3xl font-black text-stone-900 tracking-tight">
            ₹{currentSanctionedCr.toLocaleString('en-IN')} <span className="text-sm font-sans font-normal text-stone-500">Cr</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100 pt-2 font-sans">
            <span>Sanction Ratio</span>
            <span className="font-mono font-semibold text-stone-800">
              {currentReleasedCr > 0 ? ((currentSanctionedCr / currentReleasedCr) * 100).toFixed(1) : 0}% of Released
            </span>
          </div>
        </div>

        {/* Card 3: Certified Expenditure */}
        <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-800 uppercase font-semibold">
            <span>Certified Expenditure</span>
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-xs font-mono">
              {currentUtilization}% Utilized
            </span>
          </div>
          <div className="mt-2 font-serif text-3xl font-black text-emerald-900 tracking-tight">
            ₹{currentSpentCr.toLocaleString('en-IN')} <span className="text-sm font-sans font-normal text-stone-500">Cr</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100 pt-2 font-sans">
            <span>Completed Works</span>
            <span className="font-mono font-semibold text-emerald-800">
              {filteredMPs.reduce((sum, m) => sum + m.completedCount, 0).toLocaleString('en-IN')} Works
            </span>
          </div>
        </div>

        {/* Card 4: Unspent Balance with Districts */}
        <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-800 uppercase font-semibold">
            <span>Unspent District Balance</span>
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded-xs font-mono">
              Escrow
            </span>
          </div>
          <div className="mt-2 font-serif text-3xl font-black text-amber-900 tracking-tight">
            ₹{currentUnspentCr.toLocaleString('en-IN')} <span className="text-sm font-sans font-normal text-stone-500">Cr</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100 pt-2 font-sans">
            <span>Unspent Share</span>
            <span className="font-mono font-semibold text-amber-800">
              {currentReleasedCr > 0 ? ((currentUnspentCr / currentReleasedCr) * 100).toFixed(1) : 0}% of Release
            </span>
          </div>
        </div>

      </section>

      {/* 3. VISUAL ANALYTICS: SECTORAL DISTRIBUTION & ANNUAL TREND */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sectoral Breakdown Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Expenditure by Development Sector
              </h2>
              <p className="text-xs text-stone-500">
                Cumulative capital expenditure across official statutory categories
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-stone-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData} layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} unit=" Cr" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} Crore`, 'Expenditure']}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '2px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#0f172a" radius={[0, 2, 2, 0]}>
                  {sectorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-stone-100 text-[11px] font-sans">
            {sectorChartData.slice(0, 4).map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-stone-600 truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Year Utilization Trends */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-5 rounded-xs shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Annual Outlay vs Expenditure
                </h2>
                <p className="text-xs text-stone-500">
                  All-India fund release vs certified completion
                </p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.yearlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="releasedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" Cr" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '2px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="releasedCr" stroke="#0284c7" fillOpacity={1} fill="url(#releasedGrad)" name="Funds Released (Cr)" />
                  <Area type="monotone" dataKey="spentCr" stroke="#059669" fillOpacity={1} fill="url(#spentGrad)" name="Certified Spent (Cr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xs border border-stone-200 text-xs text-stone-600 font-sans mt-3">
            <span className="font-semibold text-stone-900">Statutory Notice:</span> MPLADS funds are non-lapsable. Unspent balances from prior fiscal cycles roll forward directly into the district single nodal escrow.
          </div>
        </div>

      </section>

      {/* 4. MASTER MEMBER OF PARLIAMENT (MP) PERFORMANCE LEDGER */}
      <section className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
        
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf9f5]">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-950 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-700" />
              <span>Members of Parliament Performance Ledger</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 font-sans">
              Individual MP accounts, statutory releases, district sanctions, certified expenditure, and unspent balances.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-stone-500">
              Showing <strong className="text-stone-900">{filteredMPs.length}</strong> MPs
            </span>
            <button
              onClick={onNavigateToProjects}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-800 uppercase tracking-wider font-mono"
            >
              <span>View All Works</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dense Financial Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 text-stone-600 font-mono text-[11px] border-b border-stone-300">
                <th className="py-3 px-4 font-semibold">Member of Parliament</th>
                <th className="py-3 px-3 font-semibold">House & State</th>
                <th className="py-3 px-3 font-semibold text-right">
                  <button 
                    onClick={() => {
                      if (sortBy === 'released') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('released'); setSortOrder('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-stone-900 cursor-pointer"
                  >
                    <span>Released (Cr)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold text-right">Sanctioned (Cr)</th>
                <th className="py-3 px-3 font-semibold text-right">
                  <button 
                    onClick={() => {
                      if (sortBy === 'spent') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('spent'); setSortOrder('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-stone-900 cursor-pointer"
                  >
                    <span>Spent (Cr)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold text-right">Unspent (Cr)</th>
                <th className="py-3 px-3 font-semibold text-right">
                  <button 
                    onClick={() => {
                      if (sortBy === 'utilization') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('utilization'); setSortOrder('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-stone-900 cursor-pointer text-amber-900"
                  >
                    <span>Utilization</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold text-center">Completed Works</th>
                <th className="py-3 px-4 font-semibold text-right">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans">
              {filteredMPs.map((mp) => (
                <tr 
                  key={mp.id}
                  onClick={() => onSelectMP(mp.id)}
                  className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                >
                  {/* MP Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-xs shrink-0">
                        {mp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-stone-950 text-sm group-hover:text-amber-900 transition-colors">
                          {mp.name}
                        </div>
                        <div className="text-[11px] text-stone-500 font-sans">
                          {mp.party} • {mp.constituency}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* House & State */}
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-stone-800">{mp.state}</div>
                    <div className="text-[10px] font-mono text-stone-500">
                      {mp.house === 'LOK_SABHA' ? 'Lok Sabha (LS)' : 'Rajya Sabha (RS)'}
                    </div>
                  </td>

                  {/* Funds Released */}
                  <td className="py-3.5 px-3 text-right font-mono font-medium text-stone-900">
                    ₹{mp.fundsReleasedCr.toFixed(2)}
                  </td>

                  {/* Sanctioned */}
                  <td className="py-3.5 px-3 text-right font-mono text-stone-700">
                    ₹{mp.sanctionedCostCr.toFixed(2)}
                  </td>

                  {/* Spent */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-900">
                    ₹{mp.expenditureCr.toFixed(2)}
                  </td>

                  {/* Unspent */}
                  <td className="py-3.5 px-3 text-right font-mono text-amber-800">
                    ₹{mp.unspentBalanceCr.toFixed(2)}
                  </td>

                  {/* Utilization Progress Bar */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-16 bg-stone-200 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-emerald-600 rounded-full" 
                          style={{ width: `${Math.min(mp.utilizationRate, 100)}%` }} 
                        />
                      </div>
                      <span className="font-mono font-bold text-stone-900">
                        {mp.utilizationRate}%
                      </span>
                    </div>
                  </td>

                  {/* Works Completed */}
                  <td className="py-3.5 px-3 text-center font-mono">
                    <span className="text-emerald-800 font-bold">{mp.completedCount}</span>
                    <span className="text-stone-400"> / {mp.projectsCount}</span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 group-hover:text-amber-900 font-mono">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMPs.length === 0 && (
          <div className="p-12 text-center text-stone-500">
            <p className="font-serif text-base font-bold text-stone-800">No official MP records matched your filter criteria.</p>
            <p className="text-xs text-stone-400 mt-1">Try resetting state or house filters to view the complete All-India ledger.</p>
          </div>
        )}

      </section>

    </div>
  );
};
