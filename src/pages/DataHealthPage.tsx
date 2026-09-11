import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataHealthAndQualityView } from '../components/DataHealthAndQualityView';
import { useMpladsData } from '../context/MpladsDataContext';

export const DataHealthPage: React.FC = () => {
  const { projects } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Data Provenance, Quality & Schema Health | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <DataHealthAndQualityView
        projects={projects}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
      />
    </div>
  );
};
