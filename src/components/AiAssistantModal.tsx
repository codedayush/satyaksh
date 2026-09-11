import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  Loader2, 
  Copy, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Search,
  Activity,
  Trash2
} from 'lucide-react';
import { Project } from '../types.ts';

interface SourceCitation {
  title: string;
  url?: string;
  timestamp?: string;
}

interface RelatedProjectSummary {
  id: string;
  workCode: string;
  title: string;
  state?: string;
  district?: string;
  sanctionedCostFormatted?: string;
  riskScore?: number;
  riskLevel?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: SourceCitation[];
  relatedProjects?: RelatedProjectSummary[];
  timestamp: string;
  toolsUsed?: string[];
  isError?: boolean;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (project: Project) => void;
  onNavigate?: (tab: string) => void;
  activeProjectId?: string;
  selectedState?: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onNavigate,
  activeProjectId,
  selectedState
}) => {
  const [query, setQuery] = useState('');
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);
  const [loading, setLoading] = useState(false);
  const [statusState, setStatusState] = useState<'online' | 'analyzing' | 'degraded' | 'rate_limited' | 'error'>('online');
  const [activeModel, setActiveModel] = useState<string>('gemini-2.5-flash');
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Namaste. I am **SATYAKSH AI**, your civic intelligence analyst for Indian MPLADS public funds, Member of Parliament allocations, and local development works.\n\nI provide objective, data-grounded analysis of official MoSPI ledgers, certified expenditures, contractor portfolios, and multi-factor risk scores.\n\n*How can I assist your transparency review today?*`,
      sources: [
        { title: 'MoSPI / Official MPLADS Portal (mplads.gov.in)', url: 'https://mplads.gov.in' },
        { title: 'Public Financial Management System (PFMS)', url: 'https://pfms.nic.in' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Check health on mount or when opened
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/ai/health')
      .then(res => res.json())
      .then(data => {
        if (data.configured) {
          setStatusState('online');
          setIsApiKeyConfigured(true);
        } else {
          setStatusState('degraded');
          setIsApiKeyConfigured(false);
        }
        if (data.model) {
          setActiveModel(data.model);
        }
      })
      .catch(() => {
        setStatusState('degraded');
      });

    // Auto-focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [isOpen]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || loading) return;

    setQuery('');
    setLastUserMessage(text);
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStatusState('analyzing');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          context: {
            activeProjectId,
            selectedState
          }
        })
      });

      if (res.status === 429) {
        setStatusState('rate_limited');
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: '⚠️ **Rate limit exceeded.** You have submitted multiple rapid requests. Please wait a few moments before asking another question.',
            isError: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      const data = await res.json();

      if (data.success) {
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        setStatusState(isApiKeyConfigured ? 'online' : 'degraded');
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: data.answer || 'Response received.',
            sources: data.sources || [],
            relatedProjects: data.related_projects || [],
            toolsUsed: data.tools_used || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || 'Server error processing AI query.');
      }

    } catch (err: any) {
      console.error('SATYAKSH AI Error:', err);
      setStatusState('error');
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Unable to complete inquiry.** ${err.message || 'Please check your connection and retry.'}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleRetryLast = () => {
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage);
    }
  };

  const handleClearConversation = () => {
    setConversationId(`conv-${Date.now()}`);
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        text: 'Conversation cleared. You can ask a fresh question about Indian MPLADS funds, MPs, or project risk scores.',
        sources: [{ title: 'MoSPI / Official MPLADS Portal', url: 'https://mplads.gov.in' }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleViewProjectCard = async (projectSummary: RelatedProjectSummary) => {
    if (!onSelectProject) return;
    try {
      const res = await fetch(`/api/projects/${projectSummary.id}`);
      const data = await res.json();
      if (data.success && data.project) {
        onSelectProject(data.project);
        onClose();
      }
    } catch (err) {
      console.warn('Could not load project detail:', err);
    }
  };

  const samplePrompts = [
    'Why is MPLAD001 high risk?',
    'Show high risk projects in Bihar',
    'Which contractor has the highest risk?',
    'How much money was spent nationally?',
    'Which projects are delayed more than 12 months?',
    'What is the unspent balance with district authorities?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs">
      <div 
        id="satyaksh-ai-modal"
        className="w-full max-w-3xl bg-[#fcfbf9] border border-stone-300 rounded-sm shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[780px] animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-400 text-stone-950 rounded-xs shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-amber-300 text-base leading-none tracking-tight">
                  Ask SATYAKSH AI
                </span>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-[10px] font-mono">
                  {statusState === 'online' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-emerald-300">Gemini Active</span>
                    </>
                  )}
                  {statusState === 'analyzing' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span className="text-amber-300">Analyzing</span>
                    </>
                  )}
                  {statusState === 'degraded' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-amber-300">Local Engine</span>
                    </>
                  )}
                  {statusState === 'rate_limited' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span className="text-rose-300">Rate Limited</span>
                    </>
                  )}
                  {statusState === 'error' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span className="text-rose-300">Offline</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-stone-400 mt-0.5 font-mono flex items-center gap-2">
                <span>Official Forensic Intelligence & Ledgers</span>
                <span>•</span>
                <span className="text-stone-500">{activeModel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearConversation}
              title="Clear conversation"
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xs transition-colors cursor-pointer text-[11px] flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-100 p-1.5 hover:bg-stone-800 rounded-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-[85%] p-3.5 rounded-xs space-y-2.5 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-stone-900 text-white font-sans'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-950 font-sans'
                    : 'bg-white border border-stone-200 text-stone-900 font-sans shadow-2xs'
                }`}
              >
                {/* Tools Used Badge */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pb-1.5 border-b border-stone-100 text-[10px] font-mono text-stone-500">
                    <Activity className="w-3 h-3 text-amber-600" />
                    <span>Audited via:</span>
                    {msg.toolsUsed.map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded-xs border border-stone-200">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Main Message Text */}
                <div className="whitespace-pre-line text-[13px] leading-relaxed">
                  {msg.text}
                </div>

                {/* Related Projects Quick Cards */}
                {msg.relatedProjects && msg.relatedProjects.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-2">
                    <div className="text-[11px] font-bold text-stone-700 font-mono flex items-center justify-between">
                      <span>Referenced Public Works ({msg.relatedProjects.length}):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.relatedProjects.map((p) => {
                        const isHighRisk = (p.riskScore && p.riskScore >= 70) || p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL';
                        return (
                          <div 
                            key={p.id}
                            className="p-2 bg-stone-50 border border-stone-200 hover:border-amber-400 rounded-xs transition-colors flex flex-col justify-between space-y-1.5"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] font-bold text-amber-800 truncate">
                                  {p.workCode}
                                </span>
                                {p.riskScore !== undefined && (
                                  <span className={`px-1.5 py-0.2 rounded-2xs text-[9px] font-bold font-mono ${
                                    isHighRisk 
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}>
                                    Risk: {p.riskScore}/100
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-800 line-clamp-2 font-medium mt-0.5">
                                {p.title}
                              </p>
                              {p.sanctionedCostFormatted && (
                                <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                                  Sanctioned: {p.sanctionedCostFormatted} {p.district ? `(${p.district})` : ''}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 pt-1 border-t border-stone-200/60">
                              {onSelectProject && (
                                <button
                                  onClick={() => handleViewProjectCard(p)}
                                  className="flex-1 py-1 px-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-2xs text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Search className="w-3 h-3" />
                                  <span>View Project</span>
                                </button>
                              )}
                              {onNavigate && (
                                <button
                                  onClick={() => {
                                    onNavigate('geospatial-map');
                                    onClose();
                                  }}
                                  title="View on Map"
                                  className="py-1 px-2 bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 rounded-2xs text-[10px] flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <MapPin className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sources & Copy Action Footer */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-stone-500">
                  {msg.sources && msg.sources.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                      <span>Sources:</span>
                      {msg.sources.map((s, sIdx) => (
                        <span key={sIdx} className="inline-flex items-center gap-0.5 text-stone-700 font-medium">
                          {s.title}
                          {sIdx < msg.sources!.length - 1 ? ' • ' : ''}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div>{msg.timestamp}</div>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-xs transition-colors cursor-pointer flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedMessageId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-[9px] text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[9px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-amber-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-stone-600 text-xs p-3 bg-white border border-amber-200/80 rounded-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <div className="space-y-0.5">
                <span className="font-medium text-stone-900">SATYAKSH AI is auditing official ledgers...</span>
                <p className="text-[10px] text-stone-500 font-mono">
                  Executing verified tool queries & evaluating Clause 7.1 spatial signals
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Retry Strip if last message resulted in error */}
        {statusState === 'error' && lastUserMessage && !loading && (
          <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <span>The previous request failed to resolve.</span>
            <button
              onClick={handleRetryLast}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xs text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry Question</span>
            </button>
          </div>
        )}

        {/* Suggested Prompts Strip */}
        <div className="px-4 py-2.5 bg-stone-100/80 border-t border-stone-200 flex flex-wrap gap-1.5 text-[11px]">
          <span className="text-[10px] font-mono text-stone-500 py-0.5 mr-1 hidden sm:inline">
            Suggested Queries:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={loading}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 hover:border-amber-400 border border-stone-300 rounded-xs text-stone-700 hover:text-stone-900 text-[11px] font-sans truncate cursor-pointer transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Ask about project risks, MP fund utilization, contractor flags, or delayed works..."
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 text-xs rounded-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-medium disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-amber-400 rounded-xs cursor-pointer transition-colors flex items-center gap-1.5 font-medium text-xs shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <>
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
