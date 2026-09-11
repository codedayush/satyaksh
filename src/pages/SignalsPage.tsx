import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransparencySignalsView } from '../components/TransparencySignalsView';

export const SignalsPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Transparency Signals, Contractor Collusion & Anomalies | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <TransparencySignalsView
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
        onSelectMP={(mpId) => navigate(`/mps/${mpId}`)}
      />
    </div>
  );
};
