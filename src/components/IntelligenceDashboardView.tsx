import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Copy, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Filter, 
  ArrowUpRight, 
  Search, 
  Activity, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Building,
  TrendingDown,
  FileSpreadsheet,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Project, RiskAssessment, SpatialDuplicatePair } from '../types';

interface IntelligenceDashboardViewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNavigateToRiskIntelligence?: () => void;
}

const RISK_COLORS = {
  CRITICAL: '#b91c1c', // dark red
  HIGH: '#dc2626',     // crimson
  MEDIUM: '#d97706',   // amber
  LOW: '#16a34a'       // green
};

export const IntelligenceDashboardView: React.FC<IntelligenceDashboardViewProps> = ({
  projects,
  onSelectProject,
  onNavigateToRiskIntelligence
}) => {
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [duplicates, setDuplicates] = useState<SpatialDuplicatePair[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [activeTabSection, setActiveTabSection] = useState<'all' | 'high-risk' | 'duplicates' | 'delayed'>('all');

  // Fetch real-time assessments and duplicates from backend
  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const [riskRes, dupRes] = await Promise.all([
        fetch('/api/risk-assessments').then(r => r.json()),
        fetch('/api/analytics/duplicates?radius=50').then(r => r.json())
      ]);

      if (riskRes.success && riskRes.assessments) {
        setAssessments(riskRes.assessments);
      }
      if (dupRes.success && dupRes.duplicates) {
        setDuplicates(dupRes.duplicates);
      }
    } catch (err) {
      console.error('Failed to load risk intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  // Compute System-Wide Risk Metrics
  const metrics = useMemo(() => {
    const totalAudited = projects.length;
    
    // Delayed projects: expectedCompletionDate < now and not completed, or workStatus IN_PROGRESS with low progress
    const now = new Date('2026-09-01');
    const delayedProjects = projects.filter(p => {
      if (p.workStatus === 'COMPLETED') return false;
      if (p.expectedCompletionDate) {
        const expected = new Date(p.expectedCompletionDate);
        if (expected < now) return true;
      }
      // Also flag projects in progress with high delay or stalled
      return p.workStatus === 'IN_PROGRESS' && p.physicalProgress < 40;
    });

    // High risk & critical risk projects
    const highRiskAssessments = assessments.filter(a => a.riskLevel === 'HIGH' || a.riskCategory === 'HIGH' || a.riskCategory === 'CRITICAL' || a.riskScore >= 61);
    const criticalRiskAssessments = assessments.filter(a => a.riskCategory === 'CRITICAL' || a.riskScore >= 81);
    const mediumRiskAssessments = assessments.filter(a => (a.riskLevel === 'MEDIUM' || a.riskCategory === 'MEDIUM') && a.riskScore < 61);
    const lowRiskAssessments = assessments.filter(a => (a.riskLevel === 'LOW' || a.riskCategory === 'LOW') && a.riskScore < 31);

    // Duplicate projects count
    const duplicateProjectIds = new Set<string>();
    duplicates.forEach(d => {
      duplicateProjectIds.add(d.projectAId);
      duplicateProjectIds.add(d.projectBId);
    });

    // Total Financial Anomalies (Crores)
    // Combines cost overruns, disbursal-progress mismatches, duplicate project exposures, and high-risk financial liability
    const highRiskProjectIds = new Set(highRiskAssessments.map(a => a.projectId));
    const highRiskProjects = projects.filter(p => highRiskProjectIds.has(p.id));
    const totalHighRiskCostLakhs = highRiskProjects.reduce((sum, p) => sum + (p.sanctionedCost || 0), 0);
    const totalHighRiskCostCr = Math.round((totalHighRiskCostLakhs / 100) * 100) / 100;

    const duplicateExposureCr = duplicates.reduce((sum, d) => sum + (d.projectB?.sanctionedCost || 0), 0) / 100;

    // Direct financial anomaly sum: overrun amounts + duplicate exposures + advance liquidation risks
    const costOverrunsLakhs = projects.reduce((sum, p) => {
      if (p.expenditure > p.sanctionedCost) {
        return sum + (p.expenditure - p.sanctionedCost);
      }
      return sum;
    }, 0);

    const prematureDisbursalLakhs = projects.reduce((sum, p) => {
      const disbursalPct = p.sanctionedCost > 0 ? (p.expenditure / p.sanctionedCost) * 100 : 0;
      if (disbursalPct >= 75 && p.physicalProgress < 50) {
        return sum + (p.expenditure * 0.4); // estimated unbacked advance risk
      }
      return sum;
    }, 0);

    const totalFinancialAnomaliesCr = Math.round(
      ((costOverrunsLakhs + prematureDisbursalLakhs + (duplicateExposureCr * 100) + (totalHighRiskCostLakhs * 0.5)) / 100) * 100
    ) / 100;

    return {
      totalAudited,
      highRiskCount: highRiskAssessments.length,
      criticalRiskCount: criticalRiskAssessments.length,
      mediumRiskCount: mediumRiskAssessments.length,
      lowRiskCount: lowRiskAssessments.length,
      delayedCount: delayedProjects.length,
      delayedProjects,
      duplicateCount: duplicates.length,
      duplicateProjectsCount: duplicateProjectIds.size,
      duplicateProjectIds,
      highRiskProjectIds,
      totalHighRiskCostCr,
      duplicateExposureCr: Math.round(duplicateExposureCr * 100) / 100,
      totalFinancialAnomaliesCr,
      costOverrunsCr: Math.round((costOverrunsLakhs / 100) * 100) / 100
    };
  }, [projects, assessments, duplicates]);

  // Risk Distribution Chart Data
  const riskDistributionData = useMemo(() => {
    return [
      { name: 'Critical (81-100)', count: metrics.criticalRiskCount, color: RISK_COLORS.CRITICAL },
      { name: 'High (61-80)', count: Math.max(0, metrics.highRiskCount - metrics.criticalRiskCount), color: RISK_COLORS.HIGH },
      { name: 'Medium (31-60)', count: metrics.mediumRiskCount, color: RISK_COLORS.MEDIUM },
      { name: 'Low (0-30)', count: metrics.lowRiskCount || (metrics.totalAudited - metrics.highRiskCount - metrics.mediumRiskCount), color: RISK_COLORS.LOW }
    ];
  }, [metrics]);

  // State-wise High-Risk Breakdown
  const stateRiskData = useMemo(() => {
    const counts: Record<string, { highRisk: number; duplicate: number; delayed: number }> = {};
    
    assessments.forEach(a => {
      const proj = projects.find(p => p.id === a.projectId);
      if (!proj) return;
      const st = proj.state || 'Unknown';
      if (!counts[st]) counts[st] = { highRisk: 0, duplicate: 0, delayed: 0 };
      if (a.riskScore >= 61) counts[st].highRisk++;
      if (a.spatialDuplicateDetected) counts[st].duplicate++;
    });

    metrics.delayedProjects.forEach(p => {
      const st = p.state || 'Unknown';
      if (!counts[st]) counts[st] = { highRisk: 0, duplicate: 0, delayed: 0 };
      counts[st].delayed++;
    });

    return Object.entries(counts)
      .map(([state, data]) => ({ state, ...data, totalFlags: data.highRisk + data.duplicate + data.delayed }))
      .sort((a, b) => b.totalFlags - a.totalFlags)
      .slice(0, 8);
  }, [assessments, projects, metrics.delayedProjects]);

  // Unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => {
      if (p.state) set.add(p.state);
    });
    return Array.from(set).sort();
  }, [projects]);

  // Combined Table Rows
  const tableRows = useMemo(() => {
    return projects.filter(project => {
      const assessment = assessments.find(a => a.projectId === project.id);
      const isDuplicate = metrics.duplicateProjectIds.has(project.id);
      const isDelayed = metrics.delayedProjects.some(d => d.id === project.id);
      const isHighRisk = (assessment?.riskScore || 0) >= 61;

      // Filter by active section tab
      if (activeTabSection === 'high-risk' && !isHighRisk) return false;
      if (activeTabSection === 'duplicates' && !isDuplicate) return false;
      if (activeTabSection === 'delayed' && !isDelayed) return false;

      // Filter by risk dropdown
      if (selectedRiskFilter !== 'all') {
        const score = assessment?.riskScore || 0;
        if (selectedRiskFilter === 'CRITICAL' && score < 81) return false;
        if (selectedRiskFilter === 'HIGH' && (score < 61 || score >= 81)) return false;
        if (selectedRiskFilter === 'MEDIUM' && (score < 31 || score >= 61)) return false;
        if (selectedRiskFilter === 'LOW' && score >= 31) return false;
      }

      // Filter by state
      if (selectedStateFilter !== 'all' && project.state !== selectedStateFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = project.title.toLowerCase().includes(q);
        const matchCode = project.workCode.toLowerCase().includes(q);
        const matchDistrict = project.district.toLowerCase().includes(q);
        const matchMP = (project.mpName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchDistrict && !matchMP) return false;
      }

      return true;
    });
  }, [projects, assessments, metrics, activeTabSection, selectedRiskFilter, selectedStateFilter, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner / Header */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-xs border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xs text-[11px] font-mono uppercase tracking-wider font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>System-Wide Risk & Anomaly Intelligence</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-white">
              Risk Intelligence Dashboard
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans leading-relaxed">
              Consolidated high-level audit overview aggregating multidimensional risk metrics, 50m spatial duplicate clusters, and chronicle project milestone delays across all sanctioned works.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchRiskData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-semibold rounded-xs border border-stone-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Sync Risk Ledger'}</span>
            </button>

            {onNavigateToRiskIntelligence && (
              <button
                onClick={onNavigateToRiskIntelligence}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold rounded-xs transition-colors cursor-pointer shadow-xs"
              >
                <span>Spatial Screening & Risk Dossier</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* High Risk Projects Card */}
        <div 
          onClick={() => setActiveTabSection('high-risk')}
          className={`bg-white border p-5 rounded-xs shadow-xs transition-all cursor-pointer ${
            activeTabSection === 'high-risk'
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
              : 'border-stone-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-bold">
              High-Risk Projects
            </span>
            <div className="w-8 h-8 rounded-xs bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-rose-600">
              {metrics.highRiskCount}
            </span>
            <span className="text-xs font-mono text-stone-500">
              / {metrics.totalAudited} Works
            </span>
          </div>
          <div className="mt-2 text-xs text-stone-600 font-sans flex items-center justify-between">
            <span>Critical Tier (80+): <strong>{metrics.criticalRiskCount}</strong></span>
            <span className="font-mono text-rose-700 font-bold">₹{metrics.totalHighRiskCostCr} Cr</span>
          </div>
        </div>

        {/* Duplicates Card */}
        <div 
          onClick={() => setActiveTabSection('duplicates')}
          className={`bg-white border p-5 rounded-xs shadow-xs transition-all cursor-pointer ${
            activeTabSection === 'duplicates'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
              : 'border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-bold">
              Duplicate Projects
            </span>
            <div className="w-8 h-8 rounded-xs bg-amber-100 text-amber-700 flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-amber-600">
              {metrics.duplicateCount}
            </span>
            <span className="text-xs font-mono text-stone-500">
              Pairs ({metrics.duplicateProjectsCount} Works)
            </span>
          </div>
          <div className="mt-2 text-xs text-stone-600 font-sans flex items-center justify-between">
            <span>50m Proximity (Cl. 7.1)</span>
            <span className="font-mono text-amber-700 font-bold">₹{metrics.duplicateExposureCr} Cr Exp</span>
          </div>
        </div>

        {/* Total Financial Anomalies Card */}
        <div 
          className="bg-white border border-stone-200 hover:border-red-300 p-5 rounded-xs shadow-xs transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-bold">
              Total Financial Anomalies
            </span>
            <div className="w-8 h-8 rounded-xs bg-red-100 text-red-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-red-700">
              ₹{metrics.totalFinancialAnomaliesCr}
            </span>
            <span className="text-xs font-mono text-stone-500">
              Cr Total
            </span>
          </div>
          <div className="mt-2 text-xs text-stone-600 font-sans flex items-center justify-between">
            <span>Cost Overruns: <strong>₹{metrics.costOverrunsCr} Cr</strong></span>
            <span className="text-[11px] font-mono text-red-600 font-semibold">Audit Flagged</span>
          </div>
        </div>

        {/* Delayed Projects Card */}
        <div 
          onClick={() => setActiveTabSection('delayed')}
          className={`bg-white border p-5 rounded-xs shadow-xs transition-all cursor-pointer ${
            activeTabSection === 'delayed'
              ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
              : 'border-stone-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-bold">
              Delayed & Overdue
            </span>
            <div className="w-8 h-8 rounded-xs bg-orange-100 text-orange-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-orange-600">
              {metrics.delayedCount}
            </span>
            <span className="text-xs font-mono text-stone-500">
              Past Target Date
            </span>
          </div>
          <div className="mt-2 text-xs text-stone-600 font-sans flex items-center justify-between">
            <span>Lagging Physical Progress</span>
            <span className="font-mono text-orange-700 font-bold">
              {Math.round((metrics.delayedCount / (metrics.totalAudited || 1)) * 100)}% of Total
            </span>
          </div>
        </div>

        {/* Normal Compliance Card */}
        <div 
          onClick={() => setActiveTabSection('all')}
          className={`bg-white border p-5 rounded-xs shadow-xs transition-all cursor-pointer ${
            activeTabSection === 'all'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
              : 'border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-bold">
              Normal Compliance
            </span>
            <div className="w-8 h-8 rounded-xs bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-emerald-600">
              {metrics.lowRiskCount || (metrics.totalAudited - metrics.highRiskCount)}
            </span>
            <span className="text-xs font-mono text-stone-500">
              Low Risk Works
            </span>
          </div>
          <div className="mt-2 text-xs text-stone-600 font-sans flex items-center justify-between">
            <span>Verified Benchmarks</span>
            <span className="font-mono text-emerald-700 font-bold">Active Auditing</span>
          </div>
        </div>
      </div>

      {/* Analytical Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Breakdown (Pie / Segment) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 p-5 rounded-xs shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                Portfolio Risk Severity Tiers
              </h3>
              <span className="text-xs font-mono text-stone-500">
                {metrics.totalAudited} Works Audited
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-2 font-sans">
              Classification based on 6-factor hybrid model (ML Anomaly, Disbursal Variance, Timeline Overrun, Contractor Portfolio, and 50m Spatial Proximity).
            </p>

            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any) => [`${value} projects`, name]}
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '2px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 text-xs font-mono">
            {riskDistributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-xs bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.color }} />
                  <span className="text-stone-700 text-[11px] truncate">{item.name}</span>
                </div>
                <span className="font-bold text-stone-950">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* State-Level Risk Concentrations Bar Chart */}
        <div className="lg:col-span-7 bg-white border border-stone-200 p-5 rounded-xs shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-stone-700" />
              State-Wise Anomalies & Delays
            </h3>
            <span className="text-xs font-mono text-stone-500">
              Top 8 States by Alert Volume
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-2 font-sans">
            Comparative geographic concentration of high-risk projects, duplicate alerts, and chronic implementation delays.
          </p>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                <XAxis 
                  dataKey="state" 
                  tick={{ fontSize: 10, fill: '#57534e', fontFamily: 'monospace' }} 
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#57534e', fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#44403c', borderRadius: '2px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="highRisk" name="High Risk Works" fill="#dc2626" stackId="a" />
                <Bar dataKey="duplicate" name="Duplicate Alerts" fill="#d97706" stackId="a" />
                <Bar dataKey="delayed" name="Delayed Works" fill="#ea580c" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-mono text-stone-600">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-red-600" /> High Risk</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-amber-600" /> Spatial Duplicates</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-orange-600" /> Delayed</span>
          </div>
        </div>
      </div>

      {/* Filter & Sub-Navigation Toolbar */}
      <div className="bg-white border border-stone-200 p-4 rounded-xs shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTabSection('all')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-xs transition-colors cursor-pointer shrink-0 ${
                activeTabSection === 'all'
                  ? 'bg-stone-900 text-amber-400 font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTabSection('high-risk')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-xs transition-colors cursor-pointer shrink-0 ${
                activeTabSection === 'high-risk'
                  ? 'bg-rose-700 text-white font-bold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              High Risk ({metrics.highRiskCount})
            </button>
            <button
              onClick={() => setActiveTabSection('duplicates')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-xs transition-colors cursor-pointer shrink-0 ${
                activeTabSection === 'duplicates'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              50m Duplicates ({metrics.duplicateCount} Pairs)
            </button>
            <button
              onClick={() => setActiveTabSection('delayed')}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-xs transition-colors cursor-pointer shrink-0 ${
                activeTabSection === 'delayed'
                  ? 'bg-orange-600 text-white font-bold'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              Overdue & Delayed ({metrics.delayedCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search work code, title, district, MP..."
                className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs pl-8 pr-3 py-1.5 rounded-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">State:</span>
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="bg-stone-50 border border-stone-300 text-stone-800 px-2 py-1 rounded-xs"
            >
              <option value="all">All States & UTs</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Risk Tier:</span>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value as any)}
              className="bg-stone-50 border border-stone-300 text-stone-800 px-2 py-1 rounded-xs"
            >
              <option value="all">All Risk Tiers</option>
              <option value="CRITICAL">Critical (81 - 100)</option>
              <option value="HIGH">High (61 - 80)</option>
              <option value="MEDIUM">Medium (31 - 60)</option>
              <option value="LOW">Low (0 - 30)</option>
            </select>
          </div>

          <div className="ml-auto text-stone-500">
            Showing <strong className="text-stone-900">{tableRows.length}</strong> matching works
          </div>
        </div>
      </div>

      {/* Projects Risk Register Table */}
      <div className="bg-white border border-stone-200 rounded-xs shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-stone-600" />
            <span className="font-serif font-bold text-sm text-stone-900">
              System Risk Registry & Audit Status
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Click row to view full project audit dossier
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/75 border-b border-stone-200 font-mono text-[11px] uppercase tracking-wider text-stone-600">
              <tr>
                <th className="py-2.5 px-4">Work Code / Title</th>
                <th className="py-2.5 px-3">Location & MP</th>
                <th className="py-2.5 px-3">Cost & Disbursed</th>
                <th className="py-2.5 px-3">Status & Progress</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3">Anomaly Indicators</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 font-mono">
                    No projects match the selected risk criteria.
                  </td>
                </tr>
              ) : (
                tableRows.map((project) => {
                  const assessment = assessments.find(a => a.projectId === project.id);
                  const isDuplicate = metrics.duplicateProjectIds.has(project.id);
                  const isDelayed = metrics.delayedProjects.some(d => d.id === project.id);
                  const score = assessment?.riskScore || 0;
                  const category = assessment?.riskCategory || (score >= 81 ? 'CRITICAL' : score >= 61 ? 'HIGH' : score >= 31 ? 'MEDIUM' : 'LOW');

                  return (
                    <tr 
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Work Code & Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-mono text-[10px] text-stone-500 uppercase font-semibold">
                          {project.workCode}
                        </div>
                        <div className="font-serif font-bold text-stone-900 group-hover:text-amber-800 line-clamp-1">
                          {project.title}
                        </div>
                        <div className="text-[11px] text-stone-500 font-sans">
                          Sector: {project.sector}
                        </div>
                      </td>

                      {/* Location & MP */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-stone-900 font-medium">
                          {project.district}, {project.state}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {project.mpName || 'MP Not Recorded'}
                        </div>
                      </td>

                      {/* Cost & Disbursed */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        <div className="font-bold text-stone-900">
                          ₹{project.sanctionedCostFormatted}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Spent: ₹{project.expenditureFormatted}
                        </div>
                      </td>

                      {/* Status & Progress */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs ${
                            project.workStatus === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-900'
                              : project.workStatus === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {project.workStatus}
                          </span>
                          <span className="font-mono text-xs font-semibold text-stone-800">
                            {project.physicalProgress}%
                          </span>
                        </div>
                        {isDelayed && (
                          <div className="text-[10px] font-mono text-orange-600 flex items-center gap-1 mt-0.5 font-bold">
                            <Clock className="w-3 h-3" />
                            Overdue milestone
                          </div>
                        )}
                      </td>

                      {/* Risk Assessment Score */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-xs border ${
                            category === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : category === 'HIGH'
                              ? 'bg-red-100 text-red-900 border-red-300'
                              : category === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {score}/100 • {category}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-500 mt-0.5">
                          {assessment?.confidence || 'HIGH'} Confidence
                        </div>
                      </td>

                      {/* Anomaly Indicators */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {isDuplicate && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-mono font-bold rounded-xs border border-amber-300">
                              <Copy className="w-2.5 h-2.5" />
                              50m Duplicate
                            </span>
                          )}
                          {isDelayed && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-900 text-[9px] font-mono font-bold rounded-xs border border-orange-300">
                              <Clock className="w-2.5 h-2.5" />
                              Delayed
                            </span>
                          )}
                          {project.expenditure >= project.sanctionedCost && project.physicalProgress < 50 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 text-rose-900 text-[9px] font-mono font-bold rounded-xs border border-rose-300">
                              Disbursal Gap
                            </span>
                          )}
                          {!isDuplicate && !isDelayed && score < 31 && (
                            <span className="text-stone-400 text-[10px] font-mono">
                              None flagged
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-700 group-hover:text-amber-900">
                          Inspect Dossier
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
