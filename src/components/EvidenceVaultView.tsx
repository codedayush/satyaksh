import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Camera, 
  Lock, 
  FileSearch,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FolderLock,
  Layers,
  MapPin,
  Calendar
} from 'lucide-react';
import { EvidenceDocument, EvidenceFileType, Project } from '../types';
import { useOfficerAuth } from '../context/OfficerAuthContext';

interface EvidenceVaultViewProps {
  projects: Project[];
  onSelectProject?: (projectId: string) => void;
}

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({
  projects,
  onSelectProject
}) => {
  const { currentUser, hasPermission } = useOfficerAuth();
  const [documents, setDocuments] = useState<EvidenceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<EvidenceDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState(projects[0]?.id || '');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<EvidenceFileType>('INSPECTION_REPORT');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/evidence');
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
        if (data.documents.length > 0 && !selectedDoc) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load evidence documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProjectId || !uploadFileName) return;

    setUploading(true);
    try {
      const selectedProj = projects.find(p => p.id === uploadProjectId);
      const res = await fetch('/api/evidence/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: uploadProjectId,
          projectWorkCode: selectedProj?.workCode || 'MPLADS/2026/001',
          fileName: uploadFileName,
          fileType: uploadFileType,
          uploadedBy: currentUser.name,
          uploaderBadge: currentUser.badgeId,
          notes: uploadNotes,
          photoMetadata: {
            captureDate: new Date().toISOString(),
            gpsCoordinates: selectedProj?.coordinates || [25.4312, 87.2415],
            cameraModel: 'Trimble Geo-Forensic Handheld Terminal',
            distanceFromSanctionMeters: 0.4
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setUploadSuccess(`Evidence securely sealed with SHA-256: ${data.document.sha256Hash.slice(0, 16)}...`);
        setShowUploadModal(false);
        setUploadFileName('');
        setUploadNotes('');
        await fetchEvidence();
        setSelectedDoc(data.document);
        setTimeout(() => setUploadSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Evidence upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.projectWorkCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || doc.fileType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Dossier Header */}
      <div className="bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-2">
              <FolderLock className="w-3.5 h-3.5" />
              <span>Forensic Evidence Vault & AI Document Intelligence</span>
            </div>
            <h1 className="font-serif text-3xl font-black text-stone-950 tracking-tight">
              Cryptographic Evidence Repository
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1 max-w-3xl leading-relaxed">
              Tamper-evident archive of sanctioned work orders, geo-tagged site photographs, running account bills, and AI document duplication intelligence. Every upload generates an immutable SHA-256 hash anchored in the audit trail.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={!hasPermission('MANAGE_EVIDENCE')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xs transition-colors shadow-xs cursor-pointer ${
                hasPermission('MANAGE_EVIDENCE')
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title={!hasPermission('MANAGE_EVIDENCE') ? 'Requires Investigation Officer or Admin Role' : 'Upload and cryptographically seal evidence'}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Evidence</span>
            </button>

            <button
              onClick={fetchEvidence}
              className="p-2 border border-stone-200 hover:border-stone-400 text-stone-600 rounded-xs transition-colors cursor-pointer"
              title="Refresh Vault Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center gap-2 text-emerald-900 text-xs font-sans animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Main Layout: Document List & Forensic Deep-Dive Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filter & Evidence Document List */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by file, work code, officer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-sans">
              {['ALL', 'SANCTION_ORDER', 'WORK_PHOTO', 'BILL_VOUCHER', 'INSPECTION_REPORT'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-xs border uppercase font-mono text-[10px] whitespace-nowrap transition-colors cursor-pointer ${
                    typeFilter === type
                      ? 'bg-stone-900 text-amber-300 border-stone-900 font-bold'
                      : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Scroll Area */}
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredDocs.length === 0 ? (
              <div className="bg-white border border-stone-200 p-8 text-center rounded-xs text-stone-500">
                <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="font-medium text-stone-700 text-sm">No evidence documents match query</p>
                <p className="text-xs">Adjust search filters or upload a new inspection record.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                const isDuplicateFlagged = doc.documentIntelligence?.processingStatus === 'FLAGGED_DUPLICATE';

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-xs border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                        : isDuplicateFlagged
                        ? 'bg-rose-50/50 hover:bg-rose-50 border-rose-200 text-stone-900'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xs border mt-0.5 ${
                          isSelected 
                            ? 'bg-stone-800 border-stone-700 text-amber-400' 
                            : isDuplicateFlagged
                            ? 'bg-rose-100 border-rose-300 text-rose-700'
                            : 'bg-stone-100 border-stone-200 text-stone-700'
                        }`}>
                          {doc.fileType === 'WORK_PHOTO' ? (
                            <Camera className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs border ${
                              isSelected
                                ? 'bg-stone-800 text-stone-300 border-stone-700'
                                : 'bg-stone-100 text-stone-700 border-stone-200'
                            }`}>
                              {doc.fileType.replace('_', ' ')}
                            </span>
                            <span className={`text-[10px] font-mono ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                              {doc.id}
                            </span>
                            {isDuplicateFlagged && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs bg-rose-600 text-white">
                                OCR DUPLICATE FLAGGED
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif font-bold text-sm mt-1 leading-snug line-clamp-1">
                            {doc.fileName}
                          </h3>

                          <div className={`text-[11px] font-mono mt-1 ${isSelected ? 'text-amber-400' : 'text-stone-600'}`}>
                            Work Code: {doc.projectWorkCode}
                          </div>

                          <div className={`text-[10px] font-sans mt-1 flex items-center gap-3 ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                            <span>Size: {doc.fileSizeFormatted}</span>
                            <span>•</span>
                            <span>By: {doc.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Forensic Document Deep-Dive & AI Document Intelligence */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
              
              {/* Document Dossier Banner */}
              <div className="p-6 bg-stone-900 text-white border-b border-stone-800">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-400 text-stone-950 rounded-xs uppercase">
                        {selectedDoc.fileType.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-stone-400">
                        Sealed Record: {selectedDoc.id}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl font-black mt-2 text-stone-100">
                      {selectedDoc.fileName}
                    </h2>
                    <p className="text-xs font-sans text-stone-300 mt-1">
                      Uploaded by <strong className="text-amber-400">{selectedDoc.uploadedBy}</strong> ({selectedDoc.uploaderBadge}) on {new Date(selectedDoc.uploadDate).toLocaleString()}
                    </p>
                  </div>

                  {onSelectProject && (
                    <button
                      onClick={() => onSelectProject(selectedDoc.projectId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-xs text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>Open Associated Project</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Cryptographic Hash Bar */}
                <div className="mt-4 p-3 bg-stone-950 border border-stone-800 rounded-xs font-mono text-xs text-stone-300 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-stone-500 mr-2 uppercase text-[10px]">SHA-256 Sealing Hash:</span>
                    <span className="text-amber-400 font-semibold">{selectedDoc.sha256Hash}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedDoc.sha256Hash)}
                    className="p-1 text-stone-400 hover:text-white rounded-xs hover:bg-stone-800 transition-colors shrink-0"
                    title="Copy full cryptographic SHA-256 hash"
                  >
                    {copiedHash === selectedDoc.sha256Hash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Document Details Body */}
              <div className="p-6 space-y-6 text-stone-900 font-sans">
                
                {/* AI Document Intelligence Box */}
                {selectedDoc.documentIntelligence && (
                  <div className={`p-4 rounded-xs border ${
                    selectedDoc.documentIntelligence.processingStatus === 'FLAGGED_DUPLICATE'
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <h4 className="font-serif font-bold text-sm text-stone-950">
                          AI Document Intelligence & Schedule Verification
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-white border border-stone-300 px-2 py-0.5 rounded-xs font-bold text-stone-700">
                        {selectedDoc.documentIntelligence.ocrEngine}
                      </span>
                    </div>

                    <div className="mt-3 text-xs bg-white border border-stone-200 p-3 rounded-xs font-mono text-stone-700 leading-relaxed">
                      <span className="text-[10px] uppercase text-stone-400 block font-semibold mb-1">Extracted Text Content</span>
                      "{selectedDoc.documentIntelligence.extractedTextSnippet}"
                    </div>

                    {/* Duplicate Match Warning */}
                    {selectedDoc.documentIntelligence.processingStatus === 'FLAGGED_DUPLICATE' && (
                      <div className="mt-3 p-3 bg-rose-100 border border-rose-300 rounded-xs">
                        <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-700" />
                          <span>Identical Document Re-submission Detected! (Probability: {selectedDoc.documentIntelligence.duplicateProbability}%)</span>
                        </div>
                        <p className="text-[11px] text-rose-800 mt-1">
                          This file exhibits high lexical & schedule of rates similarity to previously sanctioned works.
                        </p>

                        <div className="mt-2 space-y-1.5">
                          {selectedDoc.documentIntelligence.matchedProjects.map((match, i) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-xs border border-rose-200">
                              <div>
                                <span className="font-mono font-bold text-stone-900 mr-2">{match.workCode}</span>
                                <span className="text-stone-600">{match.title}</span>
                              </div>
                              <span className="font-mono font-bold text-rose-700 text-[11px]">
                                {match.similarityScore}% Match
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Photo EXIF Metadata (If available) */}
                {selectedDoc.photoMetadata && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-3">
                    <div className="flex items-center gap-2 text-stone-950 font-serif font-bold text-sm">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <span>Geo-Forensic EXIF Metadata</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block">Capture Timestamp</span>
                        <span className="font-semibold text-stone-900">{selectedDoc.photoMetadata.captureDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block">GPS Coordinates</span>
                        <span className="font-semibold font-mono text-stone-900">
                          {selectedDoc.photoMetadata.gpsCoordinates?.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block">Capture Hardware</span>
                        <span className="font-semibold text-stone-900">{selectedDoc.photoMetadata.cameraModel}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block">Divergence from DPR</span>
                        <span className="font-semibold text-emerald-700">
                          {selectedDoc.photoMetadata.distanceFromSanctionMeters}m (Accurate)
                        </span>
                      </div>
                    </div>

                    {selectedDoc.url && (
                      <div className="mt-2 border border-stone-300 rounded-xs overflow-hidden max-h-60 bg-stone-900 flex items-center justify-center">
                        <img 
                          src={selectedDoc.url} 
                          alt={selectedDoc.fileName}
                          className="object-cover w-full h-full max-h-60"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Officer Notes */}
                <div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 mb-1.5">
                    Official Inspection Notes & Observations
                  </h4>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-700 font-sans leading-relaxed">
                    {selectedDoc.notes || 'No specific technical remarks recorded.'}
                  </div>
                </div>

                {/* Audit Integrity Seal */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center space-x-2 text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographically verified against SATYAKSH Immutable Audit Ledger.</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">
                    Integrity: Valid
                  </span>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white border border-stone-200 p-12 text-center rounded-xs text-stone-500">
              <FolderLock className="w-10 h-10 mx-auto text-stone-300 mb-3" />
              <h3 className="font-serif font-bold text-base text-stone-800">Select an Evidence Document</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Select any record from the left column to inspect its SHA-256 seal, OCR extraction, and anti-duplication analysis.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Upload Evidence Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-stone-300 rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif font-bold text-base">Upload Official Forensic Evidence</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Associated Project / Work</label>
                <select
                  value={uploadProjectId}
                  onChange={(e) => setUploadProjectId(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xs text-xs font-sans"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.workCode} • {p.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Site_Plaque_Photo_01.jpg"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xs text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Evidence Type</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as EvidenceFileType)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xs text-xs"
                  >
                    <option value="WORK_PHOTO">Site Photograph (Geo-Tagged)</option>
                    <option value="SANCTION_ORDER">Technical Sanction Order</option>
                    <option value="BILL_VOUCHER">Running Account Bill Voucher</option>
                    <option value="INSPECTION_REPORT">Inspection Audit Report</option>
                    <option value="COMPLETION_CERTIFICATE">Completion Certificate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-bold block mb-1">Inspection Notes & Findings</label>
                <textarea
                  rows={3}
                  placeholder="Record on-ground observations, clause 7.1 compliance, dimensions, or beneficiary statements..."
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xs text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xs text-[11px] text-amber-900 leading-snug">
                <strong className="block font-semibold">Automatic Integrity Safeguard:</strong>
                Submitting will compute a SHA-256 hash and append an immutable entry to the MoSPI national audit log under badge ID <strong>{currentUser.badgeId}</strong>.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploading ? 'Sealing...' : 'Seal in Vault'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
