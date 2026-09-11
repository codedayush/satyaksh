import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Building, 
  User, 
  Layers, 
  AlertTriangle,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { WatchlistItem, WatchlistEntityType } from '../types';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: WatchlistItem[];
  onRemoveItem: (id: string) => void;
  onAddItem: (item: Partial<WatchlistItem>) => void;
  onSelectProject?: (projectId: string) => void;
  onSelectMP?: (mpId: string) => void;
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({
  isOpen,
  onClose,
  watchlist,
  onRemoveItem,
  onAddItem,
  onSelectProject,
  onSelectMP
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState<WatchlistEntityType>('PROJECT');
  const [newName, setNewName] = useState('');
  const [newSubText, setNewSubText] = useState('');
  const [newEntityId, setNewEntityId] = useState('');
  const [newCondition, setNewCondition] = useState('Notify on risk score shift > 10 points');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddItem({
      entityType: newType,
      entityId: newEntityId.trim() || `custom-${Date.now()}`,
      name: newName.trim(),
      subText: newSubText.trim() || 'Tracked in custom officer portfolio',
      alertTriggerCondition: newCondition
    });

    setNewName('');
    setNewSubText('');
    setNewEntityId('');
    setShowAddForm(false);
  };

  const getEntityIcon = (type: WatchlistEntityType) => {
    switch (type) {
      case 'PROJECT': return Layers;
      case 'MP': return User;
      case 'CONTRACTOR': return Building;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-stone-300 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-amber-400 text-stone-950 rounded-xs">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg leading-tight">
                  Officer Priority Watchlist
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 rounded-xs font-semibold">
                  {watchlist.length} Monitored
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Pin high-risk works, contractors, and parliamentarians for targeted surveillance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Track New Entity'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xs hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Add Form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="p-4 bg-amber-50/50 border-b border-amber-200 space-y-3">
            <div className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Add New Entity to Vigilance Watchlist
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-semibold block mb-0.5">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as WatchlistEntityType)}
                  className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-xs"
                >
                  <option value="PROJECT">Project / Work</option>
                  <option value="CONTRACTOR">Contractor / Agency</option>
                  <option value="MP">Member of Parliament</option>
                  <option value="CONSTITUENCY">Constituency</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-semibold block mb-0.5">Entity Name / Work Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kursela Road Project"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-stone-600 font-semibold block mb-0.5">Target ID / Code</label>
                <input
                  type="text"
                  placeholder="e.g. prj-mplads-kat-01"
                  value={newEntityId}
                  onChange={(e) => setNewEntityId(e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-stone-600 font-semibold block mb-0.5">Surveillance Trigger Rule</label>
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3 py-1 bg-stone-900 text-amber-300 text-xs font-bold rounded-xs hover:bg-stone-800 cursor-pointer"
              >
                Save to Watchlist
              </button>
            </div>
          </form>
        )}

        {/* Watchlist Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {watchlist.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <Bookmark className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="font-medium text-stone-800">Your watchlist is currently empty</p>
              <p className="text-xs">Use the "Track New Entity" button above or the bookmark icon on any project page to pin high-priority records.</p>
            </div>
          ) : (
            watchlist.map((item) => {
              const Icon = getEntityIcon(item.entityType);
              return (
                <div 
                  key={item.id}
                  className="p-3.5 bg-stone-50 border border-stone-200 rounded-xs flex items-start justify-between gap-3 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xs bg-white border border-stone-200 shadow-xs mt-0.5">
                      <Icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs bg-stone-200 text-stone-800">
                          {item.entityType}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          Added: {item.addedAt}
                        </span>
                        {item.lastKnownRiskScore !== undefined && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-xs bg-rose-100 text-rose-800 border border-rose-200">
                            Risk Score: {item.lastKnownRiskScore}/100
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 mt-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 font-sans">
                        {item.subText}
                      </p>
                      <div className="mt-2 text-[11px] font-sans text-stone-500 flex items-center gap-1.5">
                        <BellRing className="w-3 h-3 text-amber-500" />
                        <span>Rule: {item.alertTriggerCondition}</span>
                      </div>

                      {/* Direct inspect links */}
                      <div className="mt-2">
                        {item.entityType === 'PROJECT' && onSelectProject && (
                          <button
                            onClick={() => {
                              onSelectProject(item.entityId);
                              onClose();
                            }}
                            className="text-[11px] font-medium text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Project Dossier</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                        {item.entityType === 'MP' && onSelectMP && (
                          <button
                            onClick={() => {
                              onSelectMP(item.entityId);
                              onClose();
                            }}
                            className="text-[11px] font-medium text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View MP Record</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-xs hover:bg-stone-200/60 transition-colors cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Watchlist items receive automated webhook alerts on milestone shifts</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xs font-medium cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
