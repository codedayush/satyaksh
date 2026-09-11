import { MP, Project, StateStats } from '../types';

export interface ExportReportOptions {
  title: string;
  filtersUsed?: Record<string, string>;
  dataPeriod?: string;
  sourceCitation?: string;
}

export function exportToCSV(filename: string, rows: Record<string, any>[], options?: ExportReportOptions) {
  if (!rows || rows.length === 0) return;

  const headerKeys = Object.keys(rows[0]);
  
  // SATYAKSH Report Header Metadata
  const metadataLines = [
    `# ========================================================`,
    `# SATYAKSH - Public Accountability & Financial Intelligence Platform`,
    `# Tagline: See Where Public Money Goes.`,
    `# Report Title: ${options?.title || 'MPLADS Data Export'}`,
    `# Generated At: ${new Date().toISOString()}`,
    `# Data Period: ${options?.dataPeriod || '18th Lok Sabha (2024-2029)'}`,
    `# Source Citation: ${options?.sourceCitation || 'MoSPI / Official MPLADS Portal (mplads.gov.in) & Data.gov.in'}`,
    `# Disclaimer: Sourced from official public government records. SATYAKSH is an independent transparency platform.`,
    `# ========================================================`,
    ''
  ];

  const csvRows = [
    metadataLines.join('\n'),
    headerKeys.join(','),
    ...rows.map(row => 
      headerKeys.map(key => {
        const val = row[key];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    )
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProjectsToCSV(projects: Project[], filters?: Record<string, string>) {
  const formattedRows = projects.map(p => ({
    'Work Code': p.workCode,
    'Project Title': p.title,
    'MP Name': p.mpName,
    'Party': p.mpParty,
    'House': p.house,
    'Constituency': p.constituency,
    'State': p.state,
    'District': p.district,
    'Sector': p.sector,
    'Recommended Cost (Lakh)': p.recommendedCost,
    'Sanctioned Cost (Lakh)': p.sanctionedCost,
    'Expenditure (Lakh)': p.expenditure,
    'Unspent Balance (Lakh)': p.unspentBalance,
    'Work Status': p.workStatus,
    'Physical Progress %': p.physicalProgress,
    'Financial Year': p.financialYear,
    'Sanction Date': p.sanctionDate,
    'Completion Date': p.actualCompletionDate || p.expectedCompletionDate,
    'Implementing Agency': p.implementingAgency,
    'Source': p.source
  }));

  exportToCSV('SATYAKSH_MPLADS_Projects', formattedRows, {
    title: 'MPLADS Project-Level Transparency Register ("Where the Money Went")',
    filtersUsed: filters,
    dataPeriod: '18th Lok Sabha / Current Financial Records'
  });
}

export function exportMPsToCSV(mps: MP[], filters?: Record<string, string>) {
  const formattedRows = mps.map(m => ({
    'MP ID': m.id,
    'MP Name': m.name,
    'Party': m.party,
    'House': m.house,
    'State': m.state,
    'Constituency': m.constituency,
    'Entitlement (Cr)': m.entitlementCr,
    'Funds Released by GoI (Cr)': m.fundsReleasedCr,
    'Funds Available with District (Cr)': m.fundsAvailableCr,
    'Recommended Works Value (Cr)': m.recommendedCostCr,
    'Sanctioned Works Value (Cr)': m.sanctionedCostCr,
    'Actual Certified Expenditure (Cr)': m.expenditureCr,
    'Unspent Balance with District (Cr)': m.unspentBalanceCr,
    'Unsanctioned Balance (Cr)': m.unsanctionedBalanceCr,
    'Utilization Rate %': m.utilizationRate,
    'Total Projects Recommended': m.recommendedCount,
    'Total Projects Sanctioned': m.sanctionedCount,
    'Projects Completed': m.completedCount,
    'Projects In Progress': m.inProgressCount,
    'Last Updated': m.lastUpdated,
    'Official Source': m.source
  }));

  exportToCSV('SATYAKSH_MP_Performance_Ledger', formattedRows, {
    title: 'MPLADS Member of Parliament Allocation, Release & Expenditure Ledger',
    filtersUsed: filters,
    dataPeriod: '18th Lok Sabha'
  });
}

export function exportStatesToCSV(states: StateStats[]) {
  const formattedRows = states.map(s => ({
    'State / UT': s.stateName,
    'State Code': s.stateCode,
    'Lok Sabha Seats': s.lokSabhaSeats,
    'Rajya Sabha Seats': s.rajyaSabhaSeats,
    'Total Entitlement (Cr)': s.fundsEntitledCr,
    'Funds Released by GoI (Cr)': s.fundsReleasedCr,
    'Total Expenditure (Cr)': s.expenditureCr,
    'Unspent Balance (Cr)': s.unspentFundsCr,
    'Utilization Rate %': s.utilizationRate,
    'Total Works': s.totalWorks,
    'Completed Works': s.completedWorks,
    'In Progress Works': s.inProgressWorks
  }));

  exportToCSV('SATYAKSH_State_Performance_Summary', formattedRows, {
    title: 'Pan-India State & UT MPLADS Fund Disbursal and Utilization Register'
  });
}
