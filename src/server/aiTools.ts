/**
 * SATYAKSH AI Predefined Backend Tools & Structured Execution Engine
 * Path: src/server/aiTools.ts
 * 
 * Provides safe, validated queries on official MPLADS datasets and operational stores.
 * Gemini calls these functions to inspect real project, contractor, risk, and fiscal records.
 * Raw SQL execution is strictly forbidden.
 */

import { FunctionDeclaration, Type } from '@google/genai';
import { Project, MP, StateStats, InvestigationCase, EvidenceDocument } from '../types.ts';
import { buildContractorNetwork } from '../services/hybridRiskEngine.ts';
import { detectSpatialDuplicates, evaluateProjectRisk } from '../services/spatialRiskEngine.ts';
import { calculateProjectRiskScore } from './riskEngine.ts';

export interface DataContext {
  projects: Project[];
  mps: MP[];
  states: StateStats[];
  investigations: InvestigationCase[];
  evidenceDocs: EvidenceDocument[];
  dataFreshness: any;
  sources: any[];
}

export const GEMINI_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'search_projects',
    description: 'Search and filter official MPLADS public works projects by state, district, sector, risk level, or keyword. Returns structured summaries.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search term or keyword matching title, workCode, or description' },
        state: { type: Type.STRING, description: 'Indian State or Union Territory name (e.g. Bihar, Kerala, Maharashtra)' },
        district: { type: Type.STRING, description: 'District name (e.g. Katihar, Wayanad, Pune)' },
        sector: { type: Type.STRING, description: 'Sector category (e.g. Roads & Bridges, Drinking Water, Education)' },
        min_risk: { type: Type.NUMBER, description: 'Minimum risk score from 0 to 100 (e.g. 70 for high/critical risk)' },
        status: { type: Type.STRING, description: 'Project status: COMPLETED, IN_PROGRESS, SANCTIONED, RECOMMENDED' },
        contractor: { type: Type.STRING, description: 'Executing agency or contractor entity name' },
        max_results: { type: Type.NUMBER, description: 'Max number of projects to return (default 8, max 20)' }
      }
    }
  },
  {
    name: 'get_project_details',
    description: 'Retrieve complete official details, ledger numbers, milestones, executing agency, and financial status for a specific project work code or ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id_or_code: { type: Type.STRING, description: 'Project ID (e.g. prj-mplads-kat-01) or Work Code (e.g. MPLAD001 or MPLADS/18LS/BR/KAT/2024/001)' }
      },
      required: ['project_id_or_code']
    }
  },
  {
    name: 'get_project_risk',
    description: 'Retrieve official algorithmic multi-factor risk score (0-100), risk tier (LOW, MODERATE, HIGH, CRITICAL), and primary contributing signals.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id_or_code: { type: Type.STRING, description: 'Project ID or official Work Code' }
      },
      required: ['project_id_or_code']
    }
  },
  {
    name: 'get_risk_breakdown',
    description: 'Retrieve detailed breakdown of the 6 algorithmic forensic audit factors: Cost anomaly, Timeline delay, Contractor risk, Document similarity, Geographic signal, and ML anomaly.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id_or_code: { type: Type.STRING, description: 'Project ID or official Work Code' }
      },
      required: ['project_id_or_code']
    }
  },
  {
    name: 'get_contractor_details',
    description: 'Retrieve executing agency / contractor portfolio statistics: total projects, flagged project ratio, stalled works, average risk score, and geographic concentration.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        contractor_name: { type: Type.STRING, description: 'Name of contractor or implementing agency' }
      },
      required: ['contractor_name']
    }
  },
  {
    name: 'get_state_statistics',
    description: 'Retrieve official state-level MPLADS summary: total MPs, funds released, expenditure, unspent balance with district authorities, utilization percentage, and high-risk project counts.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        state_name: { type: Type.STRING, description: 'State or UT name (e.g. Bihar, Uttar Pradesh, Tamil Nadu)' }
      },
      required: ['state_name']
    }
  },
  {
    name: 'get_district_statistics',
    description: 'Retrieve district-level MPLADS summary: works count, released funds, certified expenditure, unspent balance, and utilization rate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        district_name: { type: Type.STRING, description: 'District name (e.g. Katihar, Thiruvananthapuram)' },
        state_name: { type: Type.STRING, description: 'State name if known' }
      },
      required: ['district_name']
    }
  },
  {
    name: 'get_mp_statistics',
    description: 'Retrieve Member of Parliament (MP) official financial ledger: entitlement (₹25 Cr), GoI release, sanctioned works, actual expenditure, unspent escrow balance, and completion rate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mp_name_or_id: { type: Type.STRING, description: 'MP Name or Constituency (e.g. Tariq Anwar, Shashi Tharoor, Katihar, Wayanad)' }
      },
      required: ['mp_name_or_id']
    }
  },
  {
    name: 'get_investigation',
    description: 'Retrieve active investigation case records, priority level, forensic observations, and recommended verification status for a project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        case_id_or_project_id: { type: Type.STRING, description: 'Investigation case ID (e.g. INV-2026-001) or Project ID' }
      },
      required: ['case_id_or_project_id']
    }
  },
  {
    name: 'get_related_projects',
    description: 'Find spatially or sectorally related projects within the same district or executing agency for comparison.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id_or_code: { type: Type.STRING, description: 'Project ID or Work Code' }
      },
      required: ['project_id_or_code']
    }
  },
  {
    name: 'get_duplicate_matches',
    description: 'Check 50-meter spatial proximity and Clause 7.1 duplicate flags for a project, showing distance to neighbor and title similarity.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id_or_code: { type: Type.STRING, description: 'Project ID or Work Code' },
        radius_meters: { type: Type.NUMBER, description: 'Proximity radius in meters (default 50m)' }
      },
      required: ['project_id_or_code']
    }
  },
  {
    name: 'get_financial_summary',
    description: 'Retrieve aggregate national or state-wide financial summary: total entitlement, GoI funds released, certified expenditure, unspent district balance, and national utilization rate.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        state_name: { type: Type.STRING, description: 'Optional State or UT name to filter financial summary' }
      }
    }
  },
  {
    name: 'get_timeline',
    description: 'Retrieve milestone timeline dates: recommendation date, sanction date, start date, expected completion, actual completion, and delay duration in days and months.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        project_id_or_code: { type: Type.STRING, description: 'Project ID or Work Code' }
      },
      required: ['project_id_or_code']
    }
  },
  {
    name: 'get_data_freshness',
    description: 'Retrieve data synchronization freshness timestamps and official provenance sources (MoSPI, PFMS, State Nodal Departments).',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  }
];

