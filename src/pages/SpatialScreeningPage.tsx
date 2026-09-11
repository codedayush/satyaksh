import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpatialRiskIntelligenceView } from '../components/SpatialRiskIntelligenceView';

export const SpatialScreeningPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Spatial Duplicate & Proximity Risk Screening | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <SpatialRiskIntelligenceView
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
      />
    </div>
  );
};
