/**
 * SATYAKSH MPLADS Risk Engine (Backend Service)
 * Path: src/server/riskEngine.ts
 * 
 * Provides:
 * 1. Haversine-based 50-meter spatial distance calculation and duplicate detection
 *    adhering to MPLADS Guidelines Clause 7.1 (Anti-Duplication & Geo-Spatial Validation).
 * 2. Multi-factor project risk scoring engine evaluating project attributes including:
 *    - Cost deviation (financial overrun and premature disbursal gaps)
 *    - Delay days (overdue completion milestones)
 *    - Physical vs financial progress discrepancies
 *    - Spatial proximity & duplicate alerts within 50 meters
 *    - Utilization certificate (UC) and statutory audit compliance
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export type CoordinateTuple = [number, number]; // [latitude, longitude]

export interface ProjectRiskInput {
  id: string;
  workCode: string;
  title: string;
  sanctionedCost: number; // in ₹ Lakhs or numeric currency unit
  expenditure: number;    // in ₹ Lakhs or numeric currency unit
  recommendedCost?: number;
  workStatus: string;    // 'COMPLETED' | 'IN_PROGRESS' | 'SANCTIONED' | 'RECOMMENDED' | 'UNDER_AUDIT'
  physicalProgress?: number; // 0 to 100
  sanctionDate?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  coordinates?: CoordinateTuple | null;
  sector?: string;
  district?: string;
  state?: string;
  implementingAgency?: string;
  utilizationCertificateStatus?: 'SUBMITTED' | 'PENDING' | 'VERIFIED' | string;
  auditStatus?: 'CLEARED' | 'OBSERVATION_NOTED' | 'PENDING' | string;
}

export interface CostDeviationAnalysis {
  sanctionedCost: number;
  expenditure: number;
  varianceAmount: number;     // expenditure - sanctionedCost
  variancePercentage: number; // ((expenditure - sanctionedCost) / sanctionedCost) * 100
  isOverrun: boolean;
  disbursalRatio: number;     // expenditure / sanctionedCost
  disbursalProgressGap: number; // (disbursalRatio * 100) - physicalProgress
  riskScore: number;          // 0 - 100
  flags: string[];
}

export interface DelayDaysAnalysis {
  expectedCompletionDate: string | null;
  actualCompletionDate: string | null;
  delayDays: number;
  isDelayed: boolean;
  delayCategory: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CHRONIC';
  riskScore: number;          // 0 - 100
  description: string;
}

export interface SpatialProximityMatch {
  candidateId: string;
  candidateWorkCode: string;
  candidateTitle: string;
  distanceMeters: number;
  isWithin50Meters: boolean;
  coordinates: CoordinateTuple;
}

export interface RiskFactorScores {
  costDeviationScore: number;        // Weight: 30%
  delayScore: number;                // Weight: 25%
  progressDiscrepancyScore: number;  // Weight: 20%
  spatialProximityScore: number;     // Weight: 15%
  complianceScore: number;           // Weight: 10%
}

export interface ProjectRiskEvaluation {
  projectId: string;
  workCode: string;
  title: string;
  overallRiskScore: number;          // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  costDeviation: CostDeviationAnalysis;
  delayDays: DelayDaysAnalysis;
  factorScores: RiskFactorScores;
  spatialDuplicateDetected: boolean;
  spatialMatchesWithin50m: SpatialProximityMatch[];
  riskFlags: string[];
  recommendedAction: string;
  evaluatedAt: string;
  verificationHash: string;
}

export interface RiskScoringOptions {
  referenceDate?: Date | string; // Date used to calculate delays for incomplete projects (default: 2026-09-01)
  spatialThresholdMeters?: number; // Distance threshold for spatial duplicates (default: 50)
  weights?: {
    costDeviation?: number;
    delay?: number;
    progressDiscrepancy?: number;
    spatialProximity?: number;
    compliance?: number;
  };
  otherProjects?: ProjectRiskInput[]; // Peer projects to check 50m spatial duplicate collisions against
}

// Earth equatorial radius in meters (WGS-84 standard ellipsoid approximation)
export const EARTH_RADIUS_METERS = 6371000;

// Statutory MPLADS duplicate proximity threshold (Clause 7.1)
export const SPATIAL_DUPLICATE_THRESHOLD_METERS = 50;

/**
 * ============================================================================
 * 1. HAVERSINE-BASED 50-METER SPATIAL DISTANCE ENGINE
 * ============================================================================
 */

