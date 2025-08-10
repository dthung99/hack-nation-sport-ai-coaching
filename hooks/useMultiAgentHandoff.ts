import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Multi-agent voice conversation orchestration hook for ElevenLabs Conversation API.
 * Supports:
 *  - Two (or more) public agents (or private via signed URLs in future) with runtime handoff
 *  - Trigger keyword based automatic handoff
 *  - Transcript accumulation & context summarization on handoff
 *  - Manual handoff function (handoffTo)
 *
 * SECURITY NOTE: For PRIVATE agents you must proxy and return a signed URL from a backend.
 * This hook currently assumes PUBLIC agents (agent IDs safe to expose). If you need private
 * agents, extend the AgentDescriptor with a signedUrlEndpoint and branch similarly to the
 * single-agent hook.
 */

export interface AgentDescriptor {
  key: string;                // internal key e.g. 'mentor'
  agentId: string;            // ElevenLabs public agent id
  displayName?: string;       // UI friendly name
  handoffTriggerKeywords?: string[]; // keywords in a USER message that should trigger a handoff TO this agent
  styleInstructions?: string; // extra prompt/style context inserted during handoff
}

export interface TranscriptEntry {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentKey?: string;
  text: string;
  timestamp: number;
  meta?: Record<string, any>;
}

export interface MultiAgentConversationState {
  status: 'idle' | 'connecting' | 'connected' | 'switching' | 'disconnected' | 'error';
  error: string | null;
  isSpeaking: boolean;
  currentAgentKey: string | null;
  agents: AgentDescriptor[];
  transcript: TranscriptEntry[];
  lastEvent: any;
  start: (agentKey?: string) => Promise<void>;
  stop: () => Promise<void>;
  sendText: (text: string) => void;
  handoffTo: (agentKey: string, reason?: string, metaType?: AgentSwitchMetaType) => Promise<void>;
  canSendFeedback: boolean;
  sendLike: () => void;
  sendDislike: () => void;
  lastSwitch?: AgentSwitchEvent | null;
}

export interface UseMultiAgentOptions {
  agents?: AgentDescriptor[];            // override agents definition; otherwise auto from env
  initialAgentKey?: string;              // default first agent key
  autoHandoffEnabled?: boolean;          // default true
  maxContextChars?: number;              // default 1800; context chunk length when handing off
  debug?: boolean;                       // verbose console logging
  agentInitiatedHandoffEnabled?: boolean; // let agent responses trigger handoff based on keywords
  agentMessageHandoffCooldownMs?: number; // minimum ms between automatic agent-initiated handoffs (default 5000)
  forwardLastUserMessageOnManualHandoff?: boolean; // replay last user message to new agent (default true)
  manualHandoffBridgeMessage?: string | ((fromKey: string | null, toKey: string) => string); // system bridging line
  explicitHandoffMarkerPattern?: RegExp; // e.g. /\[HANDOFF:(\w+)\]/i
  onAgentSwitch?: (evt: AgentSwitchEvent) => void; // callback when an agent switch occurs
}

export type AgentSwitchMetaType = 'manual' | 'auto-keyword' | 'agent-initiated' | 'explicit-marker';

export interface AgentSwitchEvent {
  from: string | null;
  to: string;
  reason?: string;
  metaType: AgentSwitchMetaType;
  timestamp: number;
}

// Helper to pull public agent IDs from env or app config extras.
function getDefaultAgents(debug = false): AgentDescriptor[] {
  const extras: any = (Constants?.expoConfig as any)?.extra || {};
  // Guard access to process in case it's undefined in some runtimes
  const envSafe: Record<string, string | undefined> = (typeof process !== 'undefined' && (process as any).env) ? (process as any).env : {};
  // User-requested primary variable names (non-public): AGENT_TED_ID / AGENT_WILLIS_ID
  // NOTE: These will not be embedded in a production build automatically.
  let mentorId = envSafe.AGENT_TED_ID;
  let motivatorId = envSafe.AGENT_WILLIS_ID;
  // Public-prefixed fallbacks for production builds.
  if (!mentorId) mentorId = envSafe.EXPO_PUBLIC_AGENT_MENTOR_ID || extras.agentMentorId || extras.elevenAgentMentorId;
  if (!motivatorId) motivatorId = envSafe.EXPO_PUBLIC_AGENT_MOTIVATOR_ID || extras.agentMotivatorId || extras.elevenAgentMotivatorId;
  if (debug && (envSafe.AGENT_TED_ID || envSafe.AGENT_WILLIS_ID) && !(envSafe.EXPO_PUBLIC_AGENT_MENTOR_ID || envSafe.EXPO_PUBLIC_AGENT_MOTIVATOR_ID)) {
    console.warn('[MultiAgent] Using non-public env vars (AGENT_TED_ID / AGENT_WILLIS_ID). For production, consider EXPO_PUBLIC_ prefixed names.');
  }
  if (debug) {
    console.log('[MultiAgent] Resolved IDs', { mentorId, motivatorId, extras });
  }
  const result: AgentDescriptor[] = [];
  if (mentorId) {
    result.push({
      key: 'mentor',
      agentId: mentorId,
      displayName: 'Calm Mentor',
      handoffTriggerKeywords: ['calm', 'breathe', 'mindful', 'anxious', 'focus'],
      styleInstructions: 'Provide calm, grounding, mindfulness-oriented coaching.'
    });
  }
  if (motivatorId) {
    result.push({
      key: 'motivator',
      agentId: motivatorId,
      displayName: 'High-Energy Motivator',
      handoffTriggerKeywords: ['pump', 'motivate', 'energy', 'hype', 'fire up'],
      styleInstructions: 'Bring energetic, enthusiastic, confidence-boosting motivation.'
    });
  }
  return result;
}

