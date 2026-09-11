import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, MapPin, Building, FileText, ArrowRight } from 'lucide-react';
import { MP, Project, Constituency, StateStats } from '../types';
import { OFFICIAL_MPS_DATA, OFFICIAL_PROJECTS_DATA, OFFICIAL_CONSTITUENCIES_DATA, ALL_STATES_AND_UTS } from '../data/mpladsData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMP: (mpId: string) => void;
  onSelectProject: (projectId: string) => void;
  onSelectState: (stateCode: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectMP,
  onSelectProject,
  onSelectState
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingMPs = q 
    ? OFFICIAL_MPS_DATA.filter(m => 
        m.name.toLowerCase().includes(q) ||
        (m.hindiName && m.hindiName.includes(q)) ||
        m.constituency.toLowerCase().includes(q) ||
        m.party.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q)
      ).slice(0, 5)
    : OFFICIAL_MPS_DATA.slice(0, 4);

  const matchingConstituencies = q
    ? OFFICIAL_CONSTITUENCIES_DATA.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.mpName.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchingStates = q
    ? ALL_STATES_AND_UTS.filter(s =>
        s.stateName.toLowerCase().includes(q) ||
        s.stateCode.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchingProjects = q
    ? OFFICIAL_PROJECTS_DATA.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.workCode.toLowerCase().includes(q) ||
        p.mpName.toLowerCase().includes(q) ||
        p.constituency.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#fcfbf9] border border-stone-300 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Box */}
        <div className="relative flex items-center border-b border-stone-200 px-4 py-3 bg-white">
          <Search className="w-5 h-5 text-stone-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Member of Parliament, Constituency, State, or Work Code..."
            className="w-full bg-transparent text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose} 
            className="ml-2 text-xs font-mono px-2 py-1 bg-stone-100 text-stone-500 rounded-xs hover:bg-stone-200"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* Members of Parliament */}
          {matchingMPs.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Members of Parliament ({matchingMPs.length})</span>
              </div>
              <div className="space-y-1">
                {matchingMPs.map((mp) => (
                  <div
                    key={mp.id}
                    onClick={() => {
                      onSelectMP(mp.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-amber-50/60 border border-stone-200 hover:border-amber-300 rounded-xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-bold text-xs">
                        {mp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-stone-900 text-sm group-hover:text-amber-900">
                          {mp.name}
                        </div>
                        <div className="text-stone-500 text-[11px]">
                          {mp.constituency} • {mp.party} • {mp.state}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="font-mono font-bold text-emerald-700 text-xs">
                          {mp.utilizationRate}%
                        </div>
                        <div className="text-[10px] text-stone-400">Utilization</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constituencies */}
          {matchingConstituencies.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Constituencies</span>
              </div>
              <div className="space-y-1">
                {matchingConstituencies.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectMP(c.mpId);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xs cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-semibold text-stone-900">{c.name}</span>
                      <span className="text-stone-500 ml-2">({c.state})</span>
                      <div className="text-[11px] text-stone-500">MP: {c.mpName} ({c.mpParty})</div>
                    </div>
                    <div className="font-mono text-stone-700">₹{c.expenditureCr} Cr spent</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* States */}
          {matchingStates.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-stone-400" />
                <span>States & Union Territories</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingStates.map((s) => (
                  <div
                    key={s.stateCode}
                    onClick={() => {
                      onSelectState(s.stateCode);
                      onClose();
                    }}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xs cursor-pointer transition-all"
                  >
                    <div className="font-semibold text-stone-900">{s.stateName}</div>
                    <div className="text-[11px] text-stone-500 flex justify-between mt-1">
                      <span>{s.lokSabhaSeats} LS Seats</span>
                      <span className="font-mono text-emerald-700 font-semibold">{s.utilizationRate}% Utilized</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {matchingProjects.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Verified Works & Projects</span>
              </div>
              <div className="space-y-1">
                {matchingProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      onClose();
                    }}
                    className="p-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xs cursor-pointer transition-all"
                  >
                    <div className="font-medium text-stone-900 line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-stone-500 flex justify-between mt-1">
                      <span>{p.constituency} ({p.state}) • {p.sector}</span>
                      <span className="font-mono font-semibold text-stone-800">{p.sanctionedCostFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {q && matchingMPs.length === 0 && matchingConstituencies.length === 0 && matchingStates.length === 0 && matchingProjects.length === 0 && (
            <div className="py-8 text-center text-stone-500">
              <p className="text-sm font-medium">No official records matched "{query}"</p>
              <p className="text-xs text-stone-400 mt-1">Try searching by state name, constituency, or MP surname.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-mono">
          <span>Official MoSPI Normalized Index</span>
          <span>Press ESC to close</span>
        </div>

      </div>
    </div>
  );
};
