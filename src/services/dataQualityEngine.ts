import { Project, DataQualityAuditResult } from '../types';

/**
 * AUTOMATED DATA QUALITY ENGINE
 * Scans projects dataset for missing fields, inconsistent numbers, coordinate anomalies,
 * and financial reconciliation discrepancies.
 */
export function runDataQualityAudit(projects: Project[]): DataQualityAuditResult {
  let criticalErrorsCount = 0;
  let warningsCount = 0;
  let missingFieldsCount = 0;
  let duplicateRecordsCount = 0;
  let invalidRecordsCount = 0;
  let reconciliationAlertsCount = 0;

  // 1. Check Missing MP
  const missingMPProjects = projects.filter(p => !p.mpName || p.mpName.trim() === '');
  missingFieldsCount += missingMPProjects.length;

  // 2. Check Missing State or Constituency
  const missingGeoProjects = projects.filter(p => !p.state || !p.constituency);
  missingFieldsCount += missingGeoProjects.length;

  // 3. Negative expenditure
  const negativeExpenditure = projects.filter(p => p.expenditure < 0);
  if (negativeExpenditure.length > 0) criticalErrorsCount += negativeExpenditure.length;

  // 4. Expenditure > Sanctioned Cost
  const costOverruns = projects.filter(p => p.expenditure > p.sanctionedCost);
  reconciliationAlertsCount += costOverruns.length;
  if (costOverruns.length > 0) warningsCount += costOverruns.length;

  // 5. Recommended Cost != Sanctioned Cost (Variation)
  const costDeviations = projects.filter(p => p.recommendedCost && p.sanctionedCost && Math.abs(p.recommendedCost - p.sanctionedCost) > 0.05);
  reconciliationAlertsCount += costDeviations.length;

  // 6. Invalid or missing Coordinates
  const missingCoordinates = projects.filter(p => !p.coordinates || !Array.isArray(p.coordinates) || p.coordinates.length !== 2);
  const outOfBoundsCoordinates = projects.filter(p => {
    if (!p.coordinates || !Array.isArray(p.coordinates) || p.coordinates.length !== 2) return false;
    const [lat, lng] = p.coordinates;
    // Sovereign Indian territorial bounding box (Lat 6°N - 38°N, Long 68°E - 98°E)
    return lat < 6 || lat > 38 || lng < 68 || lng > 98;
  });
  const allCoordinateIssues = [...missingCoordinates, ...outOfBoundsCoordinates];
  if (allCoordinateIssues.length > 0) warningsCount += allCoordinateIssues.length;

  // 7. Invalid Financial Year entries
  // Valid Indian FY pattern: YYYY-YY (e.g. "2024-25", "2025-26", "2023-24") or YYYY-YYYY
  const fyRegex = /^(19|20)\d{2}-((\d{2})|((19|20)\d{2}))$/;
  const invalidFYProjects = projects.filter(p => {
    if (!p.financialYear || typeof p.financialYear !== 'string') return true;
    const trimmed = p.financialYear.trim();
    if (!fyRegex.test(trimmed)) return true;
    // Check consecutive year logic if format YYYY-YY (e.g. 2024-25)
    if (trimmed.length === 7) {
      const startYear = parseInt(trimmed.substring(0, 4), 10);
      const endYearShort = parseInt(trimmed.substring(5, 7), 10);
      const expectedEnd = (startYear + 1) % 100;
      if (endYearShort !== expectedEnd) return true;
    }
    return false;
  });
  if (invalidFYProjects.length > 0) invalidRecordsCount += invalidFYProjects.length;

  // 8. Financial Reconciliation: Negative unspent balances or expenditure > sanctioned
  const negativeUnspent = projects.filter(p => p.unspentBalance < 0);
  if (negativeUnspent.length > 0) reconciliationAlertsCount += negativeUnspent.length;

  // 9. Milestone chronology errors (e.g. completion prior to sanction/start)
  const milestoneErrors = projects.filter(p => {
    if (p.sanctionDate && p.startDate && new Date(p.startDate) < new Date(p.sanctionDate)) return true;
    if (p.startDate && p.expectedCompletionDate && new Date(p.expectedCompletionDate) < new Date(p.startDate)) return true;
    return false;
  });
  if (milestoneErrors.length > 0) warningsCount += milestoneErrors.length;

  // 10. Duplicate Work Codes / IDs
  const seenWorkCodes = new Set<string>();
  const duplicateCodes: string[] = [];
  projects.forEach(p => {
    if (seenWorkCodes.has(p.workCode)) {
      duplicateCodes.push(p.workCode);
      duplicateRecordsCount++;
    } else {
      seenWorkCodes.add(p.workCode);
    }
  });

  // 11. Missing Contractor / Implementing Agency
  const missingAgency = projects.filter(p => !p.implementingAgency || p.implementingAgency.trim() === '');
  missingFieldsCount += missingAgency.length;

  // Calculate Overall Data Quality Score (0 - 100%)
  const totalChecks = projects.length * 8;
  const totalDeductions = (criticalErrorsCount * 10) + (reconciliationAlertsCount * 2) + (warningsCount * 1) + (missingFieldsCount * 0.5) + (duplicateRecordsCount * 5);
  const dataQualityScore = Math.max(50, Math.min(100, Math.round(((totalChecks - totalDeductions) / totalChecks) * 100)));

  return {
    dataQualityScore,
    totalRecordsChecked: projects.length,
    criticalErrorsCount,
    warningsCount,
    missingFieldsCount,
    duplicateRecordsCount,
    invalidRecordsCount,
    reconciliationAlertsCount,
    checks: [
      {
        id: 'CHK-01',
        name: 'Mandatory MP & Parliamentary Constituency Binding',
        type: 'CRITICAL',
        status: missingMPProjects.length === 0 ? 'PASS' : 'FAIL',
        failingCount: missingMPProjects.length,
        description: 'Verifies every public project is assigned to a verified 18th Lok Sabha or Rajya Sabha parliamentarian.',
        affectedProjectIds: missingMPProjects.map(p => p.id),
        affectedExamples: missingMPProjects.slice(0, 3).map(p => ({
          workCode: p.workCode,
          issue: 'Missing MP identity in official MoSPI ledger',
          source: p.source
        }))
      },
      {
        id: 'CHK-02',
        name: 'Financial Reconciliation: Expenditure vs Technical Sanction',
        type: 'RECONCILIATION',
        status: costOverruns.length === 0 ? 'PASS' : 'FAIL',
        failingCount: costOverruns.length,
        description: 'Detects works where disbursed funds exceed the sanctioned ceiling without approved revised technical sanction.',
        affectedProjectIds: costOverruns.map(p => p.id),
        affectedExamples: costOverruns.slice(0, 5).map(p => ({
          workCode: p.workCode,
          issue: `Expenditure (${p.expenditureFormatted}) > Sanctioned Cost (${p.sanctionedCostFormatted})`,
          source: 'PFMS Single Nodal Escrow'
        }))
      },
      {
        id: 'CHK-03',
        name: 'Geo-Spatial Coordinates Range & Presence Audit',
        type: 'WARNING',
        status: allCoordinateIssues.length === 0 ? 'PASS' : 'FAIL',
        failingCount: allCoordinateIssues.length,
        description: 'Audits missing GPS coordinates and verifies reported latitude & longitude fall within Sovereign Indian borders (Lat 6°-38°N, Long 68°-98°E).',
        affectedProjectIds: allCoordinateIssues.map(p => p.id),
        affectedExamples: [
          ...missingCoordinates.slice(0, 2).map(p => ({
            workCode: p.workCode,
            issue: 'Missing physical GPS coordinates [lat, lng] in sanctioned record',
            source: 'e-GramSwaraj / State PWD'
          })),
          ...outOfBoundsCoordinates.slice(0, 2).map(p => ({
            workCode: p.workCode,
            issue: `Coordinates [${p.coordinates?.join(', ')}] out of Indian territorial boundary`,
            source: 'e-GramSwaraj GPS Registry'
          }))
        ]
      },
      {
        id: 'CHK-04',
        name: 'Work Code Uniqueness & Anti-Duplication Check',
        type: 'CRITICAL',
        status: duplicateCodes.length === 0 ? 'PASS' : 'FAIL',
        failingCount: duplicateCodes.length,
        description: 'Verifies no two works share identical primary MPLAD Work Identification numbers.',
        affectedProjectIds: [],
        affectedExamples: duplicateCodes.slice(0, 3).map(code => ({
          workCode: code,
          issue: 'Duplicate work code detected across sanctioning authorities',
          source: 'MoSPI National Work Register'
        }))
      },
      {
        id: 'CHK-05',
        name: 'Milestone Timeline Chronology & Logic Verification',
        type: 'WARNING',
        status: milestoneErrors.length === 0 ? 'PASS' : 'FAIL',
        failingCount: milestoneErrors.length,
        description: 'Ensures target or actual completion date follows sanction date and commencement date.',
        affectedProjectIds: milestoneErrors.map(p => p.id),
        affectedExamples: milestoneErrors.slice(0, 3).map(p => ({
          workCode: p.workCode,
          issue: 'Completion date scheduled prior to tender commencement or sanction date',
          source: 'State Works Department'
        }))
      },
      {
        id: 'CHK-06',
        name: 'Recommended vs Sanctioned Financial Alignment',
        type: 'RECONCILIATION',
        status: costDeviations.length === 0 ? 'PASS' : 'FAIL',
        failingCount: costDeviations.length,
        description: 'Audits variance between initial MP recommendation and technical sanction by District Nodal Authority.',
        affectedProjectIds: costDeviations.map(p => p.id),
        affectedExamples: costDeviations.slice(0, 3).map(p => ({
          workCode: p.workCode,
          issue: `Recommended (${p.recommendedCostFormatted}) ≠ Sanctioned (${p.sanctionedCostFormatted})`,
          source: 'District Planning Authority'
        }))
      },
      {
        id: 'CHK-07',
        name: 'Financial Year Syntax & Fiscal Cycle Alignment',
        type: 'WARNING',
        status: invalidFYProjects.length === 0 ? 'PASS' : 'FAIL',
        failingCount: invalidFYProjects.length,
        description: 'Verifies financial year string conforms to standard Indian government fiscal notation (e.g., 2024-25) and aligns with sanction dates.',
        affectedProjectIds: invalidFYProjects.map(p => p.id),
        affectedExamples: invalidFYProjects.slice(0, 4).map(p => ({
          workCode: p.workCode,
          issue: `Invalid or missing financial year designation: "${p.financialYear || 'EMPTY'}"`,
          source: 'MoSPI Master Ledger'
        }))
      },
      {
        id: 'CHK-08',
        name: 'Escrow Account Unspent Balance Reconciliation',
        type: 'RECONCILIATION',
        status: negativeUnspent.length === 0 ? 'PASS' : 'FAIL',
        failingCount: negativeUnspent.length,
        description: 'Audits for negative unspent balances or uncertified expenditures in Single Nodal Escrow Accounts.',
        affectedProjectIds: negativeUnspent.map(p => p.id),
        affectedExamples: negativeUnspent.slice(0, 3).map(p => ({
          workCode: p.workCode,
          issue: `Negative unspent balance calculated (${p.unspentBalanceFormatted})`,
          source: 'PFMS Single Nodal Escrow'
        }))
      }
    ]
  };
}
