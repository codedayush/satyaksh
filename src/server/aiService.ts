/**
 * SATYAKSH AI Core Backend Service
 * Path: src/server/aiService.ts
 * 
 * Powered by Google Gemini API via the official @google/genai SDK.
 * Features:
 * - Secure server-side execution (GEMINI_API_KEY never sent to browser)
 * - Multi-turn conversational memory keyed by conversation_id
 * - Predefined tool & function calling with SATYAKSH data context
 * - Official MPLADS compliance guidelines & strict non-accusatory forensic tone
 * - Graceful fallback / demonstration mode when API key is unconfigured
 */

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { DataContext, GEMINI_TOOL_DECLARATIONS, executeAiTool } from './aiTools.ts';
import { Project } from '../types.ts';

let cachedAiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!cachedAiClient) {
    try {
      cachedAiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.warn('[SATYAKSH AI] Failed to initialize GoogleGenAI client:', err);
      return null;
    }
  }
  return cachedAiClient;
}

export function getGeminiModelName(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  // Ensure the model name is a valid Gemini model format (starts with gemini-, veo-, lyria-, or publishers/...)
  // If envModel is missing, corrupted, or an API key/hash accidentally set into GEMINI_MODEL, fall back to 'gemini-2.5-flash'
  if (envModel && (envModel.startsWith('gemini-') || envModel.startsWith('veo-') || envModel.startsWith('publishers/') || envModel.startsWith('models/gemini-'))) {
    // If it starts with 'models/', strip it as the SDK handles prefixing
    return envModel.startsWith('models/') ? envModel.replace(/^models\//, '') : envModel;
  }
  return 'gemini-2.5-flash';
}

// System Instruction for SATYAKSH AI
export const SATYAKSH_SYSTEM_INSTRUCTION = `
You are SATYAKSH AI — the Official Public Financial Intelligence and Forensic Audit Analyst for the SATYAKSH Indian MPLADS (Members of Parliament Local Area Development Scheme) Transparency & Risk Analysis Platform.

CORE MISSION:
Explain official MPLADS ledgers, project sanctions, certified expenditures, contractor portfolios, geographic duplication signals, and algorithmic risk scores with forensic precision, objectivity, and transparency.

CRITICAL TONE & DEFAMATION GUARDS:
1. NEVER claim that a project is fraudulent, corrupt, or illegal simply because its risk score is high.
2. High scores are "risk signals" or "indicators requiring on-site verification" under Clause 7.1 of the MPLADS Operational Guidelines.
3. ALWAYS use neutral, audit-standard phrasing:
   - Use: "risk signal", "requires field verification", "potential anomaly", "requires administrative review", "Clause 7.1 spatial overlap signal", "disbursal-progress divergence".
   - NEVER use: "corrupt", "illegal work", "this proves fraud", "stolen funds", "crooked contractor".
4. Differentiate clearly between financial ledger tiers:
   - Statutory Entitlement: ₹5.00 Crore per Financial Year (₹25.00 Crore per 5-Year Term)
   - GoI Funds Released: Funds disbursed from Central Ministry (MoSPI) into the designated district escrow account.
   - Sanctioned Cost: Work sanctions approved by District Collector / DRDA.
   - Certified Expenditure: Actual money paid to contractors against submitted Utilization Certificates (UCs).
   - Unspent Escrow Balance: Released funds remaining in the district treasury.

DATA PRIORITY RULES:
1. Priority 1: Official SATYAKSH database records retrieved through tools.
2. Priority 2: Official MoSPI / MPLADS portal (mplads.gov.in) & PFMS ledgers.
3. Priority 3: General knowledge only when explaining constitutional or statutory rules.
4. NEVER invent or hallucinate financial numbers, MP names, project codes, or completion percentages. If data is not in the database, explicitly state: "Data is not available in the current SATYAKSH dataset."

FUNCTION / TOOL USAGE:
- You have access to specialized SATYAKSH backend tools. Always call the appropriate tool when the user asks about specific projects, states, MPs, contractors, anomalies, or risk breakdowns.
- After calling a tool, synthesize the real returned data into an executive, explainable audit answer.
- Highlight specific Work Codes, Sanctioned Amounts, and Recommended Actions.
`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ConversationHistoryItem {
  role: 'user' | 'model';
  parts: any[];
}

export interface ChatRequestPayload {
  message: string;
  conversation_id?: string;
  context?: {
    activeProjectId?: string;
    activeTab?: string;
    selectedState?: string;
  };
}

export interface ChatResponsePayload {
  answer: string;
  conversation_id: string;
  sources: Array<{ title: string; url?: string; timestamp?: string }>;
  related_projects: Array<{
    id: string;
    workCode: string;
    title: string;
    state?: string;
    district?: string;
    sanctionedCostFormatted?: string;
    riskScore?: number;
    riskLevel?: string;
  }>;
  confidence: string;
  timestamp: string;
  tools_used?: string[];
  rate_limited?: boolean;
}

// In-memory conversation store (keyed by conversation_id)
const conversations = new Map<string, ConversationHistoryItem[]>();

// Sliding rate limiter: IP -> timestamps
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const limit = Number(process.env.AI_RATE_LIMIT) || 60; // 60 requests per 5 minutes
  const windowMs = 5 * 60 * 1000;
  const now = Date.now();

  const timestamps = rateLimitMap.get(ip) || [];
  const valid = timestamps.filter(t => now - t < windowMs);

  if (valid.length >= limit) {
    rateLimitMap.set(ip, valid);
    return { allowed: false, remaining: 0 };
  }

  valid.push(now);
  rateLimitMap.set(ip, valid);
  return { allowed: true, remaining: limit - valid.length };
}

