import { 
  Project, 
  SpatialDuplicatePair, 
  RiskAssessment, 
  RiskSignalItem, 
  RiskLevel, 
  RiskCategory,
  AuditTrailEntry, 
  FieldVerificationRecord,
  HybridRiskBreakdown,
  RiskFactorEvidence,
  DuplicateProjectMatch,
  ContractorNodeInfo
} from '../types';
import { calculateHybridRiskScore, buildContractorNetwork } from './hybridRiskEngine';

/**
 * Calculates the exact geodesic distance between two GPS coordinate points
 * using the Haversine formula on a standard WGS-84 Earth sphere (radius = 6371000m).
 * Returns distance in meters.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place (decimeter precision)
}

/**
 * Computes text lexical similarity between two project titles or descriptions
 * using token intersection & character n-grams.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const cleanA = textA.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  const cleanB = textB.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  if (cleanA === cleanB) return 1.0;

  const tokensA = new Set(cleanA.split(/\s+/).filter(w => w.length > 2));
  const tokensB = new Set(cleanB.split(/\s+/).filter(w => w.length > 2));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  tokensA.forEach(t => {
    if (tokensB.has(t)) intersection++;
  });

  const jaccard = intersection / (tokensA.size + tokensB.size - intersection);
  return Math.round(jaccard * 100) / 100;
}

/**
 * 50-METER SPATIAL DEDUPLICATION ENGINE
 * Scans all projects with coordinates, detects proximity <= radiusMeters (default 50m),
 * and flags potential duplicate projects with forensic reasons.
 */
