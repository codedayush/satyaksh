import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext';
import { OfficerAuthProvider } from './context/OfficerAuthContext';
import { MpladsDataProvider } from './context/MpladsDataContext';
import { RootLayout } from './layouts/RootLayout';

// Modular Multi-Page Views
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { MPProfilePage } from './pages/MPProfilePage';
import { CompareMPsPage } from './pages/CompareMPsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RiskIntelligencePage } from './pages/RiskIntelligencePage';
import { SpatialScreeningPage } from './pages/SpatialScreeningPage';
import { GeospatialTrackerPage } from './pages/GeospatialTrackerPage';
import { StatesPage } from './pages/StatesPage';
import { MoneyFlowPage } from './pages/MoneyFlowPage';
import { SignalsPage } from './pages/SignalsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { GrievancesPage } from './pages/GrievancesPage';
import { DataHealthPage } from './pages/DataHealthPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <I18nProvider>
      <OfficerAuthProvider>
        <MpladsDataProvider>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              {/* 1. National Overview (Homepage) */}
              <Route index element={<HomePage />} />

              {/* 2. Public Works Master Ledger */}
              <Route path="projects" element={<ProjectsPage />} />

              {/* 3. Deep-linked Project Detail Page */}
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />

              {/* 4. Parliamentarian Profiles */}
              <Route path="mps" element={<Navigate to="/compare-mps" replace />} />
              <Route path="mps/:mpId" element={<MPProfilePage />} />

              {/* 5. Compare MPs */}
              <Route path="compare-mps" element={<CompareMPsPage />} />

              {/* 6. Project Monitoring & Analytics Dashboard */}
              <Route path="analytics" element={<AnalyticsPage />} />

              {/* 7. Risk Intelligence */}
              <Route path="risk-intelligence" element={<RiskIntelligencePage />} />

              {/* 8. Spatial Duplicate & Proximity Screening */}
              <Route path="spatial-screening" element={<SpatialScreeningPage />} />

              {/* 9. Geospatial Project Tracker */}
              <Route path="geospatial-tracker" element={<GeospatialTrackerPage />} />

              {/* 10. States & UTs Financial Drilldown */}
              <Route path="states" element={<StatesPage />} />

              {/* 11. Statutory Fund Flow */}
              <Route path="money-flow" element={<MoneyFlowPage />} />

              {/* 12. Transparency Signals & Red Flags */}
              <Route path="signals" element={<SignalsPage />} />

              {/* 13. Vigilance Investigations & Dossiers */}
              <Route path="investigations" element={<InvestigationsPage />} />

              {/* 14. Geotagged Evidence Vault */}
              <Route path="evidence-vault" element={<EvidenceVaultPage />} />

              {/* 15. Citizen Grievance & Public Action */}
              <Route path="grievances" element={<GrievancesPage />} />

              {/* 16. Data Provenance & Schema Health */}
              <Route path="data-health" element={<DataHealthPage />} />

              {/* 17. Official Data Sources & MoSPI Provenance */}
              <Route path="data-sources" element={<DataSourcesPage />} />

              {/* Backward-compatible aliases and direct shortcuts */}
              <Route path="realtime-dashboard" element={<Navigate to="/analytics" replace />} />
              <Route path="compare" element={<Navigate to="/compare-mps" replace />} />
              <Route path="intelligence" element={<Navigate to="/spatial-screening" replace />} />
              <Route path="evidence" element={<Navigate to="/evidence-vault" replace />} />
              <Route path="sources" element={<Navigate to="/data-sources" replace />} />
              <Route path="geospatial-map" element={<Navigate to="/geospatial-tracker" replace />} />
              <Route path="risk-dashboard" element={<Navigate to="/risk-intelligence" replace />} />

              {/* 404 Catch-All Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </MpladsDataProvider>
      </OfficerAuthProvider>
    </I18nProvider>
  );
}

export default App;