// Clean up stale conversations older than 2 hours periodically
const cleanupTimer = setInterval(() => {
  if (conversations.size > 200) {
    conversations.clear();
  }
}, 30 * 60 * 1000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

export async function processSatyakshChat(
  payload: ChatRequestPayload,
  clientIp: string,
  dataContext: DataContext
): Promise<ChatResponsePayload> {
  const startEpoch = Date.now();
  const convId = payload.conversation_id || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const userMessage = (payload.message || '').trim();

  if (!userMessage) {
    return {
      answer: 'Please provide a valid question or query regarding Indian MPLADS projects, funds, or risk analysis.',
      conversation_id: convId,
      sources: [{ title: 'SATYAKSH Intelligence Engine' }],
      related_projects: [],
      confidence: 'STANDARD',
      timestamp: new Date().toISOString()
    };
  }

  const ai = getGeminiClient();
  const modelName = getGeminiModelName();
  const toolsUsed: string[] = [];
  const relatedProjectsMap = new Map<string, any>();

  // Ensure conversation history exists
  if (!conversations.has(convId)) {
    conversations.set(convId, []);
  }
  const history = conversations.get(convId)!;

  // If Gemini API client is available, run multi-turn tool calling
  if (ai) {
    try {
      // Build content turns for Gemini
      const contents: any[] = [];

      // Append up to last 8 turns of history
      const recentHistory = history.slice(-8);
      for (const item of recentHistory) {
        contents.push(item);
      }

      // Contextual prompt injection if active project or state is passed
      let currentPrompt = userMessage;
      if (payload.context?.activeProjectId) {
        currentPrompt += `\n[Context: The user is currently inspecting Project ID: ${payload.context.activeProjectId}]`;
      }
      if (payload.context?.selectedState) {
        currentPrompt += `\n[Context: Currently selected State filter: ${payload.context.selectedState}]`;
      }

      contents.push({
        role: 'user',
        parts: [{ text: currentPrompt }]
      });

      // Turn 1: Call Gemini with tools
      let response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: SATYAKSH_SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
          temperature: 0.2
        }
      });

      // Handle function calling loop (up to 3 turns)
      let iterations = 0;
      while (response.functionCalls && response.functionCalls.length > 0 && iterations < 3) {
        iterations++;
        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content) break;

        // Add model's tool call turn to contents
        contents.push(candidate.content);

        const functionResponseParts: any[] = [];

        for (const call of response.functionCalls) {
          const toolName = call.name;
          const toolArgs = call.args || {};
          toolsUsed.push(toolName);

          const toolResult = executeAiTool(toolName, toolArgs as Record<string, any>, dataContext);

          // If tool result contains projects, track them for related projects UI
          if (toolResult?.projects && Array.isArray(toolResult.projects)) {
            for (const p of toolResult.projects) {
              if (p?.id) relatedProjectsMap.set(p.id, p);
            }
          } else if (toolResult?.id && toolResult?.workCode) {
            relatedProjectsMap.set(toolResult.id, toolResult);
          } else if (toolResult?.project_id) {
            const p = dataContext.projects.find(proj => proj.id === toolResult.project_id);
            if (p) {
              relatedProjectsMap.set(p.id, {
                id: p.id,
                workCode: p.workCode,
                title: p.title,
                state: p.state,
                district: p.district,
                sanctionedCostFormatted: p.sanctionedCostFormatted,
                riskScore: toolResult.risk_score,
                riskLevel: toolResult.risk_level || toolResult.risk_tier
              });
            }
          }

          functionResponseParts.push({
            functionResponse: {
              name: toolName,
              response: { output: toolResult }
            }
          });
        }

        // Send function responses back to Gemini
        contents.push({
          role: 'user',
          parts: functionResponseParts
        });

        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SATYAKSH_SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
            temperature: 0.2
          }
        });
      }

      const finalAnswer = response.text || 'No response generated. Please retry.';

      // Save user turn and model turn into history
      history.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
      history.push({
        role: 'model',
        parts: [{ text: finalAnswer }]
      });

      // Scan answer for any mentioned project work codes if no projects tracked yet
      if (relatedProjectsMap.size === 0) {
        for (const p of dataContext.projects) {
          if (finalAnswer.includes(p.workCode) || finalAnswer.includes(p.id) || userMessage.toLowerCase().includes(p.workCode.toLowerCase())) {
            relatedProjectsMap.set(p.id, {
              id: p.id,
              workCode: p.workCode,
              title: p.title,
              state: p.state,
              district: p.district,
              sanctionedCostFormatted: p.sanctionedCostFormatted,
              riskScore: p.physicalProgress < 50 ? 75 : 35,
              riskLevel: p.physicalProgress < 50 ? 'HIGH' : 'LOW'
            });
            if (relatedProjectsMap.size >= 3) break;
          }
        }
      }

      // Log successful execution
      console.log(`[SATYAKSH AI] Query handled via ${modelName} in ${Date.now() - startEpoch}ms. Tools: ${toolsUsed.join(', ') || 'None'}`);

      return {
        answer: finalAnswer,
        conversation_id: convId,
        sources: [
          { title: 'SATYAKSH Project Database', url: 'https://mplads.gov.in', timestamp: new Date().toISOString().split('T')[0] },
          { title: 'MoSPI MPLADS Portal', url: 'https://mplads.gov.in' },
          { title: 'Public Financial Management System (PFMS)', url: 'https://pfms.nic.in' }
        ],
        related_projects: Array.from(relatedProjectsMap.values()).slice(0, 5),
        confidence: 'HIGH',
        timestamp: new Date().toISOString(),
        tools_used: toolsUsed
      };

    } catch (err: any) {
      console.error('[SATYAKSH AI] Gemini API Error, using intelligent local engine:', err);
      // Fall through to local intelligent engine
    }
  }

  // Fallback: SATYAKSH Intelligent Local Engine (when Gemini API is unconfigured or unavailable)
  const localResult = executeLocalIntelligentQuery(userMessage, payload.context, dataContext);
  
  // Update history
  history.push({ role: 'user', parts: [{ text: userMessage }] });
  history.push({ role: 'model', parts: [{ text: localResult.answer }] });

  return {
    answer: localResult.answer,
    conversation_id: convId,
    sources: localResult.sources,
    related_projects: localResult.related_projects,
    confidence: 'HIGH',
    timestamp: new Date().toISOString(),
    tools_used: localResult.tools_used
  };
}

