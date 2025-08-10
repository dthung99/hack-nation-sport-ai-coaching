import { Conversation } from '@elevenlabs/client';
import { Audio } from 'expo-av';

import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal hook that exposes start/stop and a few reactive state flags
// Mirrors logic from integrate_me.txt but adapted for React Native + web (Expo)
// NOTE: For private agents you must implement an API route that returns a signed URL string.
// Provide either agentId (public agent) OR signedUrlEndpoint for private agents.

export interface UseElevenConversationOptions {
  usePublicAgent?: boolean;
  publicAgentId?: string; // required if usePublicAgent
  signedUrlEndpoint?: string; // required if !usePublicAgent
}

export interface ElevenConversationState {
  status: 'disconnected' | 'connecting' | 'connected';
  error: string;
  isSpeaking: boolean;
  canSendFeedback: boolean;
  lastEvent: any;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  sendText: (text: string) => void;
  sendLike: () => void;
  sendDislike: () => void;
  sendContext: (context: string) => void;
}

export function useElevenConversation(options: UseElevenConversationOptions): ElevenConversationState {
  const { usePublicAgent = false, publicAgentId, signedUrlEndpoint = '/api/signed-url' } = options;

  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState('');
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [canSendFeedback, setCanSendFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const convoRef = useRef<any | null>(null);

  // Request microphone permissions (web + native). On native, we rely on expo-av previously; here we just attempt getUserMedia on web.

  // Use the working permission code from your example:
  const requestMicPermission = useCallback(async () => {
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        console.log("Audio permission granted");
        return true;
      } else {
        setError("Please grant microphone permission to use voice chat");
        return false;
      }
    } catch (error: any) {
      console.error("Error requesting permissions:", error);
      setError("Error requesting microphone permission: " + (error?.message || String(error)));
      return false;
    }
  }, []);

  const start = useCallback(async () => {
    setError('');
    const ok = await requestMicPermission();
    if (!ok) return;

    try {
      setStatus('connecting');
      const baseOpts: any = {
        onConnect: () => setStatus('connected'),
        onDisconnect: () => setStatus('disconnected'),
        onMessage: (m: any) => setLastEvent(m),
        onError: (e: any) => setError(e?.message || String(e)),
        onStatusChange: (s: any) => {
          // Some SDK versions may send a plain string OR an object { status: string }
          const value = typeof s === 'string' ? s : (s && typeof s.status === 'string' ? s.status : undefined);
            if (value === 'connected' || value === 'connecting' || value === 'disconnected') {
              setStatus(value);
            } else if (value) {
              setStatus(value as any);
            } else {
              console.warn('[useElevenConversation] Unrecognized status payload', s);
            }
        },
        onModeChange: (mode: string) => setIsSpeaking(mode === 'speaking'),
        onCanSendFeedbackChange: (v: boolean) => setCanSendFeedback(v),
      };

  // Dynamic import to avoid bundler evaluating the SDK until actually needed (helps with web build issues)
  if (usePublicAgent) {
        if (!publicAgentId) throw new Error('publicAgentId required when usePublicAgent=true');
        convoRef.current = await (Conversation as any).startSession({
          ...baseOpts,
          agentId: publicAgentId,
        });
      } else {
        if (!signedUrlEndpoint) throw new Error('signedUrlEndpoint required for private agent');
        const res = await fetch(signedUrlEndpoint);
        if (!res.ok) throw new Error('Failed to fetch signed URL');
        const signedUrl = await res.text();
        convoRef.current = await (Conversation as any).startSession({
          ...baseOpts,
          signedUrl,
        });
      }
    } catch (e: any) {
      setError(e?.message || String(e));
      setStatus('disconnected');
    }
  }, [publicAgentId, requestMicPermission, signedUrlEndpoint, usePublicAgent]);

  const stop = useCallback(async () => {
    try {
      await convoRef.current?.endSession();
    } catch {}
    convoRef.current = null;
    setStatus('disconnected');
    setIsSpeaking(false);
    setCanSendFeedback(false);
  }, []);

  const sendText = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !convoRef.current) return;
    convoRef.current.sendUserMessage(trimmed);
  }, []);

  const sendLike = useCallback(() => {
    try { if (convoRef.current && canSendFeedback) convoRef.current.sendFeedback(true); } catch {}
  }, [canSendFeedback]);

  const sendDislike = useCallback(() => {
    try { if (convoRef.current && canSendFeedback) convoRef.current.sendFeedback(false); } catch {}
  }, [canSendFeedback]);

  const sendContext = useCallback((context: string) => {
    try { convoRef.current?.sendContextualUpdate(context); } catch {}
  }, []);

  useEffect(() => {
    return () => { try { convoRef.current?.endSession?.(); } catch {} };
  }, []);

  return { status, error, isSpeaking, canSendFeedback, lastEvent, start, stop, sendText, sendLike, sendDislike, sendContext };
}
