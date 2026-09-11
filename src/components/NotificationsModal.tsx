import React from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { OfficerNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: OfficerNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectProject?: (projectId: string) => void;
  onNavigateToInvestigations?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectProject,
  onNavigateToInvestigations
}) => {
  if (!isOpen) return null;

  const getSeverityStyle = (severity: OfficerNotification['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: ShieldAlert,
          iconColor: 'text-rose-600'
        };
      case 'HIGH':
        return {
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-600'
        };
      case 'MEDIUM':
        return {
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Info,
          iconColor: 'text-blue-600'
        };
      case 'INFO':
      default:
        return {
          badge: 'bg-stone-100 text-stone-800 border-stone-300',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white border border-stone-300 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-amber-400 text-stone-950 rounded-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg leading-tight">
                  Officer Notifications & Alerts
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-stone-800 border border-stone-700 text-amber-300 rounded-xs font-semibold">
                  {notifications.filter(n => !n.read).length} Unread
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Real-time vigilance warnings, duplicate detections, and investigation task alerts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xs transition-colors cursor-pointer"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xs hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-6 overflow-y-auto divide-y divide-stone-200 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-medium text-stone-800">No active alerts</p>
              <p className="text-xs">All monitored projects and streams are within normal parameters.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const { badge, icon: Icon, iconColor } = getSeverityStyle(notif.severity);
              return (
                <div 
                  key={notif.id}
                  className={`pt-3 first:pt-0 p-3 rounded-xs transition-colors ${
                    notif.read ? 'bg-stone-50/70 border border-stone-200' : 'bg-amber-50/40 border border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 rounded-xs bg-white border border-stone-200 shadow-xs mt-0.5">
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase rounded-xs border ${badge}`}>
                            {notif.severity}
                          </span>
                          <span className="text-[11px] font-mono text-stone-500">
                            {notif.timestamp}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-stone-900 mt-1">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed font-sans">
                          {notif.message}
                        </p>

                        {/* Direct Action Links */}
                        <div className="mt-2.5 flex items-center gap-3">
                          {notif.relatedProjectId && onSelectProject && (
                            <button
                              onClick={() => {
                                onSelectProject(notif.relatedProjectId!);
                                onMarkRead(notif.id);
                                onClose();
                              }}
                              className="text-[11px] font-medium text-amber-700 hover:text-amber-900 underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Inspect Project</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}

                          {notif.relatedInvestigationId && onNavigateToInvestigations && (
                            <button
                              onClick={() => {
                                onNavigateToInvestigations();
                                onMarkRead(notif.id);
                                onClose();
                              }}
                              className="text-[11px] font-medium text-purple-700 hover:text-purple-900 underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Open Case {notif.relatedInvestigationId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="text-[11px] text-stone-400 hover:text-stone-700 underline shrink-0 cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Alerts triggered automatically by SATYAKSH Spatial Risk & PFMS Ingestion Monitor</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