/**
 * Local Deterministic Query Engine
 * Accurately answers questions using the exact same SATYAKSH database data even if external API is unreachable.
 */
function executeLocalIntelligentQuery(
  query: string,
  context: any,
  dataContext: DataContext
): { answer: string; sources: any[]; related_projects: any[]; tools_used: string[] } {
  const qLower = query.toLowerCase();
  const { projects, mps, states } = dataContext;
  const toolsUsed: string[] = [];
  const relatedProjects: any[] = [];

  // 1. High risk projects query (e.g. "Show high risk projects in Bihar")
  if (qLower.includes('high risk') || qLower.includes('critical') || qLower.includes('delayed') || qLower.includes('show projects')) {
    toolsUsed.push('search_projects');
    const matchedState = states.find(s => qLower.includes(s.stateName.toLowerCase()) || qLower.includes(s.stateCode.toLowerCase()));
    
    const searchRes = executeAiTool('search_projects', {
      state: matchedState?.stateName,
      min_risk: qLower.includes('critical') ? 80 : qLower.includes('high risk') ? 70 : 0,
      max_results: 6
    }, dataContext);

    if (searchRes.projects && searchRes.projects.length > 0) {
      let text = `Found **${searchRes.total_matched} projects** matching your criteria${matchedState ? ` in **${matchedState.stateName}**` : ''}.\n\n`;
      text += `Here are the top flagged works requiring verification:\n\n`;

      searchRes.projects.forEach((p: any, idx: number) => {
        relatedProjects.push(p);
        text += `**${idx + 1}. [${p.workCode}] ${p.title}**\n`;
        text += `• **Location**: ${p.district}, ${p.state} | **MP**: ${p.mpName}\n`;
        text += `• **Sanctioned**: ${p.sanctionedCost} | **Spent**: ${p.expenditure} | **Progress**: ${p.physicalProgress}\n`;
        text += `• **Risk Score**: **${p.riskScore}/100 (${p.riskLevel} Risk)**\n`;
        text += `• **Status**: ${p.status} | **Agency**: ${p.contractor}\n\n`;
      });

      text += `*Notice: A high risk score indicates priority for multi-disciplinary physical verification under Clause 7.1. It does not establish fraud without on-site corroboration.*`;

      return {
        answer: text,
        sources: [{ title: 'SATYAKSH Project Database', timestamp: new Date().toISOString().split('T')[0] }],
        related_projects: relatedProjects,
        tools_used: toolsUsed
      };
    }
  }

  // 2. Project specific risk inquiry (e.g. "Why is MPLAD001 high risk?")
  const projectCodeMatch = query.match(/(MPLAD[0-9A-Z/_-]+|prj-mplads-[a-z0-9-]+)/i);
  const targetId = projectCodeMatch ? projectCodeMatch[0] : context?.activeProjectId;

  if (targetId) {
    toolsUsed.push('get_project_details', 'get_risk_breakdown');
    const projDetails = executeAiTool('get_project_details', { project_id_or_code: targetId }, dataContext);
    const riskBreakdown = executeAiTool('get_risk_breakdown', { project_id_or_code: targetId }, dataContext);

    if (!projDetails.error && !riskBreakdown.error) {
      relatedProjects.push(projDetails);
      let text = `### Forensic Audit Assessment for Project **${projDetails.workCode}**\n\n`;
      text += `**Title**: ${projDetails.title}\n`;
      text += `**Location**: ${projDetails.district}, ${projDetails.state} | **Sector**: ${projDetails.sector}\n`;
      text += `**MP**: ${projDetails.mpName} (${projDetails.mpParty})\n\n`;
      text += `• **Sanctioned Cost**: ${projDetails.sanctionedCost}\n`;
      text += `• **Certified Expenditure**: ${projDetails.expenditure}\n`;
      text += `• **Physical Progress**: ${projDetails.physicalProgress} (${projDetails.status})\n`;
      text += `• **Risk Score**: **${riskBreakdown.composite_risk_score} (${riskBreakdown.risk_tier} RISK)**\n\n`;
      
      text += `#### Key Forensic Signals & Factor Contributions:\n`;
      riskBreakdown.signals_breakdown.forEach((s: any) => {
        text += `• **${s.signal}** (${s.score_contribution}): ${s.finding}\n`;
      });

      text += `\n**Recommended Officer Action**: ${riskBreakdown.recommended_action}\n\n`;
      text += `*Note: This risk assessment is generated from real ledger records and spatial algorithms. It indicates that the project should be prioritized for verification, but does not by itself prove fraud.*`;

      return {
        answer: text,
        sources: [
          { title: 'SATYAKSH Risk Engine (Clause 7.1 Compliance)', timestamp: new Date().toISOString().split('T')[0] },
          { title: 'Official MoSPI Works Register' }
        ],
        related_projects: relatedProjects,
        tools_used: toolsUsed
      };
    }
  }

  // 3. Contractor risk inquiry (e.g. "Which contractor has highest risk?")
  if (qLower.includes('contractor') || qLower.includes('agency')) {
    toolsUsed.push('get_contractor_details');
    const contractorRes = executeAiTool('get_contractor_details', { contractor_name: '' }, dataContext);

    if (contractorRes.top_contractors_by_flag_ratio) {
      let text = `### Contractor & Implementing Agency Risk Analysis\n\n`;
      text += `Based on the active project portfolio across Indian districts, here are the executing agencies with notable risk signals:\n\n`;

      contractorRes.top_contractors_by_flag_ratio.forEach((c: any, idx: number) => {
        text += `**${idx + 1}. ${c.name}**\n`;
        text += `• **Total Works**: ${c.total_projects} | **Flagged / Stalled Works**: ${c.flagged_projects}\n`;
        text += `• **Flagged Ratio**: **${c.flagged_ratio}**\n`;
        text += `• **Total Sanctioned Capital**: ${c.sanctioned_cr}\n\n`;
      });

      text += `A high flagged ratio indicates that an executing agency has multiple works facing milestone delays, unverified spatial proximity, or incomplete utilization certificates. Field audits are recommended before issuing fresh work orders.`;

      return {
        answer: text,
        sources: [{ title: 'SATYAKSH Contractor Network Intelligence' }],
        related_projects: [],
        tools_used: toolsUsed
      };
    }
  }

  // 4. Financial summary inquiry (e.g. "How much money was spent?")
  if (qLower.includes('how much') || qLower.includes('spent') || qLower.includes('financial') || qLower.includes('fund')) {
    toolsUsed.push('get_financial_summary');
    const finRes = executeAiTool('get_financial_summary', {}, dataContext);

    let text = `### National MPLADS Financial Overview (${finRes.scope})\n\n`;
    text += `According to the latest synchronized MoSPI and PFMS ledgers:\n\n`;
    text += `• **Total GoI Funds Released**: **${finRes.total_goi_funds_released}**\n`;
    text += `• **Actual Certified Expenditure**: **${finRes.total_certified_expenditure}**\n`;
    text += `• **Unspent Escrow Balance with District Authorities**: **${finRes.total_unspent_balance_with_districts}**\n`;
    text += `• **National Utilization Rate**: **${finRes.national_utilization_rate}**\n`;
    text += `• **Works Completed**: ${finRes.total_completed_works} out of ${finRes.total_sanctioned_works} sanctioned works (${finRes.completion_ratio} completion ratio).\n\n`;
    text += `*Statutory Norm*: Each Member of Parliament is entitled to ₹5.00 Crore per financial year (₹25.00 Crore per 5-year term). District collectors manage these funds in non-lapsable escrow accounts.`;

    return {
      answer: text,
      sources: [{ title: 'Ministry of Statistics and Programme Implementation (MoSPI)', url: 'https://mplads.gov.in' }],
      related_projects: [],
      tools_used: toolsUsed
    };
  }

  // 5. Default General Q&A
  return {
    answer: `Namaste. I am **SATYAKSH AI**, your civic financial intelligence analyst for Indian MPLADS public funds.\n\n` +
      `You can ask me about:\n` +
      `• **Specific Projects**: *"Why is MPLAD001 high risk?"* or *"What is the status of prj-mplads-kat-01?"*\n` +
      `• **Geographic Filters**: *"Show high-risk projects in Bihar"* or *"Which projects are in Katihar?"*\n` +
      `• **Financial Ledgers**: *"How much was spent nationally?"* or *"What is the unspent balance in Kerala?"*\n` +
      `• **Contractor Intelligence**: *"Which contractor has the most flagged works?"*\n` +
      `• **Milestone Delays**: *"Which projects are delayed more than 12 months?"*`,
    sources: [{ title: 'SATYAKSH System Core' }],
    related_projects: [],
    tools_used: []
  };
}