/**
 * Computes geodesic distance between two coordinate pairs using Haversine formula.
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Geodesic distance in meters (rounded to 1 decimal place)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Validate coordinates
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return Infinity;
  }

  // Check latitude bounds [-90, 90] and longitude bounds [-180, 180]
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
    return Infinity;
  }

  // Exact identical coordinates return 0
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = EARTH_RADIUS_METERS * c;

  return Math.round(distanceMeters * 10) / 10;
}

/**
 * Calculates distance in meters between two [latitude, longitude] tuples.
 */
export function calculateDistanceBetweenTuples(
  coord1: CoordinateTuple,
  coord2: CoordinateTuple
): number {
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) {
    return Infinity;
  }
  return calculateHaversineDistance(coord1[0], coord1[1], coord2[0], coord2[1]);
}

/**
 * Checks if two coordinate locations are within the 50-meter statutory duplicate threshold.
 * @param coord1 First coordinate tuple [lat, lon]
 * @param coord2 Second coordinate tuple [lat, lon]
 * @param thresholdMeters Threshold in meters (default: 50m)
 */
export function isWithin50Meters(
  coord1: CoordinateTuple | null | undefined,
  coord2: CoordinateTuple | null | undefined,
  thresholdMeters: number = SPATIAL_DUPLICATE_THRESHOLD_METERS
): boolean {
  if (!coord1 || !coord2) return false;
  const distance = calculateDistanceBetweenTuples(coord1, coord2);
  return distance <= thresholdMeters;
}

/**
 * Scans a project coordinate against a pool of other projects to detect any works within 50m.
 */
