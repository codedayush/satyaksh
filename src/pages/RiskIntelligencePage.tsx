import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IntelligenceDashboardView } from '../components/IntelligenceDashboardView';
import { useMpladsData } from '../context/MpladsDataContext';

export const RiskIntelligencePage: React.FC = () => {
  const { projects } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Risk Intelligence & Anomaly Screening | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <IntelligenceDashboardView
        projects={projects}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
        onNavigateToRiskIntelligence={() => navigate('/spatial-screening')}
      />
    </div>
  );
};
