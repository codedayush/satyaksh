import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GrievancePortalView } from '../components/GrievancePortalView';
import { useMpladsData } from '../context/MpladsDataContext';

export const GrievancesPage: React.FC = () => {
  const { projects } = useMpladsData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('projectId') || undefined;

  useEffect(() => {
    document.title = 'Citizen Grievance & Public Action Portal | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <GrievancePortalView
        projects={projects}
        prefilledProjectId={projectIdParam}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
      />
    </div>
  );
};
