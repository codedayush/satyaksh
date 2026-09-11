import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  MapPin, 
  Building,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { Project, StateStats } from '../types';
import { exportProjectsToCSV } from '../services/exportService';

interface ProjectListViewProps {
  projects: Project[];
  states: StateStats[];
  onSelectProject: (projectId: string) => void;
  onSelectMP: (mpId: string) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  states,
  onSelectProject,
  onSelectMP
}) => {
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'cost' | 'expenditure' | 'progress'>('cost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Unique sectors from dataset
  const allSectors = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => set.add(p.sector));
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (selectedState !== 'all' && p.state.toLowerCase() !== selectedState.toLowerCase()) return false;
      if (selectedSector !== 'all' && p.sector !== selectedSector) return false;
      if (selectedStatus !== 'all' && p.workStatus !== selectedStatus) return false;
      if (selectedYear !== 'all' && p.financialYear !== selectedYear) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCode = p.workCode.toLowerCase().includes(q);
        const matchMP = p.mpName.toLowerCase().includes(q);
        const matchConst = p.constituency.toLowerCase().includes(q);
        const matchDist = p.district.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchMP && !matchConst && !matchDist) return false;
      }
      return true;
    }).sort((a, b) => {
      let diff = 0;
      if (sortBy === 'cost') diff = b.sanctionedCost - a.sanctionedCost;
      else if (sortBy === 'expenditure') diff = b.expenditure - a.expenditure;
      else if (sortBy === 'progress') diff = b.physicalProgress - a.physicalProgress;
      return sortOrder === 'asc' ? -diff : diff;
    });
  }, [projects, selectedState, selectedSector, selectedStatus, selectedYear, searchQuery, sortBy, sortOrder]);

  const totalSanctionedLakh = useMemo(() => {
    return filteredProjects.reduce((acc, p) => acc + p.sanctionedCost, 0);
  }, [filteredProjects]);

  const totalSpentLakh = useMemo(() => {
    return filteredProjects.reduce((acc, p) => acc + p.expenditure, 0);
  }, [filteredProjects]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Dossier */}
      <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Project-Level Transparency Register</span>
            </div>
            <h1 className="font-serif text-3xl font-black text-stone-950 tracking-tight">
              Where the Money Went
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1">
              Search and audit every public work sanctioned under MPLADS with work codes, implementing agencies, and physical progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportProjectsToCSV(filteredProjects, { state: selectedState, sector: selectedSector })}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold text-xs rounded-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Filtered CSV ({filteredProjects.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Aggregation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 font-sans">Filtered Works Count:</span>
            <div className="font-serif font-black text-xl text-stone-900 mt-0.5">{filteredProjects.length} Works</div>
          </div>
          <div>
            <span className="text-stone-500 font-sans">Total Sanctioned:</span>
            <div className="font-serif font-black text-xl text-stone-900 mt-0.5">₹{(totalSanctionedLakh / 100).toFixed(2)} Cr</div>
          </div>
          <div>
            <span className="text-stone-500 font-sans">Certified Spent:</span>
            <div className="font-serif font-black text-xl text-emerald-800 mt-0.5">₹{(totalSpentLakh / 100).toFixed(2)} Cr</div>
          </div>
          <div>
            <span className="text-stone-500 font-sans">Avg Completion:</span>
            <div className="font-serif font-black text-xl text-stone-900 mt-0.5">
              {filteredProjects.length > 0 ? Math.round(filteredProjects.reduce((s, p) => s + p.physicalProgress, 0) / filteredProjects.length) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* State */}
          <div>
            <label className="block text-[10px] font-mono text-stone-500 uppercase font-semibold">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">All States</option>
              {states.map(s => (
                <option key={s.stateCode} value={s.stateName}>{s.stateName}</option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-[10px] font-mono text-stone-500 uppercase font-semibold">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">All Sectors</option>
              {allSectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-mono text-stone-500 uppercase font-semibold">Work Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLETED">Completed (100%)</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>
          </div>

          {/* Financial Year */}
          <div>
            <label className="block text-[10px] font-mono text-stone-500 uppercase font-semibold">Financial Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">All Years</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-mono text-stone-500 uppercase font-semibold">Search Title / Code</label>
            <div className="relative mt-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search works..."
                className="w-full pl-8 pr-2 py-1.5 bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/80 text-stone-600 font-mono text-[11px] border-b border-stone-300">
                <th className="py-3 px-4 font-semibold">Work Code & Project Title</th>
                <th className="py-3 px-3 font-semibold">Member of Parliament</th>
                <th className="py-3 px-3 font-semibold">Sector & Region</th>
                <th className="py-3 px-3 font-semibold text-right">
                  <button
                    onClick={() => {
                      if (sortBy === 'cost') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('cost'); setSortOrder('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-stone-900 cursor-pointer"
                  >
                    <span>Sanctioned</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold text-right">
                  <button
                    onClick={() => {
                      if (sortBy === 'expenditure') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('expenditure'); setSortOrder('desc'); }
                    }}
                    className="inline-flex items-center gap-1 hover:text-stone-900 cursor-pointer"
                  >
                    <span>Spent</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans">
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                >
                  {/* Title & Code */}
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-mono text-[10px] text-stone-400 font-semibold">{p.workCode}</div>
                    <div className="font-medium text-stone-950 text-xs mt-0.5 group-hover:text-amber-950 line-clamp-2">
                      {p.title}
                    </div>
                  </td>

                  {/* MP Details */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMP(p.mpId);
                      }}
                      className="font-medium text-stone-900 hover:text-amber-800 hover:underline cursor-pointer"
                    >
                      {p.mpName}
                    </div>
                    <div className="text-[11px] text-stone-500 font-sans">
                      {p.constituency} ({p.mpParty})
                    </div>
                  </td>

                  {/* Sector & Region */}
                  <td className="py-3.5 px-3">
                    <div className="font-medium text-stone-800">{p.sector}</div>
                    <div className="text-[11px] text-stone-500">
                      {p.district}, {p.state}
                    </div>
                  </td>

                  {/* Sanctioned */}
                  <td className="py-3.5 px-3 text-right font-mono font-medium text-stone-800 whitespace-nowrap">
                    {p.sanctionedCostFormatted}
                  </td>

                  {/* Spent */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-900 whitespace-nowrap">
                    {p.expenditureFormatted}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs ${
                      p.workStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {p.workStatus === 'COMPLETED' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-700" />
                      )}
                      <span>{p.workStatus} ({p.physicalProgress}%)</span>
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 group-hover:text-amber-900 font-mono">
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="p-12 text-center text-stone-500">
            <p className="font-serif text-base font-bold text-stone-800">No projects match the selected criteria.</p>
            <p className="text-xs text-stone-400 mt-1">Try broadening your sector or state filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};
