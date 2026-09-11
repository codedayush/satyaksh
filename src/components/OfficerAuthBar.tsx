import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Building, 
  KeyRound, 
  Bell, 
  Check, 
  Layers, 
  Lock, 
  Activity,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useOfficerAuth } from '../context/OfficerAuthContext';
import { OfficerRole } from '../types';

interface OfficerAuthBarProps {
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenWatchlist?: () => void;
  watchlistCount?: number;
}

export const OfficerAuthBar: React.FC<OfficerAuthBarProps> = ({
  unreadNotifsCount,
  onOpenNotifications,
  onOpenWatchlist,
  watchlistCount = 0
}) => {
  const { currentUser, allOfficers, switchRole } = useOfficerAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadgeColor = (role: OfficerRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-900/90 text-purple-200 border-purple-700';
      case 'ADMIN_OFFICER':
        return 'bg-blue-900/90 text-blue-200 border-blue-700';
      case 'INVESTIGATION_OFFICER':
        return 'bg-rose-900/90 text-rose-200 border-rose-700';
      case 'ANALYST':
        return 'bg-amber-900/90 text-amber-200 border-amber-700';
      case 'VIEWER':
      default:
        return 'bg-stone-800 text-stone-300 border-stone-600';
    }
  };

  const getRoleReadable = (role: OfficerRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin (MoSPI)';
      case 'ADMIN_OFFICER': return 'Admin Officer / DM';
      case 'INVESTIGATION_OFFICER': return 'Investigation Officer';
      case 'ANALYST': return 'Forensic Analyst';
      case 'VIEWER': return 'Read-Only Observer';
    }
  };

  return (
    <div className="bg-stone-900 text-stone-200 border-b border-stone-800 text-xs py-1.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        
        {/* Officer Profile & Switcher */}
        <div className="flex items-center space-x-2.5 relative">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-400">
            <Lock className="w-3 h-3 text-amber-400" />
            <span className="font-semibold uppercase tracking-wider text-stone-300 hidden sm:inline">Officer Console:</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 px-2.5 py-1 bg-stone-800/90 hover:bg-stone-750 text-stone-100 rounded-xs border border-stone-700 font-sans transition-colors cursor-pointer"
              title="Click to switch officer role / identity"
            >
              <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs border ${getRoleBadgeColor(currentUser.role)}`}>
                {getRoleReadable(currentUser.role)}
              </span>
              <span className="font-medium text-stone-200 max-w-[140px] sm:max-w-none truncate">
                {currentUser.name}
              </span>
              <span className="text-stone-400 text-[10px] font-mono hidden md:inline">
                [{currentUser.badgeId}]
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute left-0 top-full mt-1 w-80 bg-stone-900 border border-stone-700 rounded-xs shadow-2xl z-50 p-2 text-stone-200 divide-y divide-stone-800 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="p-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-1">
                    Select Active Role / Officer Identity
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Simulate real parliamentary vigilance roles with distinct operational permissions.
                  </p>
                </div>

                <div className="py-1 space-y-1">
                  {allOfficers.map((officer) => {
                    const isSelected = officer.id === currentUser.id;
                    return (
                      <button
                        key={officer.id}
                        onClick={() => {
                          switchRole(officer.role);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xs transition-colors flex items-start justify-between cursor-pointer ${
                          isSelected ? 'bg-stone-800 text-amber-300 font-semibold' : 'hover:bg-stone-800/70 text-stone-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1 text-[8px] font-mono font-bold uppercase rounded-xs border ${getRoleBadgeColor(officer.role)}`}>
                              {officer.role.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-stone-100 font-medium">{officer.name}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[220px]">
                            {officer.designation}
                          </div>
                          <div className="text-[9px] font-mono text-stone-500">
                            Badge: {officer.badgeId} • {officer.jurisdiction}
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls: Notifications, Watchlist */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Watchlist Quick Link */}
          {onOpenWatchlist && (
            <button
              onClick={onOpenWatchlist}
              className="inline-flex items-center gap-1.5 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer text-xs"
              title="Open Tracked Watchlist"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="px-1.5 py-0.2 bg-stone-800 border border-stone-700 text-amber-300 text-[10px] font-mono rounded-xs font-semibold">
                  {watchlistCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xs border border-stone-700 transition-colors cursor-pointer text-xs"
            title="View Critical Alerts & System Notifications"
          >
            <Bell className={`w-3.5 h-3.5 ${unreadNotifsCount > 0 ? 'text-amber-400 animate-bounce' : 'text-stone-400'}`} />
            <span>Alerts</span>
            {unreadNotifsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-mono font-bold rounded-xs">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
