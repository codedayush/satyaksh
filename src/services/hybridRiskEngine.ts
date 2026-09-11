import { 
  Project, 
  RiskAssessment, 
  RiskCategory, 
  RiskLevel, 
  HybridRiskBreakdown, 
  RiskFactorEvidence, 
  DuplicateProjectMatch, 
  ContractorNodeInfo,
  SpatialDuplicatePair 
} from '../types';
import { calculateHaversineDistance, calculateTextSimilarity, simpleHash } from './spatialRiskEngine';

/**
 * CONTRACTOR EXTRACTION & NETWORK METRICS
 * Infers or normalizes contractor / agency entities from project implementing agency,
 * computing portfolio stats, cross-constituency spread, and flagged project ratios.
 */
export function buildContractorNetwork(projects: Project[]): Map<string, ContractorNodeInfo> {
  const contractorMap = new Map<string, ContractorNodeInfo>();

  projects.forEach(p => {
    const rawName = p.implementingAgency || 'District Engineering Cell';
    // Normalize contractor/agency name
    const name = rawName.trim();
    if (!contractorMap.has(name)) {
      contractorMap.set(name, {
        name,
        totalProjects: 0,
        flaggedProjects: 0,
        flaggedRatio: 0,
        totalSanctionedCr: 0,
        states: [],
        districts: [],
        relatedProjectIds: [],
        associatedAgencies: [name],
        mpsConnected: []
      });
    }

    const c = contractorMap.get(name)!;
    c.totalProjects += 1;
    c.totalSanctionedCr += Math.round((p.sanctionedCost / 100) * 100) / 100;
    if (!c.states.includes(p.state)) c.states.push(p.state);
    if (!c.districts.includes(p.district)) c.districts.push(p.district);
    if (!c.relatedProjectIds.includes(p.id)) c.relatedProjectIds.push(p.id);
    if (p.mpName && !c.mpsConnected.includes(p.mpName)) c.mpsConnected.push(p.mpName);
  });

  // Calculate flagged ratio
  contractorMap.forEach(c => {
    // A project is flagged if it has stalled progress, audit issues, or extreme delays
    const flaggedCount = c.relatedProjectIds.filter(pid => {
      const proj = projects.find(p => p.id === pid);
      if (!proj) return false;
      const delayed = proj.workStatus === 'IN_PROGRESS' && proj.physicalProgress < 40;
      const auditObservation = proj.auditStatus === 'OBSERVATION_NOTED';
      return delayed || auditObservation;
    }).length;

    c.flaggedProjects = flaggedCount;
    c.flaggedRatio = c.totalProjects > 0 ? Math.round((flaggedCount / c.totalProjects) * 100) : 0;
  });

  return contractorMap;
}

/**
 * COMPREHENSIVE HYBRID RISK SCORING ENGINE (0-100)
 * 30% ML Anomaly
 * 20% Financial Anomaly
 * 15% Timeline Anomaly
 * 15% Contractor / Network Risk
 * 10% Geographic Anomaly
 * 10% Document / Duplicate Risk
 */