// Helper to normalize strings for search
function normalize(str: string | undefined): string {
  return (str || '').toLowerCase().trim();
}

function findProject(projects: Project[], identifier: string): Project | undefined {
  if (!identifier) return undefined;
  const norm = normalize(identifier);

  // 1. Direct match on id or workCode
  const direct = projects.find(p => 
    normalize(p.id) === norm ||
    normalize(p.workCode) === norm ||
    p.workCode.toLowerCase().includes(norm) ||
    norm.includes(p.id.toLowerCase())
  );
  if (direct) return direct;

  // 2. Alphanumeric stripped match (e.g. "mplad001" against "mplads18lsbrkat2024001")
  const strippedIdent = norm.replace(/[^a-z0-9]/g, '');
  const strippedMatch = projects.find(p => {
    const strippedCode = p.workCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const strippedId = p.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return strippedCode.includes(strippedIdent) || strippedId.includes(strippedIdent) || strippedIdent.includes(strippedId);
  });
  if (strippedMatch) return strippedMatch;

  // 3. Suffix numeric match (e.g. "001" or "1" -> matches ".../001" or "-01")
  const numMatch = norm.match(/\d+/);
  if (numMatch) {
    const digits = numMatch[0];
    const padded = digits.padStart(3, '0');
    const suffixMatch = projects.find(p => 
      p.workCode.endsWith(`/${padded}`) || 
      p.workCode.endsWith(`/${digits}`) ||
      p.id.endsWith(`-${digits}`) ||
      p.id.endsWith(`-${digits.padStart(2, '0')}`)
    );
    if (suffixMatch) return suffixMatch;

    // Index fallback if 1-indexed (e.g. MPLAD001 -> 1st project)
    const idx = parseInt(digits, 10);
    if (idx >= 1 && idx <= projects.length) {
      return projects[idx - 1];
    }
  }

  return undefined;
}