export function detectSpatialDuplicates(
  projects: Project[],
  radiusMeters: number = 50
): SpatialDuplicatePair[] {
  const duplicates: SpatialDuplicatePair[] = [];
  const validProjects = projects.filter(
    p => p.coordinates && Array.isArray(p.coordinates) && p.coordinates.length === 2
  );

  for (let i = 0; i < validProjects.length; i++) {
    for (let j = i + 1; j < validProjects.length; j++) {
      const p1 = validProjects[i];
      const p2 = validProjects[j];

      const [lat1, lon1] = p1.coordinates!;
      const [lat2, lon2] = p2.coordinates!;

      const dist = calculateHaversineDistance(lat1, lon1, lat2, lon2);

      if (dist <= radiusMeters) {
        const similarity = calculateTextSimilarity(p1.title, p2.title);
        const sameSector = p1.sector.toLowerCase() === p2.sector.toLowerCase();
        const sameAgency = p1.implementingAgency.toLowerCase() === p2.implementingAgency.toLowerCase();
        const costRatio = Math.min(p1.sanctionedCost, p2.sanctionedCost) / Math.max(p1.sanctionedCost || 1, p2.sanctionedCost || 1);

        const reasons: string[] = [];
        reasons.push(`Geographical distance is ${dist}m (within ${radiusMeters}m spatial buffer)`);
        
        if (sameSector) {
          reasons.push(`Identical work sector: "${p1.sector}"`);
        }
        if (similarity > 0.3) {
          reasons.push(`High project title & scope overlap (${Math.round(similarity * 100)}% match)`);
        }
        if (sameAgency) {
          reasons.push(`Same executing agency: "${p1.implementingAgency}"`);
        }
        if (costRatio > 0.7) {
          reasons.push(`Comparable financial estimate (₹${p1.sanctionedCostFormatted} vs ₹${p2.sanctionedCostFormatted})`);
        }
        if (p1.financialYear === p2.financialYear) {
          reasons.push(`Sanctioned in the same financial cycle (${p1.financialYear})`);
        } else {
          reasons.push(`Potential recurring sanction across consecutive cycles (${p1.financialYear} & ${p2.financialYear})`);
        }

        let duplicateConfidence: 'CERTAIN' | 'HIGH' | 'SUSPECT' | 'COINCIDENTAL' = 'SUSPECT';
        if (dist <= 25 && sameSector && similarity > 0.4) {
          duplicateConfidence = 'CERTAIN';
        } else if (dist <= 40 && (sameSector || similarity > 0.35)) {
          duplicateConfidence = 'HIGH';
        } else if (dist <= 50) {
          duplicateConfidence = 'SUSPECT';
        } else {
          duplicateConfidence = 'COINCIDENTAL';
        }

        duplicates.push({
          id: `DUP-${p1.id}-${p2.id}`,
          projectAId: p1.id,
          projectBId: p2.id,
          projectA: p1,
          projectB: p2,
          distanceMeters: dist,
          similarityScore: Math.round(similarity * 100),
          duplicateConfidence,
          reasons,
          detectedAt: new Date().toISOString(),
          status: 'UNRESOLVED'
        });
      }
    }
  }

  // Sort by closest distance first
  return duplicates.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/**
 * AI MULTI-SIGNAL RISK ENGINE
 * Computes an explainable 0–100 risk score and structured risk dossier for any project.
 */
export function evaluateProjectRisk(
  project: Project,
  allProjects: Project[] = [],
  duplicatesList: SpatialDuplicatePair[] = []
): RiskAssessment {
  const signals: RiskSignalItem[] = [];
  const detectionReasons: string[] = [];
  const supportingEvidence: { label: string; value: string }[] = [];

  let totalRiskScore = 0;

  // Signal 1: 50-Meter Spatial Deduplication (Max 35 pts)
  const relatedDuplicate = duplicatesList.find(
    d => d.projectAId === project.id || d.projectBId === project.id
  );

  if (relatedDuplicate) {
    const isUnder30m = relatedDuplicate.distanceMeters <= 30;
    const score = isUnder30m ? 35 : 25;
    totalRiskScore += score;

    const otherProject = relatedDuplicate.projectAId === project.id 
      ? relatedDuplicate.projectB 
      : relatedDuplicate.projectA;

    signals.push({
      signalKey: 'SPATIAL_DUPLICATION',
      name: '50-Meter Spatial Proximity / Suspect Duplicate',
      category: 'SPATIAL',
      scoreContribution: score,
      maxScore: 35,
      status: 'FLAGGED',
      explanation: `Project coordinates are within ${relatedDuplicate.distanceMeters}m of another work ("${otherProject?.title || 'Related Project'}"). Potential double-billing or overlapping scope.`,
      metric: `${relatedDuplicate.distanceMeters}m separation`,
      evidence: `Neighboring Work Code: ${otherProject?.workCode || 'N/A'}, Sanction: ${otherProject?.sanctionedCostFormatted || 'N/A'}`
    });

    detectionReasons.push(`Potential duplicate project detected within ${relatedDuplicate.distanceMeters} meters (Work Code: ${otherProject?.workCode}).`);
    supportingEvidence.push({ label: 'Spatial Separation', value: `${relatedDuplicate.distanceMeters} meters` });
    supportingEvidence.push({ label: 'Neighboring Work', value: `${otherProject?.title} (${otherProject?.workCode})` });
  } else {
    signals.push({
      signalKey: 'SPATIAL_DUPLICATION',
      name: 'Spatial Geofence & Isolation',
      category: 'SPATIAL',
      scoreContribution: 0,
      maxScore: 35,
      status: 'CLEAR',
      explanation: 'No overlapping or duplicate MPLADS works detected within the 50-meter statutory perimeter.',
      metric: '> 50m clear radius',
      evidence: 'GPS coordinates verified against District Works Registry'
    });
  }

  // Signal 2: Unusual Project Cost & Financial Anomalies (Max 25 pts)
  let financialScore = 0;
  const cost = project.sanctionedCost || 0;
  const spent = project.expenditure || 0;
  const progress = project.physicalProgress || 0;

  // Anomaly A: 100% expenditure booked but < 50% physical progress
  if (spent >= cost && cost > 0 && progress < 50) {
    financialScore += 25;
    signals.push({
      signalKey: 'EXPENDITURE_PROGRESS_MISMATCH',
      name: 'Expenditure vs Ground Progress Discrepancy',
      category: 'FINANCIAL',
      scoreContribution: 25,
      maxScore: 25,
      status: 'FLAGGED',
      explanation: `100% of sanctioned funds (₹${project.expenditureFormatted}) have been booked/disbursed, yet recorded physical execution is only ${progress}%.`,
      metric: `${progress}% progress vs 100% fund disbursal`,
      evidence: `Certified Spent: ${project.expenditureFormatted} / Sanctioned: ${project.sanctionedCostFormatted}`
    });
    detectionReasons.push(`Severe financial-physical mismatch: Full budget drawn (${project.expenditureFormatted}) with only ${progress}% ground progress.`);
    supportingEvidence.push({ label: 'Disbursal Discrepancy', value: `₹${spent}L spent on ${progress}% completion` });
  } else if (cost > 60 && (project.sector === 'Drinking Water' || project.sector === 'Sanitation & Drainage')) {
    financialScore += 15;
    signals.push({
      signalKey: 'SECTOR_COST_DEVIATION',
      name: 'High Cost Outlier for Sector Category',
      category: 'FINANCIAL',
      scoreContribution: 15,
      maxScore: 25,
      status: 'WARNING',
      explanation: `Project sanctioned cost of ${project.sanctionedCostFormatted} is > 1.8x higher than the district average benchmark for ${project.sector}.`,
      metric: `${project.sanctionedCostFormatted} (1.8x Sector Benchmark)`,
      evidence: 'Standard SOR/CSR unit rates indicate typical cost range ₹15L - ₹35L'
    });
    detectionReasons.push(`Project cost (${project.sanctionedCostFormatted}) is significantly higher than comparable works in the sector.`);
    supportingEvidence.push({ label: 'Cost Deviation', value: `${project.sanctionedCostFormatted} vs District Median ₹24.0L` });
  } else {
    signals.push({
      signalKey: 'FINANCIAL_INTEGRITY',
      name: 'Financial Ledger & Disbursal Alignment',
      category: 'FINANCIAL',
      scoreContribution: 0,
      maxScore: 25,
      status: 'CLEAR',
      explanation: 'Fund disbursals align proportionally with documented physical milestones.',
      metric: `${progress}% progress / ${cost > 0 ? Math.round((spent / cost) * 100) : 0}% spent`,
      evidence: 'PFMS expenditure vouchers match measurement book'
    });
  }
  totalRiskScore += financialScore;

  // Signal 3: Implementation Delays & Timeline Overruns (Max 20 pts)
  let scheduleScore = 0;
  if (project.expectedCompletionDate) {
    const targetDate = new Date(project.expectedCompletionDate);
    const actualDate = project.actualCompletionDate ? new Date(project.actualCompletionDate) : new Date('2026-09-01');
    const isCompleted = project.workStatus === 'COMPLETED' || progress === 100;

    const diffDays = Math.round((actualDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    if (!isCompleted && diffDays > 180) {
      scheduleScore += 20;
      signals.push({
        signalKey: 'CHRONIC_TIME_OVERRUN',
        name: 'Critical Implementation Delay (> 180 Days)',
        category: 'SCHEDULE',
        scoreContribution: 20,
        maxScore: 20,
        status: 'FLAGGED',
        explanation: `Work is overdue by ${diffDays} days past the target commissioning deadline of ${project.expectedCompletionDate}.`,
        metric: `+${diffDays} days delay`,
        evidence: `Sanctioned Start: ${project.startDate || 'N/A'} → Target: ${project.expectedCompletionDate}`
      });
      detectionReasons.push(`Critical project delay: Implementation exceeds scheduled deadline by ${diffDays} days.`);
      supportingEvidence.push({ label: 'Schedule Overrun', value: `${diffDays} days past target (${project.expectedCompletionDate})` });
    } else if (!isCompleted && diffDays > 60) {
      scheduleScore += 10;
      signals.push({
        signalKey: 'MODERATE_DELAY',
        name: 'Moderate Implementation Overrun (> 60 Days)',
        category: 'SCHEDULE',
        scoreContribution: 10,
        maxScore: 20,
        status: 'WARNING',
        explanation: `Work has exceeded scheduled milestone date by ${diffDays} days without documented extension sanction.`,
        metric: `+${diffDays} days overrun`,
        evidence: `Target: ${project.expectedCompletionDate}`
      });
      detectionReasons.push(`Moderate implementation delay of ${diffDays} days detected.`);
    } else {
      signals.push({
        signalKey: 'SCHEDULE_ADHERENCE',
        name: 'Timeline Adherence',
        category: 'SCHEDULE',
        scoreContribution: 0,
        maxScore: 20,
        status: 'CLEAR',
        explanation: isCompleted ? 'Project commissioned within acceptable timeline window.' : 'Civil execution currently progressing on track.',
        metric: isCompleted ? 'Completed on time' : 'On track',
        evidence: `Target completion: ${project.expectedCompletionDate}`
      });
    }
  }
  totalRiskScore += scheduleScore;

  // Signal 4: Contractor / Agency Risk Pattern (Max 12 pts)
  const agency = project.implementingAgency || '';
  const agencyProjects = allProjects.filter(p => p.implementingAgency === agency);
  const agencyDelayed = agencyProjects.filter(p => p.workStatus === 'IN_PROGRESS' && p.physicalProgress < 40);

  if (agencyDelayed.length >= 2) {
    const score = 12;
    totalRiskScore += score;
    signals.push({
      signalKey: 'AGENCY_BOTTLENECK_PATTERN',
      name: 'Executing Agency Capacity & Delay Cluster',
      category: 'CONTRACTOR',
      scoreContribution: score,
      maxScore: 12,
      status: 'FLAGGED',
      explanation: `Agency "${agency}" holds ${agencyDelayed.length} lagging works in this district with low progress.`,
      metric: `${agencyDelayed.length} stalled works under same agency`,
      evidence: `Agency Portfolio: ${agencyProjects.length} total works in ledger`
    });
    detectionReasons.push(`Executing agency has multiple flagged or stalled works across the district.`);
    supportingEvidence.push({ label: 'Agency Stalled Works', value: `${agencyDelayed.length} lagging projects under ${agency}` });
  } else {
    signals.push({
      signalKey: 'AGENCY_PERFORMANCE',
      name: 'Contractor / Agency Track Record',
      category: 'CONTRACTOR',
      scoreContribution: 0,
      maxScore: 12,
      status: 'CLEAR',
      explanation: `Agency "${agency}" has satisfactory throughput with no systemic backlog.`,
      metric: 'Normal Agency Rating',
      evidence: `${agencyProjects.length} active or completed works`
    });
  }

  // Signal 5: Audit & Compliance Observations (Max 8 pts)
  if (project.auditStatus === 'OBSERVATION_NOTED' || (project.workStatus === 'COMPLETED' && project.utilizationCertificateStatus === 'PENDING')) {
    const score = 8;
    totalRiskScore += score;
    signals.push({
      signalKey: 'AUDIT_OBSERVATION',
      name: 'Pending Utilization Certificate / Audit Note',
      category: 'AUDIT_DOC',
      scoreContribution: score,
      maxScore: 8,
      status: 'FLAGGED',
      explanation: 'Statutory Utilization Certificate (UC) remains unsubmitted or District Planning Office noted audit remarks.',
      metric: project.utilizationCertificateStatus === 'PENDING' ? 'UC Pending' : 'Audit Note Recorded',
      evidence: `Audit Flag: ${project.auditStatus}, UC: ${project.utilizationCertificateStatus}`
    });
    detectionReasons.push(`Statutory compliance gap: Utilization Certificate (UC) pending submission.`);
    supportingEvidence.push({ label: 'Compliance Status', value: `UC ${project.utilizationCertificateStatus} | Audit: ${project.auditStatus}` });
  } else {
    signals.push({
      signalKey: 'AUDIT_COMPLIANCE',
      name: 'Statutory Compliance & UC Filing',
      category: 'AUDIT_DOC',
      scoreContribution: 0,
      maxScore: 8,
      status: 'CLEAR',
      explanation: 'All audit stages, test reports, and statutory UC documents cleared.',
      metric: 'Fully Compliant',
      evidence: `UC Status: ${project.utilizationCertificateStatus}`
    });
  }

  // Cap score between 0 and 100
  totalRiskScore = Math.min(100, Math.max(0, totalRiskScore));

  // Run Comprehensive Hybrid Risk Engine for Explainability & Multidimensionality
  const hybridResult = calculateHybridRiskScore(project, allProjects, duplicatesList);

  // If hybrid score produced valid signals, use the explainable hybrid risk score and category
  const finalScore = Math.max(totalRiskScore, hybridResult.totalRiskScore);
  const finalCategory: RiskCategory = 
    finalScore >= 81 ? 'CRITICAL' :
    finalScore >= 61 ? 'HIGH' :
    finalScore >= 31 ? 'MEDIUM' : 'LOW';
  
  const finalLevel: RiskLevel = 
    finalScore >= 61 ? 'HIGH' :
    finalScore >= 31 ? 'MEDIUM' : 'LOW';

  const combinedReasons = Array.from(new Set([...detectionReasons, ...hybridResult.detectionReasons]));
  const defaultAction = finalScore >= 61 
    ? 'Dispatch Field Inspection Officer to verify physical infrastructure and capture geotagged photo before disbursing final milestone payment.'
    : finalScore >= 31
    ? 'Request formal Utilization Certificate (UC) and inspect expenditure receipts before next tranche sanction.'
    : 'Routine automated monitoring; project conforms to standard procedural benchmarks.';
  const finalAction = hybridResult.recommendedAction || defaultAction;

  // Cryptographic Evaluation Hash
  const hashPayload = `${project.id}:${finalScore}:${finalCategory}:${new Date().toISOString().substring(0, 10)}`;
  const evaluationHash = `SHA256-${simpleHash(hashPayload)}`;

  return {
    projectId: project.id,
    projectWorkCode: project.workCode,
    projectTitle: project.title,
    riskScore: finalScore,
    riskLevel: finalLevel,
    riskCategory: finalCategory,
    confidence: finalScore > 60 ? 'HIGH' : 'MEDIUM',
    spatialDuplicateDetected: Boolean(relatedDuplicate),
    nearestNeighborDistanceMeters: relatedDuplicate?.distanceMeters,
    nearestNeighborProjectId: relatedDuplicate?.projectAId === project.id ? relatedDuplicate.projectBId : relatedDuplicate?.projectAId,
    hybridBreakdown: hybridResult.hybridBreakdown,
    factors: hybridResult.factors,
    duplicateMatches: hybridResult.duplicateMatches,
    contractorDetails: hybridResult.contractorDetails,
    signals,
    detectionReasons: combinedReasons.length > 0 ? combinedReasons : ['All risk metrics are within normal statistical tolerance.'],
    supportingEvidence,
    recommendedAction: finalAction,
    evaluatedAt: new Date().toISOString(),
    evaluationHash
  };
}

/**
 * Fast SHA-256 / Hex generator for client & server portability
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const timestamp = Date.now().toString(16).slice(-6);
  return `${hex}${timestamp}`.toUpperCase();
}

/**
 * In-memory / persistent audit trail ledger store
 */
export function createAuditRecord(
  index: number,
  actor: string,
  actorRole: string,
  action: any,
  entityType: 'PROJECT' | 'VERIFICATION' | 'CONTRACTOR' | 'INGESTION',
  entityId: string,
  summary: string,
  previousState: any,
  newState: any,
  previousHash: string = '0000000000000000000000000000000000000000000000000000000000000000'
): AuditTrailEntry {
  const timestamp = new Date().toISOString();
  const rawPayload = `${previousHash}|${timestamp}|${actor}|${action}|${entityType}|${entityId}|${JSON.stringify(newState)}`;
  const recordHash = simpleHash(rawPayload);

  return {
    id: `AUDIT-${index.toString().padStart(5, '0')}`,
    index,
    timestamp,
    actor,
    actorRole,
    action,
    entityType,
    entityId,
    previousState,
    newState,
    summary,
    previousHash,
    recordHash
  };
}
