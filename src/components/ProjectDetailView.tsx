import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  Award,
  Layers,
  Map,
  Compass,
  Volume2,
  Box,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Timer,
  ShieldAlert,
  Radio,
  Sparkles
} from 'lucide-react';
import { Project, RiskAssessment } from '../types';
import { ProjectLocationMap } from './ProjectLocationMap';
import { Project3DDigitalTwin } from './Project3DDigitalTwin';
import { ProjectTimeline } from './ProjectTimeline';
import { useI18n } from '../i18n/I18nContext';

interface ProjectDetailViewProps {
  project: Project;
  onBack: () => void;
  onSelectMP: (mpId: string) => void;
  onReportIssue?: (projectId: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onSelectMP,
  onReportIssue
}) => {
  const { language, currentLanguageMeta, t, term, termSimple, simpleMode, speak, isSpeaking } = useI18n();

  // Active Section Tab inside Project Detail: 'overview' | 'timeline' | '3d' | 'map' | 'risk-intelligence'
  const [activeSection, setActiveSection] = useState<'overview' | 'timeline' | '3d' | 'map' | 'risk-intelligence'>('overview');
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [aiMemo, setAiMemo] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  React.useEffect(() => {
    fetch(`/api/projects/${project.id}/risk-assessment`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.assessment) {
          setRiskAssessment(data.assessment);
        }
      })
      .catch(err => console.warn('Risk assessment fetch failed:', err));
  }, [project.id]);

  const handleGenerateAiMemo = async () => {
    setLoadingAi(true);
    setAiMemo(null);
    try {
      const res = await fetch('/api/ai/explain-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      });
      const data = await res.json();
      if (data.success) {
        setAiMemo(data.aiExplanation);
      }
    } catch (err) {
      console.warn('AI memo error:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const isCompleted = project.workStatus === 'COMPLETED';

  // Audio Read-aloud summary in citizen's language
  const handleReadSummary = () => {
    const text = `${project.title}। स्वीकृत राशि: ${project.sanctionedCostFormatted}। प्रमाणित खर्च: ${project.expenditureFormatted}। भौतिक प्रगति: ${project.physicalProgress}%। सिफारिशकर्ता: ${project.mpName}।`;
    speak(text);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. Back Navigation Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Register</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Audio Readout */}
          <button
            onClick={handleReadSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-amber-600 text-stone-800 text-xs font-medium rounded-xs transition-colors cursor-pointer shadow-xs"
            title="Listen to project details in your language"
          >
            <Volume2 className={`w-3.5 h-3.5 text-amber-700 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span>{t('simple.listen', 'Listen Audio')}</span>
          </button>

          {/* Report Issue Button */}
          {onReportIssue && (
            <button
              onClick={() => onReportIssue(project.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-medium rounded-xs transition-colors cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('project.reportIssue', 'Report Ground Issue')}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-xs border border-stone-200">
            <span>Work Code:</span>
            <strong className="text-stone-900">{project.workCode}</strong>
          </div>
        </div>
      </div>

      {/* 2. Main Project Overview Dossier Card */}
      <div className="bg-white border border-stone-300 rounded-xs shadow-xs overflow-hidden">
        
        {/* Header Strip */}
        <div className="p-6 sm:p-8 bg-[#faf9f5] border-b border-stone-200">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-900 text-stone-100 rounded-xs uppercase">
                  {project.sector}
                </span>
                
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Clock className="w-3 h-3 text-amber-700" />}
                  <span>{project.workStatus} ({project.physicalProgress}% {term('physicalProgress')})</span>
                </span>

                <span className="px-2 py-0.5 text-[10px] font-mono text-stone-600 border border-stone-300 rounded-xs">
                  FY {project.financialYear}
                </span>

                {project.village && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-300 rounded-xs">
                    📍 {project.village}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-black text-stone-950 tracking-tight leading-snug">
                {project.title}
              </h1>

              <p className="text-sm text-stone-700 font-sans leading-relaxed">
                {project.description}
              </p>

              {/* MP & Location Tags */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 font-sans pt-1">
                <div 
                  onClick={() => onSelectMP(project.mpId)}
                  className="flex items-center gap-1.5 font-medium hover:text-amber-800 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Recommended by: <strong>{project.mpName}</strong> ({project.mpParty})</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{project.locationName || `${project.district}, ${project.state}`}</span>
                </div>
              </div>
            </div>

            {/* Centralized Terminology Financial Summary Box */}
            <div className="bg-white border border-stone-200 p-5 rounded-xs shadow-xs min-w-[260px] text-right space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block font-semibold">
                  {term('sanctionedAmount')}
                </span>
                <span className="font-serif text-2xl font-black text-stone-900">
                  {project.sanctionedCostFormatted}
                </span>
              </div>

              <div className="border-t border-stone-100 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 block font-semibold">
                  {term('expenditure')}
                </span>
                <span className="font-serif text-2xl font-black text-emerald-900">
                  {project.expenditureFormatted}
                </span>
              </div>

              <div className="border-t border-stone-100 pt-2 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                  {term('financialProgress')}
                </span>
                <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200">
                  {project.sanctionedCost > 0 ? Math.round((project.expenditure / project.sanctionedCost) * 100) : 100}%
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Administration & Technical Credentials Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 p-5 bg-white text-xs">
          
          <div className="pr-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
              {term('contractor')} / Implementing Agency
            </span>
            <div className="font-semibold text-stone-900 font-sans">{project.implementingAgency}</div>
            <div className="text-stone-500 text-[11px]">Executing: {project.executingAuthority}</div>
          </div>

          <div 
            onClick={() => setActiveSection('timeline')}
            className="px-0 md:px-4 py-3 md:py-0 space-y-1.5 cursor-pointer group hover:bg-amber-50/50 transition-colors rounded-xs p-1"
            title="Click to view full 4-milestone chronological timeline"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold group-hover:text-amber-800">
                Milestone Timeline
              </span>
              <span className="text-[10px] font-mono text-amber-700 font-semibold group-hover:underline flex items-center gap-0.5">
                View Stepper →
              </span>
            </div>

            {/* Micro 4-phase milestone bar */}
            <div className="grid grid-cols-4 gap-1 py-1">
              <div className="flex flex-col items-center">
                <div className="w-full h-1.5 rounded-xs bg-emerald-600 mb-1" />
                <span className="text-[9px] font-mono text-stone-600 font-medium">Sanctioned</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-full h-1.5 rounded-xs mb-1 ${project.startDate || isCompleted || project.workStatus === 'IN_PROGRESS' ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                <span className="text-[9px] font-mono text-stone-600 font-medium">Started</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-full h-1.5 rounded-xs mb-1 ${isCompleted ? 'bg-emerald-600' : (project.workStatus === 'IN_PROGRESS' || project.physicalProgress > 0 ? 'bg-amber-500' : 'bg-stone-200')}`} />
                <span className="text-[9px] font-mono text-stone-600 font-medium">In-Progress</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-full h-1.5 rounded-xs mb-1 ${isCompleted ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                <span className="text-[9px] font-mono text-stone-600 font-medium">Completed</span>
              </div>
            </div>

            <div className="text-[11px] text-stone-700 font-sans flex items-center justify-between pt-0.5">
              <span>Sanction: <strong>{project.sanctionDate}</strong></span>
              <span>Target: <strong>{project.actualCompletionDate || project.expectedCompletionDate}</strong></span>
            </div>
          </div>

          <div className="pl-0 md:pl-4 pt-3 md:py-0 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
              {term('inspection')} & Certification Status
            </span>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UC Status: {project.utilizationCertificateStatus || 'VERIFIED'}</span>
            </div>
            <div className="text-stone-500 text-[11px]">
              Audit Trail: {project.auditStatus || 'CLEARED BY DISTRICT AUDIT'}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Interactive Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-300 pb-2 overflow-x-auto font-mono text-xs">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'overview'
              ? 'bg-stone-900 text-amber-300 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Overview & Dossier</span>
        </button>

        <button
          onClick={() => setActiveSection('timeline')}
          className={`px-4 py-2 rounded-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'timeline'
              ? 'bg-stone-900 text-amber-300 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Timer className="w-3.5 h-3.5 text-amber-600" />
          <span>Project Timeline (4 Milestones)</span>
        </button>

        {/* Future Phase: 3D Digital Twin & Structural CAD (Preserved for Future Scope) */}
        {/* <button
          onClick={() => setActiveSection('3d')}
          className={`px-4 py-2 rounded-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === '3d'
              ? 'bg-stone-900 text-amber-300 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-amber-600" />
          <span>View 3D Digital Twin</span>
        </button> */}

        <button
          onClick={() => setActiveSection('map')}
          className={`px-4 py-2 rounded-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'map'
              ? 'bg-stone-900 text-amber-300 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Map className="w-3.5 h-3.5 text-stone-500" />
          <span>Geospatial Site Map</span>
        </button>

        <button
          onClick={() => setActiveSection('risk-intelligence')}
          className={`px-4 py-2 rounded-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'risk-intelligence'
              ? 'bg-stone-900 text-amber-300 shadow-xs'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Spatial Screening & Risk ({riskAssessment?.riskScore || 0}/100)</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: Dedicated Project Milestone Timeline */}
      {activeSection === 'timeline' && (
        <ProjectTimeline 
          project={project} 
          onReportIssue={onReportIssue ? () => onReportIssue(project.id) : undefined} 
        />
      )}

      {/* 5. TAB CONTENT: 3D Digital Twin */}
      {activeSection === '3d' && (
        <Project3DDigitalTwin
          project={project}
          onReportIssue={() => onReportIssue?.(project.id)}
        />
      )}

      {/* 6. TAB CONTENT: Geospatial Map */}
      {activeSection === 'map' && (
        <ProjectLocationMap project={project} />
      )}

      {/* 7. TAB CONTENT: Spatial Screening & Risk Evaluation */}
      {activeSection === 'risk-intelligence' && (
        <div className="bg-white border border-stone-300 p-6 rounded-xs shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-100 text-rose-900 text-[10px] font-mono font-bold uppercase rounded-xs mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                <span>SATYAKSH Geo-Spatial Risk Dossier</span>
              </div>
              <h2 className="font-serif text-2xl font-black text-stone-950">
                Spatial Screening & Risk Evaluation
              </h2>
              <p className="text-xs text-stone-600 font-sans mt-0.5">
                Evaluated against statutory 50m spatial proximity, financial disbursement ratios, timeline overrun metrics, and agency capacity.
              </p>
            </div>

            {riskAssessment && (
              <div className={`p-3 rounded-xs border text-center shrink-0 ${
                riskAssessment.riskLevel === 'HIGH'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : riskAssessment.riskLevel === 'MEDIUM'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="text-[10px] font-mono uppercase font-bold text-stone-500">Risk Score</div>
                <div className="text-3xl font-mono font-black">{riskAssessment.riskScore}/100</div>
                <div className="text-[10px] font-mono font-bold uppercase">{riskAssessment.riskLevel} RISK</div>
              </div>
            )}
          </div>

          {/* Spatial Proximity Flag Alert */}
          {riskAssessment?.spatialDuplicateDetected && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-mono font-bold text-xs uppercase">
                <Radio className="w-4 h-4 text-rose-700 animate-pulse" />
                <span>High-Risk Spatial Proximity Alert: Suspect Neighbor Within {riskAssessment.nearestNeighborDistanceMeters}m</span>
              </div>
              <p className="text-xs text-rose-950 font-sans leading-relaxed">
                This project location is located only <strong>{riskAssessment.nearestNeighborDistanceMeters} meters</strong> away from another sanctioned work in the same sector. Under MPLADS Guidelines Clause 7.1, duplicate civil works within 50m must be physically audited before fund disbursement.
              </p>
            </div>
          )}

          {/* Multi-Signal Breakdown */}
          {riskAssessment && (
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-stone-900 uppercase">
                Itemized Anomaly Signal Contributions
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskAssessment.signals.map((sig, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-xs border text-xs ${
                      sig.status === 'FLAGGED'
                        ? 'bg-rose-50/60 border-rose-200'
                        : sig.status === 'WARNING'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1 font-bold">
                      <span className="text-stone-900 font-serif">{sig.name}</span>
                      <span className="font-mono text-stone-800">+{sig.scoreContribution}/{sig.maxScore}</span>
                    </div>
                    <p className="text-stone-600 font-sans text-[11px] leading-relaxed">
                      {sig.explanation}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-200/60">
                      Metric: {sig.metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Recommendation */}
          {riskAssessment && (
            <div className="p-4 bg-stone-900 text-stone-100 rounded-xs space-y-1.5 text-xs">
              <div className="text-amber-400 font-mono font-bold uppercase text-[11px]">
                Recommended Action for Nodal Authority:
              </div>
              <p className="text-stone-200 font-sans leading-relaxed">
                {riskAssessment.recommendedAction}
              </p>
            </div>
          )}

          {/* AI Forensic Memo Request */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={handleGenerateAiMemo}
              disabled={loadingAi}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold rounded-xs cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>{loadingAi ? 'Consulting Gemini AI...' : 'Generate Legal & Forensic AI Audit Memo'}</span>
            </button>

            {onReportIssue && (
              <button
                onClick={() => onReportIssue(project.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-800 hover:bg-rose-900 text-white font-mono text-xs font-semibold rounded-xs cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>File Formal Ground Inspection Report</span>
              </button>
            )}
          </div>

          {aiMemo && (
            <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xs text-xs font-sans text-stone-800 leading-relaxed whitespace-pre-line">
              <div className="font-mono font-bold text-amber-900 text-[11px] uppercase mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Official SATYAKSH AI Forensic Audit Report</span>
              </div>
              {aiMemo}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB CONTENT: Overview (Default Dossier with embedded Timeline) */}
      {activeSection === 'overview' && (
        <>
          {/* Visual 4-Milestone Project Timeline */}
          <ProjectTimeline 
            project={project} 
            onReportIssue={onReportIssue ? () => onReportIssue(project.id) : undefined} 
          />

          {/* Geospatial Site Location Map */}
          <ProjectLocationMap project={project} />

          {/* Project Execution Stages & Physical Plaque */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Step-by-Step Statutory Execution Stages */}
            <div className="lg:col-span-7 bg-white border border-stone-200 p-6 rounded-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900">
                    Statutory Milestone Progression
                  </h2>
                  <p className="text-xs text-stone-500">
                    Official lifecycle audit from MP recommendation to public commissioning
                  </p>
                </div>
                <FileText className="w-4 h-4 text-stone-400" />
              </div>

              <div className="space-y-4">
                {project.stages?.map((st) => (
                  <div key={st.stageNumber} className="flex items-start space-x-3.5 text-xs">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                      st.status === 'COMPLETED' ? 'bg-emerald-800 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {st.stageNumber}
                    </div>
                    <div className="flex-1 bg-stone-50 border border-stone-200 p-3 rounded-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 font-sans">{st.stageName}</span>
                        <span className="font-mono text-stone-500 text-[11px]">{st.date}</span>
                      </div>
                      <div className="mt-1 text-stone-600 text-[11px]">
                        Authority: <strong className="text-stone-800">{st.authority}</strong>
                        {st.amount && <span className="ml-2 font-mono">Amount: {st.amount}</span>}
                      </div>
                      {st.documentNumber && (
                        <div className="mt-1 font-mono text-[10px] text-stone-400">
                          Ref Doc: {st.documentNumber}
                        </div>
                      )}
                      {st.notes && (
                        <div className="mt-1 text-[11px] text-amber-900 italic font-sans">
                          Note: {st.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Statutory Physical Asset Plaque (Clause 7.1) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Physical Plaque Model */}
              <div className="bg-[#1e1e1e] text-stone-200 border-4 border-amber-600/60 p-6 rounded-xs shadow-xl relative overflow-hidden font-serif">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Building className="w-24 h-24 text-amber-300" />
                </div>

                <div className="text-center space-y-2 border-b border-amber-600/40 pb-4 mb-4">
                  <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                    MEMBER OF PARLIAMENT LOCAL AREA DEVELOPMENT SCHEME (MPLADS)
                  </div>
                  <div className="text-lg font-black text-amber-200 tracking-wide">
                    GOVERNMENT OF INDIA
                  </div>
                </div>

                <div className="space-y-3 text-xs text-stone-300 font-sans">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 block">Name of Work:</span>
                    <p className="font-semibold text-white mt-0.5">{project.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 block">Recommended By:</span>
                      <p className="font-medium text-stone-200">{project.mpName}, MP ({project.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha'})</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 block">{term('sanctionedAmount')}:</span>
                      <p className="font-mono font-bold text-amber-300">{project.sanctionedCostFormatted}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 block">Financial Year:</span>
                      <p className="font-medium text-stone-200">{project.financialYear}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 block">Completion:</span>
                      <p className="font-medium text-stone-200">{project.actualCompletionDate || project.expectedCompletionDate}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 block">{term('contractor')}:</span>
                    <p className="text-[11px] text-stone-300">{project.implementingAgency}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-600/40 text-center text-[10px] font-mono text-amber-400/80">
                  Statutory Plaque mandated under Clause 7.1 of MPLADS Operational Guidelines
                </div>
              </div>

              {/* Geo Coordinates & Mapping Note */}
              <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-stone-900">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-stone-500" />
                    <span>Geo-Tagged Site Coordinates</span>
                  </span>
                  <span className="font-mono text-stone-600">
                    {project.coordinates ? `${project.coordinates[0].toFixed(4)}° N, ${project.coordinates[1].toFixed(4)}° E` : 'Registered'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-sans">
                  Field inspections conducted by District Planning Office with geotagged photographic confirmation uploaded to PFMS.
                </p>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};

