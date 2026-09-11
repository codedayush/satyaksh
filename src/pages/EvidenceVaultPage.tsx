import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EvidenceVaultView } from '../components/EvidenceVaultView';
import { useMpladsData } from '../context/MpladsDataContext';

export const EvidenceVaultPage: React.FC = () => {
  const { projects } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Evidence Vault — Geotagged Audits, Affidavits & Photos | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <EvidenceVaultView
        projects={projects}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
      />
    </div>
  );
};
