import React, { useState } from 'react';
import { 
  GitBranch, 
  ArrowDown, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  FileText, 
  Landmark, 
  Building, 
  UserCheck, 
  Banknote,
  Info
} from 'lucide-react';
import { MoneyFlowStage } from '../types';
import { MONEY_FLOW_STAGES } from '../data/mpladsData';

export const MoneyFlowView: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const activeStageData = MONEY_FLOW_STAGES.find(s => s.stepNumber === selectedStage) || MONEY_FLOW_STAGES[0];

  const getStageIcon = (step: number) => {
    switch (step) {
      case 1: return Landmark;
      case 2: return Banknote;
      case 3: return UserCheck;
      case 4: return FileText;
      case 5: return Building;
      case 6: return CheckCircle2;
      default: return GitBranch;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xs shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xs mb-3">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Statutory Lifecycle Visualizer</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-stone-950 tracking-tight">
            How MPLADS Funds Flow
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-700 font-sans leading-relaxed">
            From the Consolidated Fund of India to district escrow accounts, technical sanctioning, field execution, and public asset commissioning — trace the statutory trajectory of public capital.
          </p>
        </div>
      </div>

      {/* Interactive 6-Stage Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Vertical Stepper Pipeline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold px-1">
            Official 6-Stage Disbursement Pipeline
          </div>

          <div className="space-y-3">
            {MONEY_FLOW_STAGES.map((stage) => {
              const Icon = getStageIcon(stage.stepNumber);
              const isSelected = selectedStage === stage.stepNumber;
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.stepNumber)}
                  className={`p-4 border rounded-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300 hover:bg-stone-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3.5">
                      <div className={`w-8 h-8 rounded-xs flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-700 border border-stone-300'
                      }`}>
                        {stage.stepNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-serif font-bold text-base ${isSelected ? 'text-amber-300' : 'text-stone-900'}`}>
                            {stage.title}
                          </h3>
                        </div>
                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono font-bold text-xs ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                        {stage.amountFormatted}
                      </div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-amber-400' : 'text-emerald-700'}`}>
                        {stage.percentageOfReleased}% of total
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Statutory Detail Card for Selected Stage */}
        <div className="lg:col-span-6 bg-white border border-stone-200 p-6 rounded-xs shadow-sm sticky top-24">
          
          <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold">
                Stage {activeStageData.stepNumber} Specifications
              </span>
              <h2 className="font-serif text-2xl font-black text-stone-900 mt-1">
                {activeStageData.title}
              </h2>
            </div>
            <div className="p-3 bg-stone-100 rounded-xs text-stone-800">
              {React.createElement(getStageIcon(activeStageData.stepNumber), { className: 'w-6 h-6' })}
            </div>
          </div>

          <div className="space-y-5">
            {/* Description */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                Operational Mechanism
              </label>
              <p className="mt-1 text-sm text-stone-800 font-sans leading-relaxed">
                {activeStageData.description}
              </p>
            </div>

            {/* Authority & Rule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-xs border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 font-mono block text-[10px] uppercase">Designated Authority</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">{activeStageData.authority}</span>
              </div>
              <div>
                <span className="text-stone-400 font-mono block text-[10px] uppercase">MoSPI Scheme Rule</span>
                <span className="font-semibold text-amber-800 mt-0.5 block">{activeStageData.statutoryRule}</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                Mandatory Guidelines & Thresholds
              </label>
              <div className="space-y-2">
                {activeStageData.keyMetrics.map((km, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-xs text-xs">
                    <span className="text-stone-600 font-medium">{km.label}</span>
                    <span className="font-mono font-bold text-stone-900">{km.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Audit Checks */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold block mb-2">
                Statutory Compliance & Audit Verification
              </label>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {activeStageData.auditChecks.map((check, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono">
            <span>MoSPI Operational Guidelines 2023</span>
            <span className="text-stone-900 font-semibold">C&AG Audited</span>
          </div>

        </div>

      </div>

    </div>
  );
};
