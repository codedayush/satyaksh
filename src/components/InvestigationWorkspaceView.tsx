import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Filter, 
  Search, 
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Lock,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { 
  InvestigationCase, 
  InvestigationStatus, 
  InvestigationPriority,
  Project 
} from '../types';
import { useOfficerAuth } from '../context/OfficerAuthContext';

interface InvestigationWorkspaceViewProps {
  projects: Project[];
  onSelectProject?: (projectId: string) => void;
  onOpenEvidenceVault?: () => void;
  onOpenFieldVerification?: () => void;
}

export const InvestigationWorkspaceView: React.FC<InvestigationWorkspaceViewProps> = ({
  projects,
  onSelectProject,
  onOpenEvidenceVault,
  onOpenFieldVerification
}) => {
  const { currentUser, hasPermission } = useOfficerAuth();
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note addition state
  const [newNoteText, setNewNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // New Case Modal State
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseProjectId, setNewCaseProjectId] = useState(projects[0]?.id || '');
  const [newCasePriority, setNewCasePriority] = useState<InvestigationPriority>('HIGH');
  const [newCaseNotes, setNewCaseNotes] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/investigations');
      const data = await res.json();
      if (data.success && data.cases) {
        setCases(data.cases);
        if (data.cases.length > 0 && !selectedCase) {
          setSelectedCase(data.cases[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load investigation cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteText.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/investigations/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName: currentUser.name,
          remarkText: newNoteText.trim(),
          actionTaken: 'Case file reviewed and updated'
        })
      });

      const data = await res.json();
      if (data.success && data.case) {
        setNewNoteText('');
        await fetchCases();
        setSelectedCase(data.case);
      }
    } catch (err) {
      console.error('Failed to add remark:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleUpdateStatus = async (newStatus: InvestigationStatus) => {
    if (!selectedCase || !hasPermission('UPDATE_INVESTIGATION_STATUS')) return;

    try {
      const res = await fetch(`/api/investigations/${selectedCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          officerName: currentUser.name,
          remarkText: `Status transitioned to ${newStatus}`
        })
      });

      const data = await res.json();
      if (data.success && data.case) {
        await fetchCases();
        setSelectedCase(data.case);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseProjectId) return;

    try {
      const res = await fetch('/api/investigations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: newCaseProjectId,
          priority: newCasePriority,
          officerName: `${currentUser.name} (${currentUser.designation})`,
          notes: newCaseNotes.trim() || 'Opened formal inquiry on multi-signal alert.'
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowNewCaseModal(false);
        setNewCaseNotes('');
        await fetchCases();
        setSelectedCase(data.case);
      }
    } catch (err) {
      console.error('Failed to create case:', err);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesFilter = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesQuery = 
      c.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projectWorkCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.assignedOfficer && c.assignedOfficer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesQuery;
  });

  const getPriorityBadge = (priority: InvestigationPriority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-purple-900 text-purple-200 border-purple-700';
      case 'HIGH': return 'bg-rose-900 text-rose-200 border-rose-700';
      case 'MEDIUM': return 'bg-amber-900 text-amber-200 border-amber-700';
      case 'LOW':
      default: return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  const getStatusBadge = (status: InvestigationStatus) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Investigating': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'New':
      default: return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Dossier Header */}
      <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>MoSPI Vigilance & Statutory Case Management</span>
            </div>
            <h1 className="font-serif text-3xl font-black text-stone-950 tracking-tight">
              Investigation Workspace
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1 max-w-3xl leading-relaxed">
              Official statutory case management for suspected duplicate sanctions, ghost infrastructure, procurement deviations, and recovery proceedings under MPLADS operational guidelines.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenFieldVerification && (
              <button
                onClick={onOpenFieldVerification}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-stone-600" />
                <span>Field Tasks</span>
              </button>
            )}

            {onOpenEvidenceVault && (
              <button
                onClick={onOpenEvidenceVault}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xs transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span>Evidence Vault</span>
              </button>
            )}

            <button
              onClick={() => setShowNewCaseModal(true)}
              disabled={!hasPermission('CREATE_INVESTIGATION')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xs transition-colors shadow-xs cursor-pointer ${
                hasPermission('CREATE_INVESTIGATION')
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title={!hasPermission('CREATE_INVESTIGATION') ? 'Requires Investigation Officer or Super Admin Role' : 'Open Formal Case'}
            >
              <Plus className="w-4 h-4" />
              <span>Open New Investigation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Cases List & Selected Case Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filter & Case List */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search case, work code, officer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono uppercase">
              {['ALL', 'New', 'Investigating', 'Resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-xs border transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-stone-900 text-amber-300 border-stone-900 font-bold'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredCases.length === 0 ? (
              <div className="bg-white border border-stone-200 p-8 text-center rounded-xs text-stone-500">
                <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="font-medium text-stone-800 text-sm">No investigations match query</p>
                <p className="text-xs">Adjust search filters or initiate a new inquiry case.</p>
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs border ${getPriorityBadge(c.priority)}`}>
                          {c.priority}
                        </span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs border ${
                          isSelected ? 'bg-stone-800 text-stone-300 border-stone-700' : getStatusBadge(c.status)
                        }`}>
                          {c.status}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                          {c.id}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-sm mt-1.5 leading-snug line-clamp-2">
                      {c.projectTitle}
                    </h3>

                    <div className={`text-[11px] font-mono mt-1 ${isSelected ? 'text-amber-400' : 'text-stone-600'}`}>
                      Work: {c.projectWorkCode}
                    </div>

                    <div className={`text-[10px] font-sans mt-2 pt-2 border-t flex items-center justify-between ${
                      isSelected ? 'border-stone-800 text-stone-400' : 'border-stone-100 text-stone-500'
                    }`}>
                      <span>Officer: {c.assignedOfficer?.split('(')[0] || 'Unassigned'}</span>
                      <span>{c.updatedAt.slice(0, 10)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Case Deep-Dive Dossier */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden space-y-6">
              
              {/* Dossier Header */}
              <div className="p-6 bg-stone-900 text-white border-b border-stone-800">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs border ${getPriorityBadge(selectedCase.priority)}`}>
                        {selectedCase.priority} PRIORITY
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        Formal Case ID: {selectedCase.id}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl font-black mt-2 text-stone-100">
                      {selectedCase.projectTitle}
                    </h2>
                    <p className="text-xs font-mono text-amber-400 mt-1">
                      Target Work Code: {selectedCase.projectWorkCode} • {selectedCase.state}, {selectedCase.district}
                    </p>
                  </div>

                  {onSelectProject && (
                    <button
                      onClick={() => onSelectProject(selectedCase.projectId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-xs text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>Inspect Work Record</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Updater Bar */}
                <div className="mt-4 pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">Current Phase:</span>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs ${getStatusBadge(selectedCase.status)}`}>
                      {selectedCase.status}
                    </span>
                  </div>

                  {hasPermission('UPDATE_INVESTIGATION_STATUS') && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-stone-400 text-[10px] uppercase font-mono">Transition:</span>
                      <select
                        value={selectedCase.status}
                        onChange={(e) => handleUpdateStatus(e.target.value as InvestigationStatus)}
                        className="bg-stone-800 border border-stone-700 text-amber-300 text-xs px-2 py-1 rounded-xs"
                      >
                        <option value="New">New</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Case Body Content */}
              <div className="p-6 space-y-6 text-stone-900 font-sans">
                
                {/* Meta Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 border border-stone-200 rounded-xs text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Assigned Officer</span>
                    <span className="font-semibold text-stone-900">{selectedCase.assignedOfficer || 'General Vigilance'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Risk Score</span>
                    <span className="font-mono font-bold text-rose-700">{selectedCase.riskScore}/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Sanctioned Cost</span>
                    <span className="font-mono font-bold text-stone-900">₹{selectedCase.sanctionedCostCr} Cr</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">Logged Remarks</span>
                    <span className="font-mono font-bold text-stone-900">{selectedCase.remarks?.length || 0} Entries</span>
                  </div>
                </div>

                {/* Flag Reasons */}
                {selectedCase.flagReasons && selectedCase.flagReasons.length > 0 && (
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-950 mb-2">
                      Detection Triggers & Anomaly Signals
                    </h4>
                    <div className="space-y-1.5">
                      {selectedCase.flagReasons.map((reason, idx) => (
                        <div key={idx} className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-xs flex items-center gap-2 text-xs text-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chronological Case Timeline & Official Notes */}
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-950 mb-3">
                    Statutory Case Activity & Forensic Remarks
                  </h4>

                  <div className="space-y-3">
                    {selectedCase.remarks && selectedCase.remarks.map((entry) => (
                      <div key={entry.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                          <span className="font-bold text-stone-900">{entry.officerName} ({entry.role})</span>
                          <span>{entry.timestamp}</span>
                        </div>
                        <p className="text-stone-800 leading-relaxed font-sans pt-1">
                          {entry.text}
                        </p>
                        {entry.actionTaken && (
                          <div className="text-[10px] text-emerald-700 font-mono mt-1">
                            Action Taken: {entry.actionTaken}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddRemark} className="mt-4 space-y-2">
                    <textarea
                      rows={3}
                      placeholder={`Record official remark as ${currentUser.name} (${currentUser.designation})...`}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full p-3 bg-white border border-stone-300 rounded-xs text-xs font-sans focus:outline-none focus:border-stone-500"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-stone-400">
                        Officer Signature: {currentUser.badgeId} • Timestamp auto-logged
                      </span>
                      <button
                        type="submit"
                        disabled={submittingNote || !newNoteText.trim()}
                        className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold rounded-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{submittingNote ? 'Recording...' : 'Add Official Remark'}</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-stone-200 p-12 text-center rounded-xs text-stone-500">
              <ShieldAlert className="w-10 h-10 mx-auto text-stone-300 mb-3" />
              <h3 className="font-serif font-bold text-base text-stone-800">Select an Investigation Case</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Select any inquiry file on the left to review logged evidence, timeline entries, or transition case phases.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-stone-300 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-base">Open Formal Vigilance Inquiry</h3>
              </div>
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Target Project</label>
                <select
                  value={newCaseProjectId}
                  onChange={(e) => setNewCaseProjectId(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xs text-xs font-sans"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.workCode} • {p.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Priority Level</label>
                <select
                  value={newCasePriority}
                  onChange={(e) => setNewCasePriority(e.target.value as InvestigationPriority)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xs text-xs"
                >
                  <option value="CRITICAL">Critical (High Value / Double Billing)</option>
                  <option value="HIGH">High (Clause 7.1 Proximity Breach)</option>
                  <option value="MEDIUM">Medium (Milestone Lag / Incomplete UC)</option>
                  <option value="LOW">Low (Procedural Clarification)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Preliminary Summary of Findings</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize the anomaly signals that triggered this inquiry..."
                  value={newCaseNotes}
                  onChange={(e) => setNewCaseNotes(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xs text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xs cursor-pointer"
                >
                  Register Case
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
