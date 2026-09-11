import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Search, 
  Filter, 
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { FieldVerificationRequest, Project } from '../types';
import { useOfficerAuth } from '../context/OfficerAuthContext';

interface FieldVerificationRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: FieldVerificationRequest[];
  projects: Project[];
  onCreateRequest: (req: Partial<FieldVerificationRequest>) => void;
  onSelectProject?: (projectId: string) => void;
}

export const FieldVerificationRequestsModal: React.FC<FieldVerificationRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  projects,
  onCreateRequest,
  onSelectProject
}) => {
  const { currentUser, hasPermission } = useOfficerAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [officerName, setOfficerName] = useState('Vikramaditya Sharma (Forensic Auditor)');
  const [dueDate, setDueDate] = useState('2026-09-10');
  const [reason, setReason] = useState('Clause 7.1 proximity alert & cost overrun check');
  const [checks, setChecks] = useState({
    checkProjectExists: true,
    checkLocationGps: true,
    checkPhysicalWork: true,
    checkPlaqueBoard: true,
    checkEstimatedMatchesActual: true,
    collectPhotographs: true,
    beneficiaryInterview: true,
    verifyBillsDocuments: true
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === selectedProjectId);
    onCreateRequest({
      projectId: selectedProjectId,
      projectWorkCode: proj?.workCode || 'MPLADS/2026/PROJ',
      projectTitle: proj?.title || 'Selected Project',
      requestedBy: `${currentUser.name} (${currentUser.designation})`,
      assignedOfficer: officerName,
      dueDate,
      reason,
      requiredChecks: checks
    });
    setShowForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white border border-stone-300 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-amber-400 text-stone-950 rounded-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg leading-tight">
                  Field Verification Orders & Task Dispatch
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 rounded-xs font-semibold">
                  {requests.length} Orders
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Issue statutory inspection tasks with specific checklist mandates to field vigilance engineers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!hasPermission('ASSIGN_INVESTIGATION')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-xs font-bold transition-colors cursor-pointer ${
                hasPermission('ASSIGN_INVESTIGATION')
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
              title={!hasPermission('ASSIGN_INVESTIGATION') ? 'Requires Admin Officer or Super Admin Role' : 'Issue New Verification Order'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showForm ? 'Cancel' : 'Issue Verification Order'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xs hover:bg-stone-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Issue Order Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-5 bg-stone-50 border-b border-stone-300 space-y-3 text-xs font-sans">
            <div className="text-xs font-bold text-stone-900 uppercase font-serif">
              New Inspection Mandate Assignment
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-xs text-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.workCode} • {p.title.slice(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Assigned Field Auditor</label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-xs text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-xs text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Audit Justification</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-xs text-xs"
                />
              </div>
            </div>

            {/* Checklist items */}
            <div>
              <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Mandatory Field Verification Checklist</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 border border-stone-200 rounded-xs">
                {Object.entries(checks).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-1.5 text-[11px] text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })}
                      className="rounded-xs text-stone-900"
                    />
                    <span>{key.replace('check', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 bg-stone-900 text-amber-300 font-bold rounded-xs hover:bg-stone-800 cursor-pointer"
              >
                Dispatch Verification Order
              </button>
            </div>
          </form>
        )}

        {/* Orders List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {requests.map((req) => (
            <div 
              key={req.id}
              className="p-4 bg-stone-50 border border-stone-200 rounded-xs flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-xs border ${
                      req.status === 'COMPLETED' 
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                        : req.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-stone-200 text-stone-800 border-stone-300'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{req.id}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-stone-950 mt-1">
                    {req.projectTitle}
                  </h4>
                  <div className="text-[11px] font-mono text-stone-600 mt-0.5">
                    Work Code: {req.projectWorkCode}
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-stone-500">
                  <span>Due: {req.dueDate.slice(0, 10)}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xs border border-stone-200 text-xs font-sans space-y-1">
                <div className="flex justify-between text-stone-600">
                  <span>Assigned Officer: <strong className="text-stone-900">{req.assignedOfficer}</strong></span>
                  <span>Issued By: <strong className="text-stone-800">{req.requestedBy}</strong></span>
                </div>
                <div className="text-stone-700">
                  <strong>Reason:</strong> {req.reason}
                </div>
                {req.result && (
                  <div className="mt-1 pt-1 border-t border-stone-200 text-stone-900">
                    <span className="text-[10px] font-mono uppercase text-rose-700 font-bold mr-1">Result:</span>
                    <strong>{req.result}</strong> — {req.discrepancyNotes}
                  </div>
                )}
              </div>

              {onSelectProject && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onSelectProject(req.projectId);
                      onClose();
                    }}
                    className="text-[11px] text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>View Target Work Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
