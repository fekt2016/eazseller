import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import {
  getEazsellerChatOrigin,
  getEazsellerChatRestOrigin,
} from '../../shared/config/chatSocketOrigin';

/** Required on every `/api/v1/chat/*` call so the API resolves the Seller session (not buyer cookies). */
const CHAT_FETCH_HEADERS = { 'x-platform': 'eazseller' };

/**
 * Support meta — keep in sync with `saiisaiweb/src/features/chat/useChatSocket.js` (buyer).
 */
const defaultSupportMeta = () => ({
  chatPhase: 'faq_bot',
  supportRequestedAt: null,
  supportRequestNote: '',
  assignedTo: null,
  supportAcceptedAt: null,
  assignedAdminName: '',
});

const normalizeSupportMeta = (raw) => {
  if (!raw || typeof raw !== 'object') return defaultSupportMeta();

  const assignedTo = raw.assignedTo ?? null;
  const supportRequestedAt =
    raw.supportRequestedAt != null && raw.supportRequestedAt !== ''
      ? raw.supportRequestedAt
      : null;

  let chatPhase = raw.chatPhase;
  if (chatPhase === '' || chatPhase == null) {
    chatPhase =
      supportRequestedAt && !assignedTo ? 'awaiting_admin' : 'faq_bot';
  } else if (
    supportRequestedAt &&
    !assignedTo &&
    (chatPhase === 'active' ||
      chatPhase === 'faq_bot' ||
      chatPhase === 'await_human_choice')
  ) {
    chatPhase = 'awaiting_admin';
  }

  return {
    chatPhase: chatPhase || 'faq_bot',
    supportRequestedAt,
    supportRequestNote: raw.supportRequestNote || '',
    assignedTo,
    supportAcceptedAt: raw.supportAcceptedAt || null,
    assignedAdminName:
      typeof raw.assignedAdminName === 'string'
        ? raw.assignedAdminName.trim().slice(0, 100)
        : '',
  };
};

/**
 * Seller dashboard live chat — same server contract as buyer `useChatSocket`:
 * Socket `chatAs: 'seller'` + cookie `seller_jwt`; REST uses `x-platform: eazseller`.
 *
 * Extra vs buyer: `serverChatReadyRef` + pending note so `submit_support_request` is not
 * emitted before `chat:conversation_joined` (server sets `socket.conversationId` after connect).
 *
 * @param {boolean} enabled
 * @param {object|null} guestCreds — guest pre-chat; null when logged-in seller
 */
