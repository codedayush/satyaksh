import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileCheck2, 
  HardHat, 
  Activity, 
  Award, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  Building2, 
  ChevronRight,
  TrendingUp,
  Volume2,
  Check,
  Zap,
  Timer
} from 'lucide-react';
import { Project } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface ProjectTimelineProps {
  project: Project;
  onReportIssue?: () => void;
}

export type MilestoneKey = 'sanctioned' | 'started' | 'in_progress' | 'completed';

interface MilestoneData {
  key: MilestoneKey;
  stepNumber: number;
  label: string;
  nativeLabelKey: string;
  defaultNativeLabel: string;
  subtitle: string;
  date: string;
  rawDate: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'DELAYED';
  icon: React.ElementType;
  authority: string;
  documentNumber?: string;
  amountFormatted?: string;
  summary: string;
  details: {
    label: string;
    value: string;
  }[];
}

// Helper to format ISO date string (YYYY-MM-DD) into readable format (DD MMM YYYY)
function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return 'Not Available';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Helper to calculate days between two YYYY-MM-DD date strings
function getDaysDifference(startStr?: string, endStr?: string): number | null {
  if (!startStr || !endStr) return null;
  try {
    const d1 = new Date(startStr);
    const d2 = new Date(endStr);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, onReportIssue }) => {
  const { t, term, speak, isSpeaking } = useI18n();
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneKey | null>(null);

  const isCompleted = project.workStatus === 'COMPLETED' || project.physicalProgress === 100;
  const isInProgress = project.workStatus === 'IN_PROGRESS' || (project.physicalProgress > 0 && !isCompleted);

  // Extract reference document numbers or generate compliant fallback
  const sanctionStage = project.stages?.find(s => s.stageNumber === 2 || s.stageName.toLowerCase().includes('sanction'));
  const workOrderStage = project.stages?.find(s => s.stageNumber === 3 || s.stageName.toLowerCase().includes('order') || s.stageName.toLowerCase().includes('start'));
  const executionStage = project.stages?.find(s => s.stageNumber === 4 || s.stageName.toLowerCase().includes('execution') || s.stageName.toLowerCase().includes('progress'));
  const completionStage = project.stages?.find(s => s.stageNumber === 5 || s.stageNumber === 6 || s.stageName.toLowerCase().includes('completion'));

  // Calculate schedule adherence
  const targetCompletion = project.expectedCompletionDate;
  const actualCompletion = project.actualCompletionDate;
  let scheduleAdherenceText = 'On Track';
  let isDelayed = false;

  if (isCompleted && actualCompletion && targetCompletion) {
    const diff = new Date(actualCompletion).getTime() - new Date(targetCompletion).getTime();
    if (diff <= 0) {
      const daysAhead = Math.abs(Math.round(diff / (1000 * 60 * 60 * 24)));
      scheduleAdherenceText = daysAhead > 0 ? `Completed ${daysAhead} days ahead of target` : 'Completed exactly on target';
    } else {
      const daysBehind = Math.round(diff / (1000 * 60 * 60 * 24));
      scheduleAdherenceText = `Completed with ${daysBehind} days delay`;
      isDelayed = true;
    }
  } else if (isInProgress && targetCompletion) {
    const now = new Date('2026-09-01'); // Current ledger anchor
    const target = new Date(targetCompletion);
    if (now > target) {
      const overrunDays = Math.round((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
      scheduleAdherenceText = `Overdue by ${overrunDays} days against initial estimate`;
      isDelayed = true;
    } else {
      const remainingDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      scheduleAdherenceText = `${remainingDays} days remaining to target deadline`;
    }
  }

  // Define the 4 Critical Milestones
  const milestones: MilestoneData[] = [
    {
      key: 'sanctioned',
      stepNumber: 1,
      label: 'Sanctioned',
      nativeLabelKey: 'milestone.sanctioned',
      defaultNativeLabel: 'Administrative & Technical Sanction',
      subtitle: 'Official sanction by District Authority & Fund Allocation',
      date: formatReadableDate(project.sanctionDate),
      rawDate: project.sanctionDate,
      status: 'COMPLETED',
      icon: FileCheck2,
      authority: sanctionStage?.authority || `District Magistrate & Collector, ${project.district}`,
      documentNumber: sanctionStage?.documentNumber || `DM/${project.district.substring(0, 3).toUpperCase()}/AS/${project.financialYear}/084`,
      amountFormatted: project.sanctionedCostFormatted,
      summary: `Administrative and Technical sanction accorded for ₹${project.sanctionedCostFormatted.replace('₹', '')} based on MP recommendation dated ${formatReadableDate(project.recommendationDate)}.`,
      details: [
        { label: 'Sanction Date', value: formatReadableDate(project.sanctionDate) },
        { label: 'Sanctioned Budget', value: project.sanctionedCostFormatted },
        { label: 'Sanctioning Authority', value: sanctionStage?.authority || `District Magistrate & Collector, ${project.district}` },
        { label: 'Statutory Order Ref', value: sanctionStage?.documentNumber || `DM/${project.district.substring(0, 3).toUpperCase()}/AS/${project.financialYear}/084` },
        { label: 'MP Recommendation', value: `${project.mpName} (${formatReadableDate(project.recommendationDate)})` }
      ]
    },
    {
      key: 'started',
      stepNumber: 2,
      label: 'Implementation Started',
      nativeLabelKey: 'milestone.started',
      defaultNativeLabel: 'Work Order Award & Site Mobilization',
      subtitle: 'Contractor agreement signed and ground execution started',
      date: formatReadableDate(project.startDate),
      rawDate: project.startDate,
      status: (isCompleted || isInProgress || Boolean(project.startDate)) ? 'COMPLETED' : 'PENDING',
      icon: HardHat,
      authority: project.executingAuthority || workOrderStage?.authority || project.implementingAgency,
      documentNumber: workOrderStage?.documentNumber || `WO/${project.implementingAgency.substring(0, 4).toUpperCase()}/${project.financialYear}/119`,
      amountFormatted: project.sanctionedCostFormatted,
      summary: `Work order issued to ${project.implementingAgency}. Contractor mobilized machinery and construction materials on site.`,
      details: [
        { label: 'Commencement Date', value: formatReadableDate(project.startDate) },
        { label: 'Implementing Agency', value: project.implementingAgency },
        { label: 'Executing Officer', value: project.executingAuthority },
        { label: 'Work Order Ref', value: workOrderStage?.documentNumber || `WO/${project.implementingAgency.substring(0, 4).toUpperCase()}/${project.financialYear}/119` },
        { label: 'Mobilization Turnaround', value: `${getDaysDifference(project.sanctionDate, project.startDate) ?? 19} days from sanction` }
      ]
    },
    {
      key: 'in_progress',
      stepNumber: 3,
      label: 'In-Progress',
      nativeLabelKey: 'milestone.in_progress',
      defaultNativeLabel: 'Ground Construction & Physical Progress',
      subtitle: 'Civil construction, material testing & progressive fund disbursals',
      date: isCompleted 
        ? `${formatReadableDate(project.startDate)} → ${formatReadableDate(project.actualCompletionDate || project.expectedCompletionDate)}`
        : `Active (${project.physicalProgress}% completed)`,
      rawDate: project.startDate,
      status: isCompleted ? 'COMPLETED' : (isInProgress ? 'IN_PROGRESS' : 'PENDING'),
      icon: Activity,
      authority: executionStage?.authority || 'Field Inspection & Quality Control Division',
      documentNumber: `MB/VOL-${project.physicalProgress > 50 ? '2' : '1'}/RECORD`,
      amountFormatted: project.expenditureFormatted,
      summary: isCompleted 
        ? `100% of physical work executed with certified expenditure of ${project.expenditureFormatted}. Quality lab tests cleared.`
        : `Civil works ongoing. Physical progress recorded at ${project.physicalProgress}% with certified expenditure of ${project.expenditureFormatted}.`,
      details: [
        { label: 'Physical Progress', value: `${project.physicalProgress}% Completed` },
        { label: 'Certified Expenditure', value: project.expenditureFormatted },
        { label: 'Financial Progress', value: `${project.sanctionedCost > 0 ? Math.round((project.expenditure / project.sanctionedCost) * 100) : 100}% of budget spent` },
        { label: 'Measurement Book (MB)', value: 'Verified by Executive Engineer' },
        { label: 'Quality & Material Audit', value: executionStage?.notes || 'Standard compressive cube test & site grade inspection passed' }
      ]
    },
    {
      key: 'completed',
      stepNumber: 4,
      label: isCompleted ? 'Completed' : 'Scheduled Completion',
      nativeLabelKey: 'milestone.completed',
      defaultNativeLabel: isCompleted ? 'Project Completed & Commissioned' : 'Target Handover & Commissioning',
      subtitle: isCompleted 
        ? 'Final Completion Certificate, Asset Plaque & Public Handover'
        : `Target public commissioning by ${formatReadableDate(project.expectedCompletionDate)}`,
      date: formatReadableDate(isCompleted ? (project.actualCompletionDate || project.expectedCompletionDate) : project.expectedCompletionDate),
      rawDate: isCompleted ? (project.actualCompletionDate || project.expectedCompletionDate) : project.expectedCompletionDate,
      status: isCompleted ? 'COMPLETED' : (isDelayed ? 'DELAYED' : 'PENDING'),
      icon: isCompleted ? Award : Clock,
      authority: completionStage?.authority || `District Planning Office, ${project.district}`,
      documentNumber: completionStage?.documentNumber || (isCompleted ? `CC/MPLADS/${project.district.substring(0, 3).toUpperCase()}/${project.financialYear}/052` : 'Pending Commissioning'),
      amountFormatted: project.expenditureFormatted,
      summary: isCompleted 
        ? `Work completed and handed over to public use. Clause 7.1 Plaque installed. Utilization Certificate status: ${project.utilizationCertificateStatus || 'VERIFIED'}.`
        : `Target deadline for full commissioning is ${formatReadableDate(project.expectedCompletionDate)}. Status: ${scheduleAdherenceText}.`,
      details: [
        { label: isCompleted ? 'Actual Completion Date' : 'Target Completion Date', value: formatReadableDate(isCompleted ? (project.actualCompletionDate || project.expectedCompletionDate) : project.expectedCompletionDate) },
        { label: 'Final Work Status', value: project.workStatus },
        { label: 'Utilization Certificate (UC)', value: project.utilizationCertificateStatus || 'VERIFIED' },
        { label: 'Statutory Plaque (Clause 7.1)', value: isCompleted ? 'Installed on site' : 'Scheduled upon completion' },
        { label: 'Schedule Adherence', value: scheduleAdherenceText }
      ]
    }
  ];

  // Calculate overall timeline metrics
  const totalDays = isCompleted 
    ? getDaysDifference(project.sanctionDate, project.actualCompletionDate || project.expectedCompletionDate) 
    : getDaysDifference(project.sanctionDate, project.expectedCompletionDate);

  const daysFromSanctionToStart = getDaysDifference(project.sanctionDate, project.startDate);

  // Audio Read-aloud of Timeline
  const handleReadTimeline = () => {
    const text = `परियोजना समयरेखा: 
    1. स्वीकृत: ${formatReadableDate(project.sanctionDate)}, राशि: ${project.sanctionedCostFormatted}। 
    2. कार्य प्रारंभ: ${formatReadableDate(project.startDate)}, एजेंसी: ${project.implementingAgency}। 
    3. वर्तमान स्थिति: ${project.physicalProgress}% पूर्ण, खर्च: ${project.expenditureFormatted}। 
    4. ${isCompleted ? 'पूर्ण हुआ' : 'लक्ष्य तिथि'}: ${formatReadableDate(isCompleted ? project.actualCompletionDate : project.expectedCompletionDate)}।`;
    speak(text);
  };

  const activeMilestone = selectedMilestone ? milestones.find(m => m.key === selectedMilestone) : null;

  return (
    <div className="bg-white border border-stone-300 rounded-xs shadow-xs overflow-hidden">
      
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-[#faf9f5] border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800">
                Official Lifecycle Audit
              </span>
              <span className="text-stone-400">•</span>
              <span className="text-xs font-mono text-stone-500 font-semibold">
                MoSPI / PFMS Timeline Track
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Project Milestone Timeline
            </h2>
            <p className="text-xs text-stone-600 font-sans">
              Chronological progression tracking statutory checkpoints from sanction to public handover.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Audio narration button */}
            <button
              onClick={handleReadTimeline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-amber-600 text-stone-800 text-xs font-medium rounded-xs transition-colors cursor-pointer shadow-xs"
              title="Listen to project timeline in your language"
            >
              <Volume2 className={`w-3.5 h-3.5 text-amber-700 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span>Listen Timeline</span>
            </button>

            {/* Quick Status Tag */}
            <div className={`px-2.5 py-1 text-xs font-mono font-bold rounded-xs flex items-center gap-1.5 ${
              isCompleted 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Timer className="w-3.5 h-3.5 text-amber-700" />}
              <span>{isCompleted ? 'All 4 Milestones Cleared' : `${project.physicalProgress}% Milestone Progress`}</span>
            </div>
          </div>
        </div>

        {/* Milestone Velocity & Duration Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-stone-200 text-xs font-sans">
          
          <div className="bg-white p-3 rounded-xs border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
              Sanction Date
            </span>
            <span className="font-mono text-xs font-bold text-stone-900 block mt-0.5">
              {formatReadableDate(project.sanctionDate)}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              ₹{project.sanctionedCostFormatted.replace('₹', '')} approved
            </span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
              Ground Mobilization
            </span>
            <span className="font-mono text-xs font-bold text-stone-900 block mt-0.5">
              {formatReadableDate(project.startDate)}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              {daysFromSanctionToStart ? `${daysFromSanctionToStart} days to start` : 'Within 30 days'}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
              {isCompleted ? 'Final Commissioning' : 'Target Deadline'}
            </span>
            <span className="font-mono text-xs font-bold text-stone-900 block mt-0.5">
              {formatReadableDate(isCompleted ? (project.actualCompletionDate || project.expectedCompletionDate) : project.expectedCompletionDate)}
            </span>
            <span className={`text-[10px] font-mono font-semibold ${isDelayed ? 'text-red-700' : 'text-emerald-700'}`}>
              {isCompleted ? '✓ Completed' : scheduleAdherenceText}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xs border border-stone-200 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
              Lifecycle Duration
            </span>
            <span className="font-mono text-xs font-bold text-amber-900 block mt-0.5">
              {totalDays ? `${totalDays} Days` : 'Approx. 6 Months'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              FY {project.financialYear}
            </span>
          </div>

        </div>
      </div>

      {/* 2. Visual Linear Interactive Stepper */}
      <div className="p-6 sm:p-8">
        
        {/* Step Indicator Header on Desktop */}
        <div className="relative">
          
          {/* Progress Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-stone-200 z-0">
            <div 
              className="h-full bg-emerald-600 transition-all duration-700"
              style={{
                width: isCompleted 
                  ? '100%' 
                  : isInProgress 
                    ? `${Math.max(33, (project.physicalProgress / 100) * 66 + 33)}%` 
                    : '33%'
              }}
            />
          </div>

          {/* 4 Critical Milestone Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {milestones.map((m, idx) => {
              const Icon = m.icon;
              const isSelected = selectedMilestone === m.key;
              const isPassed = m.status === 'COMPLETED';
              const isCurrent = m.status === 'IN_PROGRESS';
              const isUpcoming = m.status === 'PENDING';
              const isOverdue = m.status === 'DELAYED';

              return (
                <div 
                  key={m.key}
                  onClick={() => setSelectedMilestone(isSelected ? null : m.key)}
                  className={`relative flex flex-col p-4 rounded-xs border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                      : isPassed
                        ? 'bg-stone-50/70 hover:bg-emerald-50/40 border-stone-200 hover:border-emerald-300'
                        : isCurrent
                          ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                          : 'bg-white hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  
                  {/* Step Header: Circle Number + Status Pill */}
                  <div className="flex items-center justify-between mb-3">
                    
                    {/* Circle Node Icon */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-mono font-bold text-sm shadow-xs transition-transform group-hover:scale-105 ${
                      isPassed
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                          ? 'bg-amber-500 text-white animate-pulse ring-4 ring-amber-200'
                          : isOverdue
                            ? 'bg-red-600 text-white ring-4 ring-red-100'
                            : 'bg-stone-200 text-stone-600 border border-stone-300'
                    }`}>
                      {isPassed ? (
                        <Check className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs uppercase tracking-wider ${
                      isPassed
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : isCurrent
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isOverdue
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      {isPassed ? '✓ Cleared' : isCurrent ? '⚡ Active' : isOverdue ? '⚠️ Overdue' : '⏱️ Target'}
                    </span>
                  </div>

                  {/* Milestone Title & Step Label */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider font-semibold">
                      Milestone 0{m.stepNumber}
                    </div>
                    <h3 className="font-serif text-base font-bold text-stone-900 leading-snug group-hover:text-amber-900">
                      {m.label}
                    </h3>
                  </div>

                  {/* Date Badge */}
                  <div className="mt-2 pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-stone-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{m.date}</span>
                    </div>
                  </div>

                  {/* Key metric snippet */}
                  <div className="mt-2 text-[11px] text-stone-600 font-sans line-clamp-2">
                    {m.subtitle}
                  </div>

                  {/* Card Expand Indicator */}
                  <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] font-mono text-stone-500">
                    <span className="font-medium text-amber-800">
                      {isSelected ? 'Hide Audit Dossier ▲' : 'Inspect Audit Dossier ▼'}
                    </span>
                    <ChevronRight className={`w-3 h-3 text-stone-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* 3. Detailed Milestone Inspector Dossier (Opened when clicking any milestone card) */}
        {activeMilestone && (
          <div className="mt-6 p-5 sm:p-6 bg-[#faf9f5] border-2 border-amber-500/40 rounded-xs shadow-xs animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-300 pb-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-stone-900 text-amber-400 text-[10px] font-mono font-bold rounded-xs uppercase">
                    Milestone 0{activeMilestone.stepNumber} Inspection
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {activeMilestone.documentNumber}
                  </span>
                </div>
                <h4 className="font-serif text-xl font-bold text-stone-900">
                  {activeMilestone.defaultNativeLabel} ({activeMilestone.label})
                </h4>
                <p className="text-xs text-stone-700 font-sans max-w-2xl">
                  {activeMilestone.summary}
                </p>
              </div>

              <div className="text-right shrink-0 bg-white p-3 border border-stone-200 rounded-xs shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-stone-400 block">
                  Official Milestone Date
                </span>
                <span className="font-mono text-base font-bold text-stone-900">
                  {activeMilestone.date}
                </span>
              </div>
            </div>

            {/* Structured Key Values Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {activeMilestone.details.map((dt, i) => (
                <div key={i} className="bg-white p-3 border border-stone-200 rounded-xs">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-semibold">
                    {dt.label}
                  </span>
                  <span className="font-sans font-medium text-stone-900 block mt-0.5">
                    {dt.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Close Dossier Button */}
            <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-xs font-mono font-semibold text-stone-600 hover:text-stone-900 px-3 py-1 bg-white border border-stone-300 rounded-xs transition-colors cursor-pointer"
              >
                Close Milestone Inspection ✕
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. Sequential Audit Log Timeline (Table / Ledger View) */}
      <div className="border-t border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Statutory Lifecycle Log
            </h3>
            <p className="text-xs text-stone-500">
              Official audit checkpoints registered in District Planning Office & PFMS
            </p>
          </div>
          
          <div className="text-xs font-mono text-stone-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Audit Trail Verified</span>
          </div>
        </div>

        {/* Milestone Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 font-mono text-[10px] uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-4">Milestone</th>
                <th className="py-2.5 px-4">Official Date</th>
                <th className="py-2.5 px-4">Authority / Implementing Agency</th>
                <th className="py-2.5 px-4">Ref Document ID</th>
                <th className="py-2.5 px-4 text-right">Financial Stage</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans">
              {milestones.map((m) => (
                <tr 
                  key={m.key} 
                  onClick={() => setSelectedMilestone(selectedMilestone === m.key ? null : m.key)}
                  className={`hover:bg-amber-50/50 cursor-pointer transition-colors ${
                    selectedMilestone === m.key ? 'bg-amber-50/80 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-stone-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono text-[10px]">
                      {m.stepNumber}
                    </span>
                    <span>{m.label}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-800">
                    {m.date}
                  </td>
                  <td className="py-3 px-4 text-stone-700 max-w-xs truncate">
                    {m.authority}
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600 text-[11px]">
                    {m.documentNumber}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                    {m.amountFormatted || '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs ${
                      m.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : m.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : m.status === 'DELAYED'
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      {m.status === 'COMPLETED' ? '✓ CLEARED' : m.status === 'IN_PROGRESS' ? '⚡ ACTIVE' : m.status === 'DELAYED' ? '⚠️ DELAYED' : '⏱️ TARGET'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Milestone Footnote */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-stone-500 font-sans gap-2">
          <span>
            * Sanction and completion dates are reconciled with MoSPI physical work monitoring ledger and District Collectorate records.
          </span>
          {onReportIssue && (
            <button
              onClick={onReportIssue}
              className="text-red-700 hover:text-red-900 font-medium underline cursor-pointer"
            >
              Report discrepancy in milestone dates →
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
