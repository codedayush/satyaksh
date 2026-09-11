import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MPProfileView } from '../components/MPProfileView';
import { useMpladsData } from '../context/MpladsDataContext';
import { User, ArrowLeft, Users } from 'lucide-react';

export const MPProfilePage: React.FC = () => {
  const { mpId } = useParams<{ mpId: string }>();
  const navigate = useNavigate();
  const { getMPById, projects } = useMpladsData();

  const mp = getMPById(mpId);
  const mpProjects = mp ? projects.filter(p => p.mpId === mp.id) : [];

  useEffect(() => {
    if (mp) {
      document.title = `${mp.name} (${mp.constituency}, ${mp.house}) — MP Profile | SATYAKSH`;
    } else {
      document.title = 'MP Record Not Found | SATYAKSH';
    }
  }, [mp, mpId]);

  if (!mp) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-xs bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-stone-900">MP Record Not Found</h2>
        <p className="text-xs text-stone-600 font-sans leading-relaxed">
          The parliamentary profile <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-amber-900">{mpId}</code> was not found in the 18th Lok Sabha & Rajya Sabha roster.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to="/compare-mps"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold rounded-xs transition-colors cursor-pointer no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All MPs</span>
          </Link>
          <Link
            to="/states"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xs transition-colors cursor-pointer no-underline"
          >
            <Users className="w-3.5 h-3.5" />
            <span>States Ledger</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/compare-mps');
    }
  };

  return (
    <MPProfileView
      mp={mp}
      projects={mpProjects}
      onBack={handleBack}
      onSelectProject={(projectId) => navigate(`/projects/${projectId}`)}
    />
  );
};
