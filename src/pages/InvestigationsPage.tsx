import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { InvestigationWorkspaceView } from '../components/InvestigationWorkspaceView';
import { useMpladsData } from '../context/MpladsDataContext';
import { RootLayoutContextType } from '../layouts/RootLayout';

export const InvestigationsPage: React.FC = () => {
  const { projects } = useMpladsData();
  const navigate = useNavigate();
  const { openFieldVerification } = useOutletContext<RootLayoutContextType>();

  useEffect(() => {
    document.title = 'Investigations & Case Files — Vigilance Dossiers | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <InvestigationWorkspaceView
        projects={projects}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
        onOpenEvidenceVault={() => navigate('/evidence-vault')}
        onOpenFieldVerification={openFieldVerification}
      />
    </div>
  );
};