export function useMultiAgentHandoff(options: UseMultiAgentOptions = {}): MultiAgentConversationState {
  const {
    agents: providedAgents,
    initialAgentKey,
    autoHandoffEnabled = true,
    maxContextChars = 1800,
    debug = false,
  agentInitiatedHandoffEnabled = true,
  agentMessageHandoffCooldownMs = 5000,
  forwardLastUserMessageOnManualHandoff = true,
  manualHandoffBridgeMessage = (from: string | null, to: string) => `Switching from ${from || 'unknown'} to ${to} for better support.`,
  explicitHandoffMarkerPattern = /\[HANDOFF:(\w+)\]/i,
  onAgentSwitch,
  } = options;

  const agents = (providedAgents && providedAgents.length > 0) ? providedAgents : getDefaultAgents(debug);

  const [status, setStatus] = useState<MultiAgentConversationState['status']>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentAgentKey, setCurrentAgentKey] = useState<string | null>(initialAgentKey || (agents[0]?.key || null));
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [canSendFeedback, setCanSendFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSwitch, setLastSwitch] = useState<AgentSwitchEvent | null>(null);

  const convoRef = useRef<any | null>(null);
  const currentAgentRef = useRef<string | null>(currentAgentKey);
  const lastAgentHandoffAtRef = useRef<number>(0);
  const lastUserMessageRef = useRef<string>('');
  const agentBufferRef = useRef<Record<string, string>>({}); // accumulate incremental deltas per agent

  useEffect(() => { currentAgentRef.current = currentAgentKey; }, [currentAgentKey]);

  const appendTranscript = useCallback((entry: Omit<TranscriptEntry, 'id' | 'timestamp'>) => {
    setTranscript(prev => [...prev, { id: Math.random().toString(36).slice(2), timestamp: Date.now(), ...entry }]);
  }, []);

  const requestMicPermission = useCallback(async () => {
    if (Platform.OS === 'web') {
      try { await (navigator as any).mediaDevices.getUserMedia({ audio: true }); return true; } catch (e: any) { setError('Microphone permission denied: ' + (e?.message || String(e))); return false; }
    }
    return true; // assume native permission handled externally
  }, []);

  const summarizeContext = useCallback((messages: TranscriptEntry[], limitChars: number): string => {
    // naive summary: take last N messages, trimming to limit
    const ordered = messages.slice(-30); // last 30 entries
    const lines = ordered.map(m => `${m.sender === 'user' ? 'User' : (m.sender === 'agent' ? (m.agentKey || 'Agent') : 'System')}: ${m.text}`);
    let joined = lines.join('\n');
    if (joined.length > limitChars) {
      joined = 'Recent context (truncated):\n' + joined.slice(-limitChars);
    } else {
      joined = 'Recent context:\n' + joined;
    }
    return joined;
  }, []);

  const stop = useCallback(async () => {
    try { await convoRef.current?.endSession(); } catch {}
    convoRef.current = null;
    setStatus('disconnected');
    setIsSpeaking(false);
    setCanSendFeedback(false);
  }, []);

  const internalStart = useCallback(async (agent: AgentDescriptor) => {
    setError(null);
    const ok = await requestMicPermission();
    if (!ok) return;

    setStatus('connecting');
    try {
      const { Conversation } = await import('@elevenlabs/client');
      const baseOpts: any = {
        onConnect: () => setStatus('connected'),
        onDisconnect: () => setStatus('disconnected'),
        onMessage: (m: any) => {
          setLastEvent(m);
          try {
            // Collect possible text fields (final or incremental)
            const delta = m?.delta?.text; // some SDKs stream incremental deltas
            const full = m?.text || m?.content || m?.message?.text || m?.message?.content?.text;
            let captured: string | null = null;
            if (delta && typeof delta === 'string') {
              agentBufferRef.current[agent.key] = (agentBufferRef.current[agent.key] || '') + delta;
              captured = delta;
            }
            if (full && typeof full === 'string') {
              // treat full as a complete message; reset buffer
              agentBufferRef.current[agent.key] = full;
              captured = full;
            }
            // Only append transcript on finalized-looking messages (heuristic: ends with punctuation or length > 40 and contains space)
            const buf = agentBufferRef.current[agent.key];
            if (buf && /[.!?]$/.test(buf.trim())) {
              appendTranscript({ sender: 'agent', agentKey: agent.key, text: buf });
              agentBufferRef.current[agent.key] = ''; // reset after committing
              if (debug) console.log('[MultiAgent] Committed agent message', buf);
              // Marker-based explicit handoff
              const markerMatch = buf.match(explicitHandoffMarkerPattern);
              if (markerMatch && markerMatch[1]) {
                const targetKey = markerMatch[1].toLowerCase();
                if (targetKey !== agent.key && agents.some(a => a.key === targetKey)) {
                  if (debug) console.log('[MultiAgent] Explicit marker handoff ->', targetKey);
                  handoffTo(targetKey, 'Explicit marker', 'explicit-marker');
                  return;
                }
              }
              // Keyword-based agent initiated
              if (agentInitiatedHandoffEnabled && agents.length > 1) {
                const now = Date.now();
                if (now - lastAgentHandoffAtRef.current >= agentMessageHandoffCooldownMs) {
                  for (const other of agents) {
                    if (other.key === agent.key) continue;
                    const kw = other.handoffTriggerKeywords || [];
                    const lowerBuf = buf.toLowerCase();
                    if (kw.some(k => lowerBuf.includes(k.toLowerCase()))) {
                      lastAgentHandoffAtRef.current = now;
                      if (debug) console.log('[MultiAgent] Agent-initiated handoff trigger ->', other.key, 'text:', buf);
                      handoffTo(other.key, `Agent message suggested context shift (keywords for ${other.key})`, 'agent-initiated');
                      break;
                    }
                  }
                } else if (debug) {
                  // cooldown active
                }
              }
            } else if (captured && debug) {
              // streaming incremental fragment
              // console.log('[MultiAgent] Incremental fragment', captured);
            }
          } catch (err) {
            if (debug) console.warn('[MultiAgent] onMessage parse error', err);
          }
        },
        onError: (e: any) => setError(e?.message || String(e)),
        onStatusChange: (s: any) => {
          const value = typeof s === 'string' ? s : (s && typeof s.status === 'string' ? s.status : undefined);
          if (value === 'connected') setStatus('connected');
          else if (value === 'connecting') setStatus('connecting');
          else if (value === 'disconnected') setStatus('disconnected');
        },
        onModeChange: (mode: string) => setIsSpeaking(mode === 'speaking'),
        onCanSendFeedbackChange: (v: boolean) => setCanSendFeedback(v),
      };

      convoRef.current = await (Conversation as any).startSession({
        ...baseOpts,
        agentId: agent.agentId,
      });
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus('error');
    }
  }, [appendTranscript, requestMicPermission]);

  const start = useCallback(async (agentKey?: string) => {
    if (agents.length === 0) {
  const msg = 'No agents configured. Define EXPO_PUBLIC_AGENT_MENTOR_ID / EXPO_PUBLIC_AGENT_MOTIVATOR_ID in .env (no quotes/semicolons) OR pass agents[] manually. NOTE: Non-prefixed names (AGENT_TED_ID / AGENT_WILLIS_ID) are NOT embedded in production builds.';
      setError(msg);
      if (debug) console.error('[MultiAgent] start aborted -', msg);
      return;
    }
    const key = agentKey || currentAgentKey || agents[0]?.key;
    if (!key) { setError('No agent key available'); return; }
    const agent = agents.find(a => a.key === key);
    if (!agent) { setError(`Unknown agent '${key}'`); return; }
    setCurrentAgentKey(agent.key);
    appendTranscript({ sender: 'system', agentKey: agent.key, text: `Starting session with ${agent.displayName || agent.key}` });
    if (debug) console.log('[MultiAgent] Starting with agent', agent);
    await internalStart(agent);
  }, [agents, appendTranscript, currentAgentKey, internalStart]);

  const handoffTo = useCallback(async (targetKey: string, reason?: string, metaType: AgentSwitchMetaType = 'manual') => {
    if (targetKey === currentAgentRef.current) return; // already active
    const target = agents.find(a => a.key === targetKey);
    if (!target) { setError(`Cannot handoff: unknown agent '${targetKey}'`); return; }
    setStatus('switching');
    const bridge = typeof manualHandoffBridgeMessage === 'function' ? manualHandoffBridgeMessage(currentAgentRef.current, target.key) : manualHandoffBridgeMessage;
    appendTranscript({ sender: 'system', agentKey: target.key, text: `${bridge}${reason ? ' (reason: ' + reason + ')' : ''}` });
    if (debug) console.log('[MultiAgent] Handoff ->', target.key, 'reason:', reason, 'metaType:', metaType);
    try { await convoRef.current?.endSession(); } catch {}
    convoRef.current = null;
    const fromKey = currentAgentRef.current;
    setCurrentAgentKey(target.key);
    const evt: AgentSwitchEvent = { from: fromKey, to: target.key, reason, metaType, timestamp: Date.now() };
    setLastSwitch(evt);
    try { onAgentSwitch?.(evt); } catch (e) { if (debug) console.warn('[MultiAgent] onAgentSwitch callback error', e); }
    await internalStart(target);
    // After connect, send contextual update with summary
    setTimeout(() => {
      try {
        const summary = summarizeContext(transcript, maxContextChars);
        const contextPayload = `${summary}\n\nNEW AGENT (${target.displayName || target.key}) INSTRUCTIONS: ${target.styleInstructions || ''}${reason ? '\nHandoff reason: ' + reason : ''}`;
        convoRef.current?.sendContextualUpdate?.(contextPayload);
      } catch {}
    }, 800); // slight delay to ensure session connected

    if (forwardLastUserMessageOnManualHandoff && lastUserMessageRef.current) {
      setTimeout(() => {
        try {
          const forwarded = `[Previous user message] ${lastUserMessageRef.current}`;
          convoRef.current?.sendUserMessage(forwarded);
          if (debug) console.log('[MultiAgent] Forwarded last user message to new agent');
        } catch {}
      }, 1100);
    }
  }, [agents, appendTranscript, internalStart, maxContextChars, summarizeContext, transcript, manualHandoffBridgeMessage, forwardLastUserMessageOnManualHandoff, debug]);

  const sendText = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    appendTranscript({ sender: 'user', agentKey: currentAgentRef.current || undefined, text: trimmed });
    lastUserMessageRef.current = trimmed;
    if (debug) console.log('[MultiAgent] User message', trimmed);

    // Auto-handoff detection BEFORE sending to agent, so new agent can get the message.
    if (autoHandoffEnabled) {
      const lower = trimmed.toLowerCase();
      for (const agent of agents) {
        if (agent.key === currentAgentRef.current) continue;
        if (agent.handoffTriggerKeywords && agent.handoffTriggerKeywords.some(k => lower.includes(k.toLowerCase()))) {
          if (debug) console.log('[MultiAgent] Auto handoff trigger ->', agent.key);
          handoffTo(agent.key, `Keyword trigger: ${agent.handoffTriggerKeywords.join(', ')}`, 'auto-keyword')
            .then(() => {
              setTimeout(() => { try { convoRef.current?.sendUserMessage(trimmed); } catch {} }, 600);
            });
          return;
        }
      }
    }
    // Normal path
    try { convoRef.current?.sendUserMessage(trimmed); } catch {}
  }, [agents, appendTranscript, autoHandoffEnabled, handoffTo, debug]);

  const sendLike = useCallback(() => { try { if (convoRef.current && canSendFeedback) convoRef.current.sendFeedback(true); } catch {} }, [canSendFeedback]);
  const sendDislike = useCallback(() => { try { if (convoRef.current && canSendFeedback) convoRef.current.sendFeedback(false); } catch {} }, [canSendFeedback]);

  // Cleanup on unmount
  useEffect(() => { return () => { try { convoRef.current?.endSession?.(); } catch {} }; }, []);

  return {
    status,
    error,
    isSpeaking,
    currentAgentKey,
    agents,
    transcript,
    lastEvent,
    start,
    stop,
    sendText,
    handoffTo,
    canSendFeedback,
    sendLike,
    sendDislike,
  lastSwitch,
  };
}

// OPTIONAL: default export for convenience
export default useMultiAgentHandoff;