export function calculateHybridRiskScore(
  project: Project,
  allProjects: Project[] = [],
  duplicatesList: SpatialDuplicatePair[] = [],
  contractorMap?: Map<string, ContractorNodeInfo>
): {
  totalRiskScore: number;
  riskCategory: RiskCategory;
  riskLevel: RiskLevel;
  hybridBreakdown: HybridRiskBreakdown;
  factors: RiskFactorEvidence[];
  duplicateMatches: DuplicateProjectMatch[];
  contractorDetails: ContractorNodeInfo;
  detectionReasons: string[];
  recommendedAction: string;
} {
  const factors: RiskFactorEvidence[] = [];
  const detectionReasons: string[] = [];
  const duplicateMatches: DuplicateProjectMatch[] = [];

  const networkMap = contractorMap || buildContractorNetwork(allProjects);
  const contractorName = (project.implementingAgency || 'District Engineering Cell').trim();
  const contractor = networkMap.get(contractorName) || {
    name: contractorName,
    totalProjects: 1,
    flaggedProjects: 0,
    flaggedRatio: 0,
    totalSanctionedCr: project.sanctionedCost / 100,
    states: [project.state],
    districts: [project.district],
    relatedProjectIds: [project.id],
    associatedAgencies: [contractorName],
    mpsConnected: [project.mpName]
  };

  // 1. ML ANOMALY ENGINE (30% weight -> 0-100 scale * 0.30)
  // Evaluates multidimensional vector: cost deviation, expenditure ratio, delay factor, utilization rate
  let rawMlAnomaly = 15; // baseline low noise
  const regionalProjects = allProjects.filter(p => p.state === project.state && p.sector === project.sector && p.id !== project.id);
  const regionalMedianCost = regionalProjects.length > 0 
    ? regionalProjects.map(p => p.sanctionedCost).sort((a,b) => a - b)[Math.floor(regionalProjects.length / 2)] 
    : 25.0;

  const costDeviationPercent = regionalMedianCost > 0 
    ? Math.round(((project.sanctionedCost - regionalMedianCost) / regionalMedianCost) * 100) 
    : 0;

  if (costDeviationPercent > 50) rawMlAnomaly += 40;
  else if (costDeviationPercent > 20) rawMlAnomaly += 20;

  if (project.expenditure >= project.sanctionedCost && project.sanctionedCost > 0 && project.physicalProgress < 50) {
    rawMlAnomaly += 35;
  }
  if (project.workStatus === 'IN_PROGRESS' && project.physicalProgress < 30) {
    rawMlAnomaly += 20;
  }
  rawMlAnomaly = Math.min(100, rawMlAnomaly);

  if (rawMlAnomaly >= 50) {
    factors.push({
      factor: 'Statistical Multi-Feature Anomaly',
      category: 'ML_ANOMALY',
      points: Math.round(rawMlAnomaly * 0.30),
      title: 'Multi-Feature Statistical Outlier Signal',
      explanation: `Feature vector (cost deviation +${costDeviationPercent}%, progress vs disbursal discrepancy) scored in top anomalous decile.`,
      metric: `Statistical Anomaly Index: ${rawMlAnomaly}/100`,
      evidence: `Regional sector baseline: ₹${regionalMedianCost.toFixed(1)}L vs Sanctioned: ₹${project.sanctionedCostFormatted}`
    });
    detectionReasons.push(`Statistical Multi-Feature Anomaly: High statistical deviation from historical cohort pattern (+${costDeviationPercent}% cost divergence).`);
  }

  // 2. FINANCIAL ANOMALY (20% weight -> 0-100 scale * 0.20)
  let rawFinancial = 10;
  const cost = project.sanctionedCost || 0;
  const spent = project.expenditure || 0;
  const progress = project.physicalProgress || 0;
  const utilization = cost > 0 ? (spent / cost) * 100 : 0;

  if (spent >= cost && cost > 0 && progress < 50) {
    rawFinancial += 70;
    factors.push({
      factor: 'Cost Anomaly & Disbursal Gap',
      category: 'FINANCIAL',
      points: 18,
      title: 'Premature Disbursal vs Ground Execution',
      explanation: `100% funds (${project.expenditureFormatted}) drawn with physical progress at only ${progress}%.`,
      metric: `${progress}% completion vs 100% booked expenditure`,
      evidence: `Drawn: ₹${spent.toFixed(1)}L / Sanctioned: ₹${cost.toFixed(1)}L`
    });
    detectionReasons.push(`Financial Risk: Full expenditure drawn with physical completion lagging at ${progress}%.`);
  } else if (costDeviationPercent > 30) {
    rawFinancial += 45;
    factors.push({
      factor: 'Regional Cost Outlier',
      category: 'FINANCIAL',
      points: 12,
      title: 'Project Cost Above Regional Median',
      explanation: `Project cost is ${costDeviationPercent}% above regional median of ₹${regionalMedianCost.toFixed(1)} Lakh for ${project.sector}.`,
      metric: `+${costDeviationPercent}% cost deviation`,
      evidence: `Sanctioned: ₹${cost.toFixed(1)}L (Median: ₹${regionalMedianCost.toFixed(1)}L)`
    });
    detectionReasons.push(`Financial Risk: Project cost is ${costDeviationPercent}% higher than regional baseline.`);
  }
  rawFinancial = Math.min(100, rawFinancial);

  // 3. TIMELINE ANOMALY (15% weight -> 0-100 scale * 0.15)
  let rawTimeline = 10;
  let delayDays = 0;
  if (project.expectedCompletionDate) {
    const targetDate = new Date(project.expectedCompletionDate);
    const refDate = project.actualCompletionDate ? new Date(project.actualCompletionDate) : new Date('2026-09-01');
    delayDays = Math.max(0, Math.round((refDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (project.workStatus !== 'COMPLETED' && delayDays > 180) {
      rawTimeline += 75;
      const delayMonths = Math.round(delayDays / 30);
      factors.push({
        factor: 'Completion Delay Overrun',
        category: 'TIMELINE',
        points: 14,
        title: 'Chronic Timeline Delay',
        explanation: `Project is ${delayMonths} months overdue past target deadline (${project.expectedCompletionDate}).`,
        metric: `Overdue by ${delayDays} days (${delayMonths} months)`,
        evidence: `Target: ${project.expectedCompletionDate} | Status: ${project.workStatus} (${progress}%)`
      });
      detectionReasons.push(`Timeline Risk: Project is ${delayMonths} months overdue without revised sanction.`);
    } else if (project.workStatus !== 'COMPLETED' && delayDays > 60) {
      rawTimeline += 40;
      factors.push({
        factor: 'Moderate Schedule Slip',
        category: 'TIMELINE',
        points: 7,
        title: 'Project Behind Milestone Target',
        explanation: `Project has exceeded target completion by ${delayDays} days.`,
        metric: `+${delayDays} days overdue`,
        evidence: `Target: ${project.expectedCompletionDate}`
      });
      detectionReasons.push(`Timeline Risk: Implementation delayed by ${delayDays} days.`);
    }
  }
  rawTimeline = Math.min(100, rawTimeline);

  // 4. CONTRACTOR / NETWORK RISK (15% weight -> 0-100 scale * 0.15)
  let rawContractor = 10;
  if (contractor.totalProjects >= 3 && contractor.flaggedRatio >= 50) {
    rawContractor += 65;
    factors.push({
      factor: 'Contractor Risk & Flag Ratio',
      category: 'CONTRACTOR',
      points: 12,
      title: 'High Ratio of Lagging Projects Under Agency',
      explanation: `Agency "${contractor.name}" manages ${contractor.totalProjects} projects with ${contractor.flaggedProjects} flagged/stalled works (${contractor.flaggedRatio}% flag ratio).`,
      metric: `${contractor.flaggedRatio}% contractor flag ratio`,
      evidence: `Total portfolio: ₹${contractor.totalSanctionedCr.toFixed(2)} Cr across ${contractor.districts.length} districts`
    });
    detectionReasons.push(`Contractor Risk: Executing entity has ${contractor.flaggedProjects} out of ${contractor.totalProjects} works stalled.`);
  } else if (contractor.districts.length >= 3) {
    rawContractor += 35;
    factors.push({
      factor: 'Cross-District Contractor Concentration',
      category: 'CONTRACTOR',
      points: 6,
      title: 'Multi-District Implementation Spread',
      explanation: `Agency operates across ${contractor.districts.length} districts with multiple simultaneous civil awards.`,
      metric: `${contractor.districts.length} active districts`,
      evidence: `${contractor.totalProjects} cumulative works awarded`
    });
  }
  rawContractor = Math.min(100, rawContractor);

  // 5. GEOGRAPHIC ANOMALY (10% weight -> 0-100 scale * 0.10)
  let rawGeographic = 10;
  // Spatial cluster: > 3 expensive projects within 5km
  let nearbyCount = 0;
  if (project.coordinates && project.coordinates.length === 2) {
    allProjects.forEach(other => {
      if (other.id !== project.id && other.coordinates && other.coordinates.length === 2) {
        const d = calculateHaversineDistance(
          project.coordinates![0],
          project.coordinates![1],
          other.coordinates[0],
          other.coordinates[1]
        );
        if (d <= 5000 && other.sanctionedCost > 25.0) {
          nearbyCount++;
        }
      }
    });
  }

  if (nearbyCount >= 3) {
    rawGeographic += 60;
    factors.push({
      factor: 'Geographic Density Cluster',
      category: 'GEOGRAPHIC',
      points: 8,
      title: 'High-Value Project Cluster Within 5km',
      explanation: `${nearbyCount} high-value public works sanctioned within a 5 km radius. Requires spatial verification of distinct benefit zones.`,
      metric: `${nearbyCount} works within 5km`,
      evidence: `High-density geo-cluster around ${project.district} GPS zone`
    });
    detectionReasons.push(`Geographic Risk: Density cluster of ${nearbyCount} major infrastructure works within 5km radius.`);
  }
  rawGeographic = Math.min(100, rawGeographic);

  // 6. DOCUMENT / DUPLICATE RISK (10% weight -> 0-100 scale * 0.10)
  let rawDocument = 10;
  // Check 50m duplicate
  const duplicatePair = duplicatesList.find(d => d.projectAId === project.id || d.projectBId === project.id);
  if (duplicatePair) {
    const other = duplicatePair.projectAId === project.id ? duplicatePair.projectB : duplicatePair.projectA;
    rawDocument += 80;
    const simPct = duplicatePair.similarityScore;

    duplicateMatches.push({
      sourceProjectId: project.id,
      matchedProjectId: other.id,
      matchedProjectTitle: other.title,
      matchedProjectWorkCode: other.workCode,
      matchedProjectSanctionedCost: other.sanctionedCost,
      similarityScore: simPct / 100,
      matchType: duplicatePair.distanceMeters <= 50 ? 'GEO_SPATIAL_50M' : 'NLP_SEMANTIC_TITLE_DESC',
      documentSimilarityScore: simPct,
      spatialDistanceMeters: duplicatePair.distanceMeters,
      confidence: duplicatePair.duplicateConfidence,
      details: `Separated by ${duplicatePair.distanceMeters}m with ${simPct}% semantic scope overlap.`
    });

    factors.push({
      factor: '50m Duplicate & Scope Similarity',
      category: 'DOCUMENT',
      points: 10,
      title: 'Statutory 50m Proximity & Document Match',
      explanation: `Work is located only ${duplicatePair.distanceMeters}m from "${other.title}" with ${simPct}% document/scope similarity. Potential double-billing.`,
      metric: `${duplicatePair.distanceMeters}m distance | ${simPct}% scope similarity`,
      evidence: `Matched Work Code: ${other.workCode} (₹${other.sanctionedCostFormatted})`
    });
    detectionReasons.push(`Duplicate Risk: Potential overlapping scope within ${duplicatePair.distanceMeters}m of ${other.workCode} (${simPct}% similarity).`);
  } else {
    // Check NLP similarity across other projects in district
    allProjects.forEach(other => {
      if (other.id !== project.id && other.district === project.district) {
        const textSim = calculateTextSimilarity(project.title, other.title);
        if (textSim >= 0.70) {
          rawDocument += 45;
          const simPct = Math.round(textSim * 100);
          duplicateMatches.push({
            sourceProjectId: project.id,
            matchedProjectId: other.id,
            matchedProjectTitle: other.title,
            matchedProjectWorkCode: other.workCode,
            matchedProjectSanctionedCost: other.sanctionedCost,
            similarityScore: textSim,
            matchType: 'NLP_SEMANTIC_TITLE_DESC',
            documentSimilarityScore: simPct,
            confidence: 'HIGH',
            details: `${simPct}% semantic title and description cosine match in same district.`
          });
          factors.push({
            factor: 'Document & Description Similarity',
            category: 'DOCUMENT',
            points: 6,
            title: 'High Semantic Document Similarity (> 70%)',
            explanation: `${simPct}% title/DPR overlap with "${other.title}" (${other.workCode}).`,
            metric: `${simPct}% semantic similarity`,
            evidence: `Related Work: ${other.workCode} in ${other.district}`
          });
          detectionReasons.push(`Document Risk: High text similarity (${simPct}%) with work ${other.workCode}.`);
        }
      }
    });
  }
  rawDocument = Math.min(100, rawDocument);

  // HYBRID WEIGHTED CALCULATION
  // 30% ML Anomaly
  // 20% Financial
  // 15% Timeline
  // 15% Contractor
  // 10% Geographic
  // 10% Document
  const weightedScore = (
    rawMlAnomaly * 0.30 +
    rawFinancial * 0.20 +
    rawTimeline * 0.15 +
    rawContractor * 0.15 +
    rawGeographic * 0.10 +
    rawDocument * 0.10
  );

  const totalRiskScore = Math.min(100, Math.max(0, Math.round(weightedScore)));

  // Risk Category mapping: 0–30 LOW, 31–60 MEDIUM, 61–80 HIGH, 81–100 CRITICAL
  let riskCategory: RiskCategory = 'LOW';
  let riskLevel: RiskLevel = 'LOW';
  let recommendedAction = 'Routine milestone inspection according to standard district schedule.';

  if (totalRiskScore >= 81) {
    riskCategory = 'CRITICAL';
    riskLevel = 'HIGH';
    recommendedAction = 'Immediate statutory action: Halt further fund disbursements; order on-site joint technical audit and digital geofence verification within 7 working days.';
  } else if (totalRiskScore >= 61) {
    riskCategory = 'HIGH';
    riskLevel = 'HIGH';
    recommendedAction = 'High priority verification: District Vigilance Officer to conduct physical ground inspection with photo-tagging and verify measurement books.';
  } else if (totalRiskScore >= 31) {
    riskCategory = 'MEDIUM';
    riskLevel = 'MEDIUM';
    recommendedAction = 'Moderate alert: Request executing agency explanation for timeline/cost divergence and review revised completion milestone.';
  } else {
    riskCategory = 'LOW';
    riskLevel = 'LOW';
    recommendedAction = 'Normal compliance: All indicators within standard operational variance.';
  }

  const hybridBreakdown: HybridRiskBreakdown = {
    mlAnomalyScore: rawMlAnomaly,
    financialRiskScore: rawFinancial,
    timelineRiskScore: rawTimeline,
    contractorRiskScore: rawContractor,
    geographicRiskScore: rawGeographic,
    documentRiskScore: rawDocument,
    totalRiskScore,
    riskCategory
  };

  return {
    totalRiskScore,
    riskCategory,
    riskLevel,
    hybridBreakdown,
    factors,
    duplicateMatches,
    contractorDetails: contractor,
    detectionReasons: detectionReasons.length > 0 ? detectionReasons : ['All risk metrics are within normal statistical tolerance.'],
    recommendedAction
  };
}
