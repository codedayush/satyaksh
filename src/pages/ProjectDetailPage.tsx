import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProjectDetailView } from '../components/ProjectDetailView';
import { useMpladsData } from '../context/MpladsDataContext';
import { FileSpreadsheet, ArrowLeft, Layers } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProjectById } = useMpladsData();

  const project = getProjectById(projectId);

  useEffect(() => {
    if (project) {
      document.title = `${project.workCode}: ${project.title} | SATYAKSH`;
    } else {
      document.title = 'Project Not Found | SATYAKSH';
    }
  }, [project, projectId]);

  if (!project) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xs bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-stone-900">Project Not Found</h2>
        <p className="text-xs text-stone-600 font-sans leading-relaxed">
          The public work record <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-amber-900">{projectId}</code> could not be found in the current MPLADS official ledger.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold rounded-xs transition-colors cursor-pointer no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Project Explorer</span>
          </Link>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xs transition-colors cursor-pointer no-underline"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Analytics Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/projects');
    }
  };

  const handleReportIssue = (id: string) => {
    navigate(`/grievances?projectId=${encodeURIComponent(id)}`);
  };

  return (
    <ProjectDetailView
      project={project}
      onBack={handleBack}
      onSelectMP={(mpId) => navigate(`/mps/${mpId}`)}
      onReportIssue={handleReportIssue}
    />
  );
};