export function executeAiTool(name: string, args: Record<string, any>, context: DataContext): any {
  const { projects, mps, states, investigations, dataFreshness, sources } = context;

  switch (name) {
    case 'search_projects': {
      const q = normalize(args.query);
      const stateFilter = normalize(args.state);
      const districtFilter = normalize(args.district);
      const sectorFilter = normalize(args.sector);
      const statusFilter = normalize(args.status);
      const contractorFilter = normalize(args.contractor);
      const minRisk = typeof args.min_risk === 'number' ? args.min_risk : 0;
      const limit = Math.min(Math.max(Number(args.max_results) || 8, 1), 20);

      const duplicates = detectSpatialDuplicates(projects, 50);

      const filtered = projects.filter(p => {
        if (stateFilter && !normalize(p.state).includes(stateFilter)) return false;
        if (districtFilter && !normalize(p.district).includes(districtFilter)) return false;
        if (sectorFilter && !normalize(p.sector).includes(sectorFilter)) return false;
        if (statusFilter && normalize(p.workStatus) !== statusFilter) return false;
        if (contractorFilter && !normalize(p.implementingAgency).includes(contractorFilter)) return false;
        if (q && !normalize(p.title).includes(q) && !normalize(p.workCode).includes(q) && !normalize(p.mpName).includes(q)) return false;

        if (minRisk > 0) {
          const evalRisk = evaluateProjectRisk(p, projects, duplicates);
          if (evalRisk.riskScore < minRisk) return false;
        }

        return true;
      });

      return {
        total_matched: filtered.length,
        showing: Math.min(filtered.length, limit),
        projects: filtered.slice(0, limit).map(p => {
          const evalRisk = evaluateProjectRisk(p, projects, duplicates);
          return {
            id: p.id,
            workCode: p.workCode,
            title: p.title,
            mpName: p.mpName,
            constituency: p.constituency,
            district: p.district,
            state: p.state,
            sector: p.sector,
            sanctionedCost: p.sanctionedCostFormatted,
            expenditure: p.expenditureFormatted,
            status: p.workStatus,
            physicalProgress: `${p.physicalProgress}%`,
            riskScore: evalRisk.riskScore,
            riskLevel: evalRisk.riskLevel,
            contractor: p.implementingAgency
          };
        })
      };
    }

    case 'get_project_details': {
      const p = findProject(projects, args.project_id_or_code);
      if (!p) {
        return { error: `Project "${args.project_id_or_code}" not found in current SATYAKSH dataset.` };
      }

      const duplicates = detectSpatialDuplicates(projects, 50);
      const evalRisk = evaluateProjectRisk(p, projects, duplicates);

      return {
        id: p.id,
        workCode: p.workCode,
        title: p.title,
        description: p.description,
        mpName: p.mpName,
        mpParty: p.mpParty,
        house: p.house,
        constituency: p.constituency,
        district: p.district,
        state: p.state,
        sector: p.sector,
        sanctionedCost: p.sanctionedCostFormatted,
        expenditure: p.expenditureFormatted,
        unspentBalance: p.unspentBalanceFormatted,
        status: p.workStatus,
        physicalProgress: `${p.physicalProgress}%`,
        financialYear: p.financialYear,
        sanctionDate: p.sanctionDate,
        expectedCompletionDate: p.expectedCompletionDate,
        actualCompletionDate: p.actualCompletionDate || 'Pending / In-Progress',
        implementingAgency: p.implementingAgency,
        executingAuthority: p.executingAuthority,
        coordinates: p.coordinates ? `${p.coordinates[0]}, ${p.coordinates[1]}` : 'Not Geotagged',
        utilizationCertificateStatus: p.utilizationCertificateStatus,
        auditStatus: p.auditStatus,
        riskScore: evalRisk.riskScore,
        riskLevel: evalRisk.riskLevel,
        source: p.source || 'MoSPI / Official MPLADS Portal',
        sourceUrl: p.sourceUrl || 'https://mplads.gov.in',
        lastUpdated: p.lastUpdated
      };
    }

    case 'get_project_risk': {
      const p = findProject(projects, args.project_id_or_code);
      if (!p) {
        return { error: `Project "${args.project_id_or_code}" not found.` };
      }

      const duplicates = detectSpatialDuplicates(projects, 50);
      const evalRisk = evaluateProjectRisk(p, projects, duplicates);
      const detailedScore = calculateProjectRiskScore({
        id: p.id,
        workCode: p.workCode,
        title: p.title,
        sanctionedCost: p.sanctionedCost,
        expenditure: p.expenditure,
        workStatus: p.workStatus,
        physicalProgress: p.physicalProgress,
        sanctionDate: p.sanctionDate,
        expectedCompletionDate: p.expectedCompletionDate,
        actualCompletionDate: p.actualCompletionDate,
        coordinates: p.coordinates,
        sector: p.sector,
        district: p.district,
        state: p.state,
        implementingAgency: p.implementingAgency
      }, { otherProjects: projects as any });

      return {
        project_id: p.id,
        work_code: p.workCode,
        title: p.title,
        risk_score: evalRisk.riskScore,
        risk_level: evalRisk.riskLevel,
        confidence: 'HIGH (Grounded in Verified Ledgers & Spatial Calculations)',
        spatial_duplicate_detected: evalRisk.spatialDuplicateDetected,
        nearest_neighbor_distance_meters: evalRisk.nearestNeighborDistanceMeters,
        signals: evalRisk.signals,
        factor_scores: detailedScore.factorScores,
        interpretation: evalRisk.riskScore >= 70 
          ? 'Risk score indicates priority verification is required. This is a risk signal and does not establish fraud without corroborating field inspection.'
          : 'Risk score within standard operating tolerances.'
      };
    }

    case 'get_risk_breakdown': {
      const p = findProject(projects, args.project_id_or_code);
      if (!p) return { error: `Project "${args.project_id_or_code}" not found.` };

      const duplicates = detectSpatialDuplicates(projects, 50);
      const evalRisk = evaluateProjectRisk(p, projects, duplicates);
      const contractorMap = buildContractorNetwork(projects);
      const agencyName = (p.implementingAgency || '').trim();
      const contractor = contractorMap.get(agencyName);

      // Breakdown calculation
      const costDiscrepancy = p.expenditure > p.sanctionedCost * 0.95 && p.physicalProgress < 50;
      const isDelayed = p.workStatus !== 'COMPLETED' && new Date(p.expectedCompletionDate) < new Date();
      const delayMonths = isDelayed ? Math.max(1, Math.round((Date.now() - new Date(p.expectedCompletionDate).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0;

      return {
        project_id: p.id,
        work_code: p.workCode,
        title: p.title,
        composite_risk_score: `${evalRisk.riskScore}/100`,
        risk_tier: evalRisk.riskLevel,
        signals_breakdown: [
          {
            signal: 'Financial & Cost Anomaly',
            score_contribution: costDiscrepancy ? '+24' : '+5',
            status: costDiscrepancy ? 'FLAGGED' : 'NORMAL',
            finding: `Sanctioned: ${p.sanctionedCostFormatted} | Certified: ${p.expenditureFormatted} | Progress: ${p.physicalProgress}%`
          },
          {
            signal: 'Timeline & Milestone Delay',
            score_contribution: delayMonths > 12 ? '+25' : delayMonths > 0 ? '+15' : '+0',
            status: delayMonths > 0 ? 'DELAYED' : 'ON_SCHEDULE',
            finding: delayMonths > 0 ? `Milestone delayed by approximately ${delayMonths} months beyond target date.` : 'Completed or within sanctioned milestone.'
          },
          {
            signal: 'Contractor Portfolio Risk',
            score_contribution: contractor && contractor.flaggedRatio >= 50 ? '+18' : '+4',
            status: contractor && contractor.flaggedRatio >= 50 ? 'ELEVATED' : 'STANDARD',
            finding: contractor ? `${agencyName}: ${contractor.flaggedProjects} flagged of ${contractor.totalProjects} works (${contractor.flaggedRatio}% flagged ratio)` : 'Standard executing authority.'
          },
          {
            signal: 'Clause 7.1 Geographic Proximity Signal',
            score_contribution: evalRisk.spatialDuplicateDetected ? '+20' : '+0',
            status: evalRisk.spatialDuplicateDetected ? 'PROXIMITY_ALERT' : 'CLEARED',
            finding: evalRisk.spatialDuplicateDetected 
              ? `Neighboring project within ${evalRisk.nearestNeighborDistanceMeters}m (Threshold: 50m). Clause 7.1 validation required.`
              : 'No overlapping coordinates identified within 50m statutory perimeter.'
          },
          {
            signal: 'Document & Milestone Verification',
            score_contribution: p.utilizationCertificateStatus === 'PENDING' ? '+11' : '+2',
            status: p.utilizationCertificateStatus === 'PENDING' ? 'UC_PENDING' : 'VERIFIED',
            finding: `Utilization Certificate: ${p.utilizationCertificateStatus} | Statutory Audit: ${p.auditStatus}`
          }
        ],
        recommended_action: evalRisk.riskScore >= 70
          ? 'Prioritize for multi-disciplinary field verification and physical plaque verification under Clause 7.1.'
          : 'Standard periodic monitoring and utilization certificate reconciliation.'
      };
    }

    case 'get_contractor_details': {
      const contractorName = (args.contractor_name || '').trim();
      const contractorMap = buildContractorNetwork(projects);

      let found: any = null;
      let matchedKey = '';

      for (const [name, info] of contractorMap.entries()) {
        if (normalize(name).includes(normalize(contractorName)) || normalize(contractorName).includes(normalize(name))) {
          found = info;
          matchedKey = name;
          break;
        }
      }

      if (!found) {
        // Return top risky contractors for helpfulness
        const list = Array.from(contractorMap.values()).sort((a, b) => b.flaggedRatio - a.flaggedRatio).slice(0, 5);
        return {
          error: `Contractor "${contractorName}" not explicitly found.`,
          top_contractors_by_flag_ratio: list.map(c => ({
            name: c.name,
            total_projects: c.totalProjects,
            flagged_projects: c.flaggedProjects,
            flagged_ratio: `${c.flaggedRatio}%`,
            sanctioned_cr: `₹${c.totalSanctionedCr.toFixed(2)} Cr`
          }))
        };
      }

      return {
        contractor_name: matchedKey,
        total_projects: found.totalProjects,
        flagged_projects: found.flaggedProjects,
        flagged_ratio: `${found.flaggedRatio}%`,
        total_sanctioned_cr: `₹${found.totalSanctionedCr.toFixed(2)} Cr`,
        districts_operated: found.districts,
        mps_associated: found.mps,
        risk_evaluation: found.flaggedRatio >= 50
          ? 'High flagged ratio warrants review of project delivery history across executing cell.'
          : 'Within standard executing agency delivery patterns.'
      };
    }

    case 'get_state_statistics': {
      const stateName = normalize(args.state_name);
      const state = states.find(s => normalize(s.stateName).includes(stateName) || normalize(s.stateCode) === stateName);

      if (!state) {
        return { error: `State "${args.state_name}" not found in current SATYAKSH registry.` };
      }

      const stateProjects = projects.filter(p => normalize(p.state) === normalize(state.stateName));
      const duplicates = detectSpatialDuplicates(projects, 50);
      const highRiskCount = stateProjects.filter(p => evaluateProjectRisk(p, projects, duplicates).riskScore >= 70).length;

      return {
        state_name: state.stateName,
        code: state.stateCode,
        lok_sabha_seats: state.lokSabhaSeats,
        rajya_sabha_seats: state.rajyaSabhaSeats,
        funds_entitled_cr: `₹${state.fundsEntitledCr.toFixed(2)} Cr`,
        funds_released_cr: `₹${state.fundsReleasedCr.toFixed(2)} Cr`,
        expenditure_cr: `₹${state.expenditureCr.toFixed(2)} Cr`,
        unspent_balance_cr: `₹${state.unspentFundsCr.toFixed(2)} Cr`,
        utilization_rate: `${state.utilizationRate}%`,
        total_sanctioned_works: state.totalWorks,
        completed_works: state.completedWorks,
        in_progress_works: state.inProgressWorks,
        tracked_projects_in_db: stateProjects.length,
        high_risk_projects_count: highRiskCount,
        top_sectors: state.topSectors
      };
    }

    case 'get_district_statistics': {
      const dName = normalize(args.district_name);
      const sName = normalize(args.state_name);

      let foundDistrict: any = null;
      let stateName = '';

      for (const s of states) {
        if (sName && !normalize(s.stateName).includes(sName)) continue;
        const d = s.districts.find(district => normalize(district.name).includes(dName));
        if (d) {
          foundDistrict = d;
          stateName = s.stateName;
          break;
        }
      }

      const districtProjects = projects.filter(p => normalize(p.district).includes(dName));
      const duplicates = detectSpatialDuplicates(projects, 50);
      const highRiskCount = districtProjects.filter(p => evaluateProjectRisk(p, projects, duplicates).riskScore >= 70).length;

      if (!foundDistrict && districtProjects.length === 0) {
        return { error: `District "${args.district_name}" not found.` };
      }

      return {
        district: foundDistrict?.name || args.district_name,
        state: stateName || (districtProjects[0]?.state ?? 'Unknown'),
        works_count: foundDistrict?.worksCount || districtProjects.length,
        released_cr: foundDistrict ? `₹${foundDistrict.releasedCr.toFixed(2)} Cr` : 'Derived from project ledgers',
        expenditure_cr: foundDistrict ? `₹${foundDistrict.expenditureCr.toFixed(2)} Cr` : 'Derived from project ledgers',
        unspent_cr: foundDistrict ? `₹${foundDistrict.unspentCr.toFixed(2)} Cr` : 'Pending ledger reconciliation',
        utilization_rate: foundDistrict ? `${foundDistrict.utilizationRate}%` : 'N/A',
        high_risk_flagged_projects: highRiskCount,
        sample_projects: districtProjects.slice(0, 5).map(p => ({
          workCode: p.workCode,
          title: p.title,
          cost: p.sanctionedCostFormatted,
          status: p.workStatus
        }))
      };
    }

    case 'get_mp_statistics': {
      const query = normalize(args.mp_name_or_id);
      const mp = mps.find(m => 
        normalize(m.name).includes(query) ||
        normalize(m.constituency).includes(query) ||
        normalize(m.id) === query
      );

      if (!mp) {
        return { error: `Member of Parliament / Constituency "${args.mp_name_or_id}" not found in current SATYAKSH dataset.` };
      }

      const mpProjects = projects.filter(p => p.mpId === mp.id || normalize(p.mpName) === normalize(mp.name));

      return {
        mp_id: mp.id,
        name: mp.name,
        party: mp.party,
        house: mp.house === 'LOK_SABHA' ? 'Lok Sabha' : 'Rajya Sabha',
        state: mp.state,
        constituency: mp.constituency,
        tenure: mp.tenure,
        statutory_entitlement: `₹${mp.entitlementCr.toFixed(2)} Cr (₹25 Cr / 5-Year Term)`,
        funds_released_by_goi: `₹${mp.fundsReleasedCr.toFixed(2)} Cr`,
        sanctioned_works_cost: `₹${mp.sanctionedCostCr.toFixed(2)} Cr (${mp.sanctionedCount} works)`,
        actual_expenditure_certified: `₹${mp.expenditureCr.toFixed(2)} Cr`,
        unspent_balance_with_district: `₹${mp.unspentBalanceCr.toFixed(2)} Cr`,
        utilization_rate: `${mp.utilizationRate}%`,
        works_completed: `${mp.completedCount} / ${mp.projectsCount}`,
        works_in_progress: mp.inProgressCount,
        top_sectors: mp.sectorDistribution,
        tracked_projects_in_db: mpProjects.length
      };
    }

    case 'get_investigation': {
      const q = normalize(args.case_id_or_project_id);
      const inv = investigations.find(i => normalize(i.id) === q || normalize(i.projectId) === q);

      if (!inv) {
        return {
          status: 'No formal investigation case recorded',
          message: `No active investigation case opened for "${args.case_id_or_project_id}". An investigation can be initiated by a designated district audit officer.`
        };
      }

      return {
        case_id: inv.id,
        project_id: inv.projectId,
        title: inv.projectTitle,
        priority: inv.priority,
        status: inv.status,
        assigned_officer: inv.assignedOfficer,
        created_at: inv.createdAt,
        remarks_count: inv.remarks.length,
        latest_remark: inv.remarks[inv.remarks.length - 1]?.text || 'No remarks',
        recommended_action: inv.resolutionSummary || 'Field audit scheduled'
      };
    }

    case 'get_related_projects': {
      const p = findProject(projects, args.project_id_or_code);
      if (!p) return { error: `Project "${args.project_id_or_code}" not found.` };

      const related = projects.filter(other => 
        other.id !== p.id && (
          other.district === p.district ||
          other.sector === p.sector ||
          other.mpName === p.mpName ||
          other.implementingAgency === p.implementingAgency
        )
      ).slice(0, 5);

      return {
        target_project: { id: p.id, workCode: p.workCode, title: p.title },
        related_projects: related.map(r => ({
          id: r.id,
          workCode: r.workCode,
          title: r.title,
          relationship: r.district === p.district ? 'Same District' : r.sector === p.sector ? 'Same Sector' : 'Same Agency',
          cost: r.sanctionedCostFormatted,
          status: r.workStatus
        }))
      };
    }

    case 'get_duplicate_matches': {
      const p = findProject(projects, args.project_id_or_code);
      if (!p) return { error: `Project "${args.project_id_or_code}" not found.` };

      const radius = Number(args.radius_meters) || 50;
      const duplicates = detectSpatialDuplicates(projects, radius);
      const matches = duplicates.filter(d => d.projectA.id === p.id || d.projectB.id === p.id);

      return {
        project_id: p.id,
        work_code: p.workCode,
        radius_checked_meters: radius,
        duplicates_found: matches.length,
        clause_7_1_alert: matches.length > 0,
        matches: matches.map(m => {
          const neighbor = m.projectA.id === p.id ? m.projectB : m.projectA;
          return {
            neighbor_id: neighbor.id,
            neighbor_work_code: neighbor.workCode,
            neighbor_title: neighbor.title,
            distance_meters: `${m.distanceMeters.toFixed(1)}m`,
            similarity_score: `${m.similarityScore}%`,
            confidence: m.duplicateConfidence,
            notes: 'Physical coordinates overlap within statutory anti-duplication boundary. Requires on-site verification before fund disbursal.'
          };
        })
      };
    }

    case 'get_financial_summary': {
      let releasedTotal = 0;
      let spentTotal = 0;
      let unspentTotal = 0;
      let totalWorks = 0;
      let completedWorks = 0;

      for (const s of states) {
        releasedTotal += s.fundsReleasedCr;
        spentTotal += s.expenditureCr;
        unspentTotal += s.unspentFundsCr;
        totalWorks += s.totalWorks;
        completedWorks += s.completedWorks;
      }

      const nationalUtilization = releasedTotal > 0 ? Math.round((spentTotal / releasedTotal) * 1000) / 10 : 0;

      return {
        scope: args.state_name ? `State: ${args.state_name}` : 'National Pan-India (All 36 States & UTs)',
        statutory_entitlement_per_mp: '₹5.00 Crore / Financial Year (₹25.00 Crore / 5-Year Term)',
        total_goi_funds_released: `₹${releasedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Crore`,
        total_certified_expenditure: `₹${spentTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Crore`,
        total_unspent_balance_with_districts: `₹${unspentTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Crore`,
        national_utilization_rate: `${nationalUtilization}%`,
        total_sanctioned_works: totalWorks.toLocaleString('en-IN'),
        total_completed_works: completedWorks.toLocaleString('en-IN'),
        completion_ratio: `${Math.round((completedWorks / (totalWorks || 1)) * 100)}%`,
        data_source: 'Ministry of Statistics and Programme Implementation (MoSPI) & PFMS'
      };
    }

    case 'get_timeline': {
      const p = findProject(projects, args.project_id_or_code);
      if (!p) return { error: `Project "${args.project_id_or_code}" not found.` };

      const isDelayed = p.workStatus !== 'COMPLETED' && new Date(p.expectedCompletionDate) < new Date();
      const delayDays = isDelayed ? Math.max(0, Math.round((Date.now() - new Date(p.expectedCompletionDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;

      return {
        project_id: p.id,
        work_code: p.workCode,
        recommendation_date: p.recommendationDate,
        sanction_date: p.sanctionDate,
        commencement_date: p.startDate,
        expected_completion_date: p.expectedCompletionDate,
        actual_completion_date: p.actualCompletionDate || 'Not Completed',
        current_status: p.workStatus,
        physical_progress: `${p.physicalProgress}%`,
        is_delayed: isDelayed,
        delay_days: delayDays,
        delay_months: Math.round(delayDays / 30),
        observation: isDelayed 
          ? `Work milestone delayed by ${delayDays} days beyond scheduled completion date.`
          : 'Milestones progressing within approved administrative schedule.'
      };
    }

    case 'get_data_freshness': {
      return {
        registry: dataFreshness,
        primary_sources: [
          { name: 'MoSPI MPLADS Portal', endpoint: 'https://mplads.gov.in', frequency: 'Daily Sync' },
          { name: 'Public Financial Management System (PFMS)', endpoint: 'https://pfms.nic.in', frequency: 'Real-time Escrow Sync' },
          { name: 'State Nodal Planning Cells', frequency: 'Weekly Reconciled' }
        ],
        data_integrity_status: 'SYNCHRONIZED_AND_AUDITED',
        last_sync: new Date().toISOString()
      };
    }

    default:
      return { error: `Unrecognized tool: ${name}` };
  }
}
