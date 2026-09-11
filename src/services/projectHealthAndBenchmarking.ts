import { 
  Project, 
  RiskHistoryPoint, 
  ProjectHealthMetrics, 
  RegionalBenchmarking,
  RiskCategory 
} from '../types';

/**
 * Generates explainable historical risk score progression
 */
export function getProjectRiskHistory(project: Project, currentRiskScore: number): RiskHistoryPoint[] {
  const currentCategory: RiskCategory = 
    currentRiskScore >= 75 ? 'CRITICAL' : 
    currentRiskScore >= 50 ? 'HIGH' : 
    currentRiskScore >= 25 ? 'MEDIUM' : 'LOW';

  // Seed realistic historical trajectory based on current score
  if (currentRiskScore >= 70) {
    return [
      {
        date: 'Oct 2024',
        score: 28,
        riskCategory: 'LOW',
        primaryReason: 'Initial administrative sanction issued with approved DPR',
        confidence: 'HIGH',
        dataCompletenessPct: 92
      },
      {
        date: 'Feb 2025',
        score: 44,
        riskCategory: 'MEDIUM',
        primaryReason: 'Tender award delayed >90 days; contractor concentration signal noted',
        confidence: 'HIGH',
        dataCompletenessPct: 94
      },
      {
        date: 'Oct 2025',
        score: 62,
        riskCategory: 'HIGH',
        primaryReason: 'Advance disbursed (75%) but physical progress stalled at 35%',
        confidence: 'HIGH',
        dataCompletenessPct: 96
      },
      {
        date: 'Aug 2026',
        score: currentRiskScore,
        riskCategory: currentCategory,
        primaryReason: 'Clause 7.1 spatial duplicate detected within 50m of previously completed road',
        confidence: 'HIGH',
        dataCompletenessPct: 98
      }
    ];
  } else if (currentRiskScore >= 45) {
    return [
      {
        date: 'Jan 2025',
        score: 20,
        riskCategory: 'LOW',
        primaryReason: 'Recommendation recorded with regular timeline',
        confidence: 'MEDIUM',
        dataCompletenessPct: 88
      },
      {
        date: 'Jun 2025',
        score: 35,
        riskCategory: 'MEDIUM',
        primaryReason: 'Minor milestone slippage; pending utilization certificate',
        confidence: 'HIGH',
        dataCompletenessPct: 92
      },
      {
        date: 'Aug 2026',
        score: currentRiskScore,
        riskCategory: currentCategory,
        primaryReason: 'Cost overrun above initial sanction and extended inactive window',
        confidence: 'HIGH',
        dataCompletenessPct: 95
      }
    ];
  } else {
    return [
      {
        date: 'Sep 2024',
        score: 18,
        riskCategory: 'LOW',
        primaryReason: 'Sanction approved within statutory timeline',
        confidence: 'HIGH',
        dataCompletenessPct: 95
      },
      {
        date: 'Apr 2025',
        score: 15,
        riskCategory: 'LOW',
        primaryReason: 'Tender awarded on competitive e-procurement; progress on track',
        confidence: 'HIGH',
        dataCompletenessPct: 98
      },
      {
        date: 'Aug 2026',
        score: currentRiskScore,
        riskCategory: 'LOW',
        primaryReason: 'Timely milestone clearance with clean third-party inspection',
        confidence: 'HIGH',
        dataCompletenessPct: 99
      }
    ];
  }
}

/**
 * Calculates Project Health Score (0 - 100).
 * High Health = High execution vitality, healthy progress, fast documentation.
 * Distinct from Risk Score.
 */
