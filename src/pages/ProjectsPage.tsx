import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectListView } from '../components/ProjectListView';
import { useMpladsData } from '../context/MpladsDataContext';

export const ProjectsPage: React.FC = () => {
  const { projects, states } = useMpladsData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Project Explorer — Master Public Works Ledger | SATYAKSH';
  }, []);

  return (
    <div className="space-y-6">
      <ProjectListView
        projects={projects}
        states={states}
        onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
        onSelectMP={(mpId) => navigate(`/mps/${mpId}`)}
      />
    </div>
  );
};
