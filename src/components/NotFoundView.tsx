import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileQuestion, 
  Home, 
  ArrowLeft, 
  FileSpreadsheet, 
  ShieldAlert, 
  Scale, 
  Compass 
} from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-white border border-stone-200 rounded-xs shadow-xs p-8 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-xs bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300 rounded-xs">
            404 • Ledger Entry Not Found
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
            The requested parliamentary record, route, or ledger view does not exist or has been relocated in the SATYAKSH register.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-amber-300 text-xs font-semibold rounded-xs shadow-xs transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span>Return to National Overview</span>
          </button>
          <button
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-medium rounded-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-600" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="border-t border-stone-200 pt-5 text-left">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-2 text-center">
            Popular Public Ledger Routes:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xs flex items-center gap-2 text-stone-800 text-left transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate font-medium">Project Explorer</span>
            </button>
            <button
              onClick={() => navigate('/risk-intelligence')}
              className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xs flex items-center gap-2 text-stone-800 text-left transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate font-medium">Risk Intelligence</span>
            </button>
            <button
              onClick={() => navigate('/compare-mps')}
              className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xs flex items-center gap-2 text-stone-800 text-left transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span className="truncate font-medium">Compare MPs</span>
            </button>
            <button
              onClick={() => navigate('/geospatial-tracker')}
              className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xs flex items-center gap-2 text-stone-800 text-left transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate font-medium">Geospatial Tracker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