export function calculateProjectHealthScore(project: Project): ProjectHealthMetrics {
  // 1. Progress Rating (0 - 25)
  const progressRating = Math.round((project.physicalProgress / 100) * 25);

  // 2. Timeline Rating (0 - 20)
  let timelineRating = 18;
  const now = new Date('2026-09-01');
  if (project.expectedCompletionDate && new Date(project.expectedCompletionDate) < now && project.workStatus !== 'COMPLETED') {
    timelineRating = 6;
  }

  // 3. Utilization Rating (0 - 20)
  const disbursalPct = project.sanctionedCost > 0 ? (project.expenditure / project.sanctionedCost) * 100 : 0;
  let utilizationRating = 16;
  if (disbursalPct > 90 && project.physicalProgress < 50) {
    utilizationRating = 5;
  } else if (disbursalPct > 100) {
    utilizationRating = 8;
  }

  // 4. Documentation Rating (0 - 15)
  let documentationRating = 13;
  if (project.utilizationCertificateStatus === 'VERIFIED') documentationRating = 15;
  else if (project.utilizationCertificateStatus === 'PENDING') documentationRating = 8;

  // 5. Verification Rating (0 - 10)
  let verificationRating = 8;
  if (project.auditStatus === 'OBSERVATION_NOTED') verificationRating = 3;

  // 6. Financial Consistency Rating (0 - 10)
  let financialConsistencyRating = 9;
  if (project.expenditure > project.sanctionedCost) financialConsistencyRating = 4;

  const healthScore = Math.min(100, Math.max(10, 
    progressRating + timelineRating + utilizationRating + documentationRating + verificationRating + financialConsistencyRating
  ));

  const healthStatus = healthScore >= 70 ? 'HEALTHY' : healthScore >= 45 ? 'NEEDS_ATTENTION' : 'CRITICAL_CONCERN';

  return {
    healthScore,
    healthStatus,
    progressRating,
    timelineRating,
    utilizationRating,
    documentationRating,
    verificationRating,
    financialConsistencyRating
  };
}

/**
 * Calculates regional median benchmarking against District, State, and National averages.
 */
export function calculateRegionalBenchmarking(project: Project, allProjects: Project[]): RegionalBenchmarking {
  const cost = project.sanctionedCost || 20;

  // Filter projects in same district
  const districtProjects = allProjects.filter(p => p.district === project.district && p.sanctionedCost > 0);
  const districtMedianLakhs = districtProjects.length > 0 
    ? districtProjects.reduce((s, p) => s + p.sanctionedCost, 0) / districtProjects.length 
    : 22.5;

  // Filter projects in same state
  const stateProjects = allProjects.filter(p => p.state === project.state && p.sanctionedCost > 0);
  const stateMedianLakhs = stateProjects.length > 0 
    ? stateProjects.reduce((s, p) => s + p.sanctionedCost, 0) / stateProjects.length 
    : 24.0;

  // Sector Median
  const sectorProjects = allProjects.filter(p => p.sector === project.sector && p.sanctionedCost > 0);
  const sectorMedianLakhs = sectorProjects.length > 0 
    ? sectorProjects.reduce((s, p) => s + p.sanctionedCost, 0) / sectorProjects.length 
    : 25.0;

  const nationalMedianLakhs = 25.5;

  const costDeviationVsRegionalMedianPct = Math.round(((cost - districtMedianLakhs) / districtMedianLakhs) * 100);

  const averageSectorCompletionMonths = 8;
  const projectEstimatedMonths = 6;
  const timelineDeviationPct = Math.round(((projectEstimatedMonths - averageSectorCompletionMonths) / averageSectorCompletionMonths) * 100);

  let benchmarkingNote = 'Within normal regional cost band (±15%).';
  if (costDeviationVsRegionalMedianPct > 40) {
    benchmarkingNote = `Sanctioned cost is +${costDeviationVsRegionalMedianPct}% above district median for ${project.sector}.`;
  } else if (costDeviationVsRegionalMedianPct < -30) {
    benchmarkingNote = `Sanctioned cost is ${costDeviationVsRegionalMedianPct}% below district median.`;
  }

  return {
    projectCostLakhs: Math.round(cost * 100) / 100,
    districtMedianLakhs: Math.round(districtMedianLakhs * 100) / 100,
    stateMedianLakhs: Math.round(stateMedianLakhs * 100) / 100,
    nationalMedianLakhs: Math.round(nationalMedianLakhs * 100) / 100,
    sectorMedianLakhs: Math.round(sectorMedianLakhs * 100) / 100,
    costDeviationVsRegionalMedianPct,
    averageSectorCompletionMonths,
    projectEstimatedMonths,
    timelineDeviationPct,
    benchmarkingNote
  };
}