export const useSellerChatSocket = (enabled, guestCreds = null) => {
  const socketRef = useRef(null);
  const serverChatReadyRef = useRef(false);
  const pendingSupportNoteRef = useRef(null);
  const historyEpochRef = useRef(0);

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [convStatus, setConvStatus] = useState('open');
  const [supportMeta, setSupportMeta] = useState(null);
  const [adminTyping, setAdminTyping] = useState(false);
  const [closeReason, setCloseReason] = useState(null);
  const [socketError, setSocketError] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [submittingSupportRequest, setSubmittingSupportRequest] = useState(false);

  const applySupportPayload = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') return;
    setSupportMeta(normalizeSupportMeta(payload));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    serverChatReadyRef.current = false;
    pendingSupportNoteRef.current = null;

    const socketUrl = getEazsellerChatOrigin();

    const authPayload = guestCreds
      ? {
          chatAs: 'buyer',
          guestName: guestCreds.guestName,
          guestEmail: guestCreds.guestEmail || '',
          guestToken: guestCreds.guestToken,
        }
      : { chatAs: 'seller' };

    const socket = io(socketUrl, {
      withCredentials: true,
      auth: authPayload,
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setSocketError(null);
      setAuthError(false);
    });
    socket.on('disconnect', () => {
      setConnected(false);
      serverChatReadyRef.current = false;
      setSubmittingSupportRequest(false);
    });
    socket.on('connect_error', (err) => {
      setConnected(false);
      setSubmittingSupportRequest(false);
      if (!guestCreds && err?.message === 'Authentication required') {
        setAuthError(true);
      }
      if (import.meta.env.DEV) {
        const code =
          err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
         
        console.warn(
          '[SellerChat] connect_error:',
          err?.message || err,
          code ? `(engine code: ${code})` : ''
        );
      }
    });

    socket.on('chat:conversation_joined', (payload) => {
      if (payload?.conversationId != null) setConversationId(payload.conversationId);
      if (payload?.status) setConvStatus(payload.status);
      if (payload?.status === 'open') setCloseReason(null);
      applySupportPayload(payload);
      serverChatReadyRef.current = true;
      const pending = pendingSupportNoteRef.current;
      if (pending !== null) {
        pendingSupportNoteRef.current = null;
        setSocketError(null);
        socket.emit('chat:submit_support_request', { note: pending });
      }
    });

    socket.on('chat:support_request_ack', (payload) => {
      setSubmittingSupportRequest(false);
      setSocketError(null);
      applySupportPayload(payload);
    });

    socket.on('chat:support_accepted', ({ conversation }) => {
      if (conversation) applySupportPayload(conversation);
    });

    socket.on('chat:message', ({ message }) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('chat:conversation_closed', (payload) => {
      setConvStatus('closed');
      setCloseReason(payload?.reason || 'support');
    });
    socket.on('chat:conversation_reopened', () => {
      setConvStatus('open');
      setCloseReason(null);
    });

    socket.on('chat:conversation_reset', ({ conversation } = {}) => {
      setMessages([]);
      setConvStatus('open');
      setCloseReason(null);
      if (conversation?.conversationId != null) {
        setConversationId(conversation.conversationId);
      }
      if (conversation) applySupportPayload(conversation);
    });

    socket.on('chat:typing', ({ role, typing }) => {
      if (role === 'admin') setAdminTyping(typing);
    });

    socket.on('chat:error', ({ message: msg }) => {
      if (import.meta.env.DEV) {
         
        console.warn('[SellerChat]', msg);
      }
      if (msg) setSocketError(String(msg));
      setSubmittingSupportRequest(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, guestCreds, applySupportPayload]);

  const loadHistory = useCallback(async () => {
    const epochAtStart = historyEpochRef.current;
    try {
      const base = getEazsellerChatRestOrigin();
      let url;
      let options;

      if (guestCreds?.guestToken) {
        url = `${base}/api/v1/chat/guest/messages?token=${encodeURIComponent(guestCreds.guestToken)}`;
        options = {};
      } else {
        url = `${base}/api/v1/chat/messages`;
        options = { credentials: 'include', headers: CHAT_FETCH_HEADERS };
      }

      const res = await fetch(url, options);
      if (!res.ok) return;
      const json = await res.json();
      const d = json.data;
      if (historyEpochRef.current !== epochAtStart) return;
      if (d?.messages) setMessages(d.messages);
      if (d?.conversationId != null) setConversationId(d.conversationId);
      if (d?.status) {
        setConvStatus(d.status);
        if (d.status === 'open') setCloseReason(null);
      }
      if (d?.conversation) applySupportPayload(d.conversation);
    } catch {
      // ignore
    }
  }, [guestCreds?.guestToken, applySupportPayload]);

  const sendMessage = useCallback((content) => {
    if (!socketRef.current?.connected || !content?.trim()) return;
    socketRef.current.emit('chat:send', { content: content.trim() });
  }, []);

  const submitSupportRequest = useCallback((note) => {
    const s = socketRef.current;
    const n = note != null ? String(note).trim().slice(0, 500) : '';

    if (import.meta.env.DEV) {
       
      console.info('[SellerChat] submitSupportRequest', {
        socketConnected: Boolean(s?.connected),
        serverChatReady: serverChatReadyRef.current,
        noteLength: n.length,
      });
    }

    if (!s?.connected) {
      setSocketError('Not connected yet. Wait a moment and try again.');
      return;
    }
    setSubmittingSupportRequest(true);
    if (!serverChatReadyRef.current) {
      pendingSupportNoteRef.current = n;
      setSocketError(
        'Session is still starting. Your request will send automatically in a second — stay on this screen.'
      );
      return;
    }
    setSocketError(null);
    s.emit('chat:submit_support_request', { note: n });
    if (import.meta.env.DEV) {
       
      console.info('[SellerChat] emitted chat:submit_support_request');
    }
  }, []);

  const clearSocketError = useCallback(() => setSocketError(null), []);

  const emitTyping = useCallback((isTyping) => {
    socketRef.current?.emit('chat:typing', { typing: isTyping });
  }, []);

  const endConversation = useCallback(() => {
    socketRef.current?.emit('chat:participant_end_conversation');
  }, []);

  const resetConversation = useCallback(() => {
    historyEpochRef.current += 1;
    pendingSupportNoteRef.current = null;
    setSubmittingSupportRequest(false);
    setMessages([]);
    setSupportMeta(null);
    setConvStatus('open');
    setCloseReason(null);
    socketRef.current?.emit('chat:participant_reset_conversation');
  }, []);

  const meta = supportMeta || defaultSupportMeta();
  const effectivePhase = meta.chatPhase || 'active';
  const hasAssignedAgent = Boolean(meta.assignedTo);
  const needsSupportRequest =
    effectivePhase === 'faq_bot' ||
    effectivePhase === 'await_human_choice' ||
    (effectivePhase === 'awaiting_admin' && !meta.supportRequestedAt) ||
    (effectivePhase === 'active' &&
      !hasAssignedAgent &&
      !meta.supportRequestedAt);
  const waitingForAdminAcceptance =
    Boolean(meta.supportRequestedAt) && !hasAssignedAgent;

  return {
    connected,
    authError,
    messages,
    conversationId,
    convStatus,
    closeReason,
    socketError,
    clearSocketError,
    supportMeta: meta,
    effectiveChatPhase: effectivePhase,
    needsSupportRequest,
    waitingForAdminAcceptance,
    adminTyping,
    sendMessage,
    submitSupportRequest,
    submittingSupportRequest,
    emitTyping,
    loadHistory,
    endConversation,
    resetConversation,
  };
};