export function findNearbyProjectsWithin50m(
  targetProject: ProjectRiskInput,
  candidatePool: ProjectRiskInput[],
  thresholdMeters: number = SPATIAL_DUPLICATE_THRESHOLD_METERS
): SpatialProximityMatch[] {
  if (!targetProject.coordinates) return [];

  const matches: SpatialProximityMatch[] = [];

  for (const candidate of candidatePool) {
    if (candidate.id === targetProject.id || !candidate.coordinates) continue;

    const distance = calculateDistanceBetweenTuples(targetProject.coordinates, candidate.coordinates);
    if (distance <= thresholdMeters) {
      matches.push({
        candidateId: candidate.id,
        candidateWorkCode: candidate.workCode,
        candidateTitle: candidate.title,
        distanceMeters: distance,
        isWithin50Meters: true,
        coordinates: candidate.coordinates
      });
    }
  }

  // Sort closest first
  return matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/**
 * ============================================================================
 * 2. COST DEVIATION & FINANCIAL VARIANCE ANALYSIS
 * ============================================================================
 */

/**
 * Analyzes cost deviation, spending overrun, and physical vs disbursal dissonance.
 */
export function analyzeCostDeviation(
  sanctionedCost: number,
  expenditure: number,
  physicalProgress: number = 0,
  workStatus: string = 'IN_PROGRESS'
): CostDeviationAnalysis {
  const cleanSanctioned = Math.max(0, sanctionedCost || 0);
  const cleanExpenditure = Math.max(0, expenditure || 0);
  const varianceAmount = Math.round((cleanExpenditure - cleanSanctioned) * 100) / 100;
  
  const variancePercentage = cleanSanctioned > 0
    ? Math.round(((cleanExpenditure - cleanSanctioned) / cleanSanctioned) * 1000) / 10
    : 0;

  const isOverrun = cleanExpenditure > cleanSanctioned;
  const disbursalRatio = cleanSanctioned > 0
    ? Math.round((cleanExpenditure / cleanSanctioned) * 100) / 100
    : 0;

  const disbursalPercentage = disbursalRatio * 100;
  const disbursalProgressGap = Math.round((disbursalPercentage - physicalProgress) * 10) / 10;

  const flags: string[] = [];
  let riskScore = 0;

  // 1. Cost Overrun Checks
  if (variancePercentage > 25) {
    riskScore += 45;
    flags.push(`Severe budget overrun: +${variancePercentage}% (₹${varianceAmount}L) above technical sanction`);
  } else if (variancePercentage > 10) {
    riskScore += 30;
    flags.push(`Moderate cost overrun: +${variancePercentage}% above sanctioned limit`);
  } else if (variancePercentage > 0) {
    riskScore += 15;
    flags.push(`Minor expenditure variance: +${variancePercentage}% over sanction`);
  }

  // 2. Disbursal vs Physical Progress Dissonance (Leakage / Advance Risk)
  if (disbursalPercentage >= 90 && physicalProgress < 40) {
    riskScore += 45;
    flags.push(`Critical disbursal dissonance: ${disbursalPercentage}% funds liquidated but only ${physicalProgress}% ground progress`);
  } else if (disbursalPercentage >= 75 && physicalProgress < 50) {
    riskScore += 30;
    flags.push(`Advance expenditure gap: ${disbursalPercentage}% spent with ${physicalProgress}% physical execution`);
  } else if (disbursalPercentage > 0 && physicalProgress === 0 && workStatus !== 'SANCTIONED') {
    riskScore += 35;
    flags.push(`Premature financial draw: ₹${cleanExpenditure}L disbursed with 0% ground progress`);
  }

  // 3. Stagnant Zero Spend on Long-Sanctioned Projects
  if (cleanExpenditure === 0 && physicalProgress === 0 && (workStatus === 'IN_PROGRESS' || workStatus === 'UNDER_AUDIT')) {
    riskScore += 20;
    flags.push('Financial dormancy: active work order with zero reported expenditure');
  }

  return {
    sanctionedCost: cleanSanctioned,
    expenditure: cleanExpenditure,
    varianceAmount,
    variancePercentage,
    isOverrun,
    disbursalRatio,
    disbursalProgressGap,
    riskScore: Math.min(100, riskScore),
    flags
  };
}

/**
 * ============================================================================
 * 3. DELAY DAYS & TIMELINE OVERRUN ANALYSIS
 * ============================================================================
 */

/**
 * Calculates milestone delay days comparing expected date to actual/current date.
 */
export function analyzeDelayDays(
  expectedCompletionDate?: string | null,
  actualCompletionDate?: string | null,
  workStatus: string = 'IN_PROGRESS',
  referenceDate: Date = new Date('2026-09-01')
): DelayDaysAnalysis {
  if (!expectedCompletionDate) {
    return {
      expectedCompletionDate: null,
      actualCompletionDate: actualCompletionDate || null,
      delayDays: 0,
      isDelayed: false,
      delayCategory: 'NONE',
      riskScore: 10,
      description: 'No expected completion milestone recorded in statutory register'
    };
  }

  const expectedTime = new Date(expectedCompletionDate).getTime();
  if (isNaN(expectedTime)) {
    return {
      expectedCompletionDate,
      actualCompletionDate: actualCompletionDate || null,
      delayDays: 0,
      isDelayed: false,
      delayCategory: 'NONE',
      riskScore: 5,
      description: 'Invalid date format for expected completion'
    };
  }

  let endTime: number;
  if (actualCompletionDate) {
    const act = new Date(actualCompletionDate).getTime();
    endTime = !isNaN(act) ? act : referenceDate.getTime();
  } else if (workStatus === 'COMPLETED') {
    endTime = expectedTime; // Mark as on-time if status completed without specific actual date
  } else {
    endTime = referenceDate.getTime();
  }

  const diffMs = endTime - expectedTime;
  const delayDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const isDelayed = delayDays > 0 && workStatus !== 'COMPLETED';

  let delayCategory: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CHRONIC' = 'NONE';
  let riskScore = 0;
  let description = 'Work progressing within sanctioned schedule';

  if (delayDays > 365) {
    delayCategory = 'CHRONIC';
    riskScore = 90;
    description = `Chronic timeline default: delayed by ${delayDays} days (> 12 months overdue)`;
  } else if (delayDays > 180) {
    delayCategory = 'SEVERE';
    riskScore = 70;
    description = `Severe schedule delay: ${delayDays} days overdue (> 6 months)`;
  } else if (delayDays > 90) {
    delayCategory = 'MODERATE';
    riskScore = 45;
    description = `Moderate delay: overdue by ${delayDays} days (> 3 months)`;
  } else if (delayDays > 15) {
    delayCategory = 'MINOR';
    riskScore = 25;
    description = `Minor delay: ${delayDays} days past targeted milestone`;
  } else {
    delayCategory = 'NONE';
    riskScore = 0;
    description = 'On schedule / completed within milestone parameters';
  }

  return {
    expectedCompletionDate,
    actualCompletionDate: actualCompletionDate || null,
    delayDays,
    isDelayed,
    delayCategory,
    riskScore,
    description
  };
}

/**
 * ============================================================================
 * 4. COMPREHENSIVE MULTI-FACTOR PROJECT RISK SCORING ENGINE
 * ============================================================================
 */

/**
 * Evaluates the full risk profile of a project using cost deviation, delay days,
 * 50-meter spatial proximity duplicate tests, and compliance indicators.
 */
export function calculateProjectRiskScore(
  project: ProjectRiskInput,
  options: RiskScoringOptions = {}
): ProjectRiskEvaluation {
  const refDate = options.referenceDate 
    ? (typeof options.referenceDate === 'string' ? new Date(options.referenceDate) : options.referenceDate)
    : new Date('2026-09-01');

  const thresholdMeters = options.spatialThresholdMeters ?? SPATIAL_DUPLICATE_THRESHOLD_METERS;
  const weights = {
    costDeviation: options.weights?.costDeviation ?? 0.30,
    delay: options.weights?.delay ?? 0.25,
    progressDiscrepancy: options.weights?.progressDiscrepancy ?? 0.20,
    spatialProximity: options.weights?.spatialProximity ?? 0.15,
    compliance: options.weights?.compliance ?? 0.10
  };

  const riskFlags: string[] = [];

  // 1. Cost Deviation Analysis
  const costAnalysis = analyzeCostDeviation(
    project.sanctionedCost,
    project.expenditure,
    project.physicalProgress ?? 0,
    project.workStatus
  );
  riskFlags.push(...costAnalysis.flags);

  // 2. Delay Days Analysis
  const delayAnalysis = analyzeDelayDays(
    project.expectedCompletionDate,
    project.actualCompletionDate,
    project.workStatus,
    refDate
  );
  if (delayAnalysis.isDelayed) {
    riskFlags.push(delayAnalysis.description);
  }

  // 3. Progress Discrepancy Score
  let progressDiscrepancyScore = 0;
  const progress = project.physicalProgress ?? 0;
  if (project.workStatus === 'COMPLETED' && progress < 100) {
    progressDiscrepancyScore = 75;
    riskFlags.push(`Status Inconsistency: Marked 'COMPLETED' with only ${progress}% physical progress reported`);
  } else if (costAnalysis.disbursalProgressGap > 40) {
    progressDiscrepancyScore = 60;
  } else if (costAnalysis.disbursalProgressGap > 20) {
    progressDiscrepancyScore = 30;
  }

  // 4. Spatial Proximity within 50 Meters
  const spatialMatches = options.otherProjects 
    ? findNearbyProjectsWithin50m(project, options.otherProjects, thresholdMeters)
    : [];

  const spatialDuplicateDetected = spatialMatches.length > 0;
  let spatialProximityScore = 0;

  if (spatialDuplicateDetected) {
    const closest = spatialMatches[0];
    spatialProximityScore = closest.distanceMeters <= 20 ? 95 : 80;
    riskFlags.push(
      `Spatial Duplicate Alert (Clause 7.1): Located ${closest.distanceMeters}m from peer work "${closest.candidateTitle}" (${closest.candidateWorkCode})`
    );
  }

  // 5. Compliance & Documentation Score (UC and Audit)
  let complianceScore = 0;
  if (project.utilizationCertificateStatus === 'PENDING' && (progress >= 75 || project.workStatus === 'COMPLETED')) {
    complianceScore += 45;
    riskFlags.push('Compliance default: Pending Utilization Certificate (UC) for matured/completed work');
  }
  if (project.auditStatus === 'OBSERVATION_NOTED') {
    complianceScore += 40;
    riskFlags.push('Audit observation flagged by Statutory Accountant General / CAG audit inspection');
  }

  // Weighted Aggregate Score (0 - 100)
  const rawWeightedScore =
    costAnalysis.riskScore * weights.costDeviation +
    delayAnalysis.riskScore * weights.delay +
    progressDiscrepancyScore * weights.progressDiscrepancy +
    spatialProximityScore * weights.spatialProximity +
    complianceScore * weights.compliance;

  const overallRiskScore = Math.min(100, Math.max(0, Math.round(rawWeightedScore)));

  // Risk Tier Classification
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  if (overallRiskScore >= 81) {
    riskLevel = 'HIGH';
    riskCategory = 'CRITICAL';
  } else if (overallRiskScore >= 61) {
    riskLevel = 'HIGH';
    riskCategory = 'HIGH';
  } else if (overallRiskScore >= 31) {
    riskLevel = 'MEDIUM';
    riskCategory = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
    riskCategory = 'LOW';
  }

  // Recommended Audit Directive
  let recommendedAction: string;
  if (riskCategory === 'CRITICAL') {
    recommendedAction = 'IMMEDIATE AUDIT STOP-ORDER: Issue formal vigilance inquiry docket. Dispatch Third-Party Quality Inspection (TPI) team and freeze further milestone payments pending geo-tag cross-verification.';
  } else if (riskCategory === 'HIGH') {
    recommendedAction = 'MANDATORY FIELD INSPECTION: Dispatch District Technical Vigilance Auditor to physically inspect structure dimensions, verify marble plaque, and inspect Measurement Book (MB) before final UC clearance.';
  } else if (riskCategory === 'MEDIUM') {
    recommendedAction = 'PROCEDURAL SCRUTINY: Request updated Utilization Certificate (UC), reconciled bank expenditure ledger, and stage-wise geotagged progress photographs from implementing agency.';
  } else {
    recommendedAction = 'ROUTINE MONITORING: Project conforms to statutory benchmarks. Maintain standard quarterly milestone surveillance.';
  }

  // Simple Cryptographic-style Hash for audit trail verification
  const hashSource = `${project.id}:${project.workCode}:${overallRiskScore}:${riskCategory}:${refDate.toISOString().substring(0, 10)}`;
  let hashVal = 0;
  for (let i = 0; i < hashSource.length; i++) {
    const char = hashSource.charCodeAt(i);
    hashVal = (hashVal << 5) - hashVal + char;
    hashVal |= 0;
  }
  const verificationHash = 'SATYAKSH-RISK-' + Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0');

  return {
    projectId: project.id,
    workCode: project.workCode,
    title: project.title,
    overallRiskScore,
    riskLevel,
    riskCategory,
    costDeviation: costAnalysis,
    delayDays: delayAnalysis,
    factorScores: {
      costDeviationScore: costAnalysis.riskScore,
      delayScore: delayAnalysis.riskScore,
      progressDiscrepancyScore,
      spatialProximityScore,
      complianceScore
    },
    spatialDuplicateDetected,
    spatialMatchesWithin50m: spatialMatches,
    riskFlags: riskFlags.length > 0 ? riskFlags : ['All parameters within normal statutory tolerances'],
    recommendedAction,
    evaluatedAt: new Date().toISOString(),
    verificationHash
  };
}

/**
 * Batch evaluates risk scores across an entire portfolio of projects,
 * automatically cross-checking all pairs for 50-meter spatial duplicate collisions.
 */
export function evaluatePortfolioRisk(
  projects: ProjectRiskInput[],
  options: Omit<RiskScoringOptions, 'otherProjects'> = {}
): ProjectRiskEvaluation[] {
  return projects.map(project => {
    return calculateProjectRiskScore(project, {
      ...options,
      otherProjects: projects
    });
  });
}
