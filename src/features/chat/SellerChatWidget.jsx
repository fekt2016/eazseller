import { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaHeadset,
  FaArrowRight,
  FaUserCircle,
  FaRedo,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useSellerChatSocket } from './useSellerChatSocket';
import useAuth from '../../shared/hooks/useAuth';
import { getEazsellerChatRestOrigin } from '../../shared/config/chatSocketOrigin';

// ── Animations ────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40%            { transform: translateY(-5px); }
`;
const pulseOpacity = keyframes`
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
`;

// ── Palette — matches seller sidebar amber ─────────────────
const AMBER = '#E8920A';
const AMBER_LIGHT = '#f0a845';
const DARK = '#1a1f2e';

// ── Styled Components ─────────────────────────────────────
const Bubble = styled.button`
  position: fixed;
  bottom: 2.8rem;
  right: 2.8rem;
  width: 5.6rem;
  height: 5.6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, ${AMBER} 0%, ${AMBER_LIGHT} 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(232, 146, 10, 0.45);
  z-index: 9000;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: ${pulse} 3s ease-in-out infinite;

  svg { color: #fff; font-size: 2.2rem; }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(232, 146, 10, 0.6);
    animation: none;
  }

  @media (max-width: 600px) {
    bottom: 1.6rem;
    right: 1.6rem;
    width: 5rem;
    height: 5rem;
    svg { font-size: 2rem; }
  }
`;

const UnreadBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 2rem;
  height: 2rem;
  border-radius: 1rem;
  background: #e53e3e;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.4rem;
  border: 2px solid #fff;
  line-height: 1;
`;

const Window = styled.div`
  position: fixed;
  bottom: 9.6rem;
  right: 2.8rem;
  width: 36rem;
  max-height: 54rem;
  background: #fff;
  border-radius: 1.6rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  z-index: 9001;
  overflow: hidden;
  animation: ${fadeSlideUp} 0.22s ease-out;

  @media (max-width: 600px) {
    right: 0;
    bottom: 0;
    width: 100vw;
    max-height: 80vh;
    border-radius: 1.6rem 1.6rem 0 0;
  }
`;

const WinHeader = styled.div`
  background: linear-gradient(135deg, ${DARK} 0%, #2d3444 100%);
  padding: 1.6rem 1.8rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 50%;
  background: linear-gradient(135deg, ${AMBER}, ${AMBER_LIGHT});
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { color: #fff; font-size: 1.8rem; }
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopOnlineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${({ $live }) => ($live ? '#c6f6d5' : 'rgba(255,255,255,0.55)')};
`;

const TopStatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $live }) => ($live ? '#48bb78' : '#a0aec0')};
  flex-shrink: 0;
  box-shadow: ${({ $live }) =>
    $live ? '0 0 0 2px rgba(72, 187, 120, 0.35)' : 'none'};
`;

const AgentName = styled.p`
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
`;

const ContextSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.62);
  margin: 0.15rem 0 0;
  line-height: 1.35;
`;

const CloseBtn = styled.button`
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  svg { color: rgba(255,255,255,0.8); font-size: 1.4rem; }
  &:hover { background: rgba(255,255,255,0.2); }
`;

const PreChatWrap = styled.div`
  padding: 2.4rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const PreChatIntro = styled.p`
  font-size: 1.3rem;
  color: #718096;
  line-height: 1.6;
  margin: 0;
`;

const FieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #4a5568;
`;

const FieldInput = styled.input`
  padding: 1rem 1.4rem;
  border: 1.5px solid ${({ $error }) => ($error ? '#e53e3e' : '#e2e8f0')};
  border-radius: 0.8rem;
  font-size: 1.4rem;
  color: #2d3748;
  outline: none;
  transition: border-color 0.15s;
  background: #f7f8fa;

  &:focus {
    border-color: ${AMBER};
  }
  &::placeholder {
    color: #a0aec0;
    font-weight: 400;
  }
`;

const FieldError = styled.span`
  font-size: 1.2rem;
  color: #e53e3e;
  font-weight: 500;
`;

const StartBtn = styled.button`
  padding: 1.1rem;
  background: linear-gradient(135deg, ${AMBER}, ${AMBER_LIGHT});
  color: #fff;
  border: none;
  border-radius: 0.8rem;
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: opacity 0.15s, transform 0.15s;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const GuestBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  background: #f7fafc;
  border-bottom: 1px solid #edf2f7;
  font-size: 1.2rem;
  color: #718096;
  flex-shrink: 0;

  svg {
    color: #cbd5e0;
  }
  span {
    font-weight: 600;
    color: #4a5568;
  }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.6rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f7f8fa;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
`;

const WelcomeMsg = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #718096;

  p {
    font-size: 1.4rem;
    line-height: 1.6;
    margin: 0;
  }
`;

const WaitingBanner = styled(WelcomeMsg)`
  background: #fffdf2;
  border: 1px dashed #f6e05e;
  border-radius: 1.2rem;
  margin-bottom: 1rem;
  animation: ${pulseOpacity} 2s infinite ease-in-out;
  color: #856404;
  
  p {
    font-weight: 500;
  }
`;

const MsgBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-self: ${({ $fromMe }) => ($fromMe ? 'flex-end' : 'flex-start')};
  max-width: 78%;
`;

const AdminMsgLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #2c5282;
  margin-bottom: 0.35rem;
  padding: 0 0.15rem;

  svg {
    flex-shrink: 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const MsgBubble = styled.div`
  max-width: 100%;
  padding: 1rem 1.4rem;
  border-radius: ${({ $fromMe }) =>
    $fromMe ? '1.4rem 1.4rem 0.4rem 1.4rem' : '1.4rem 1.4rem 1.4rem 0.4rem'};
  background: ${({ $fromMe }) =>
    $fromMe ? `linear-gradient(135deg, ${AMBER}, ${AMBER_LIGHT})` : '#ebf8ff'};
  color: ${({ $fromMe }) => ($fromMe ? '#fff' : '#2d3748')};
  font-size: 1.4rem;
  line-height: 1.55;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  border: ${({ $fromMe }) => ($fromMe ? 'none' : '1px solid #bee3f8')};
  word-break: break-word;
`;

const MsgTime = styled.span`
  font-size: 1rem;
  color: ${({ $fromMe }) => ($fromMe ? 'rgba(255,255,255,0.7)' : '#a0aec0')};
  display: block;
  margin-top: 0.4rem;
  text-align: ${({ $fromMe }) => ($fromMe ? 'right' : 'left')};
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 1rem 1.4rem;
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  border-radius: 1.4rem 1.4rem 1.4rem 0.4rem;
  align-self: flex-start;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);

  span {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #a0aec0;
    animation: ${dotBounce} 1.2s ease-in-out infinite;
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.30s; }
  }
`;

const ClosedBanner = styled.div`
  background: #fff5f5;
  border-top: 1px solid #feb2b2;
  padding: 1rem 1.6rem;
  text-align: center;
  font-size: 1.3rem;
  color: #e53e3e;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;

  p {
    margin: 0;
    line-height: 1.5;
  }
`;

const SocketErrorBar = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.4rem;
  background: #fffbeb;
  border-bottom: 1px solid #f6e05e;
  font-size: 1.3rem;
  line-height: 1.45;
  color: #744210;
  flex-shrink: 0;
`;

const SocketErrorDismiss = styled.button`
  flex-shrink: 0;
  margin: 0;
  padding: 0.2rem 0.6rem;
  border: none;
  background: transparent;
  color: #744210;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #1a202c;
  }
`;

const SessionActionsWrap = styled.div`
  padding: 0.85rem 1.2rem 1rem;
  background: #f7f8fa;
  border-top: 1px solid #edf2f7;
  flex-shrink: 0;
`;

const EndSessionTriggerBtn = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.75rem 1.2rem;
  border-radius: 2.4rem;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  svg {
    font-size: 1.4rem;
    color: #718096;
  }

  &:hover:not(:disabled) {
    border-color: #cbd5e0;
    background: #fafafa;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  &:focus-visible {
    outline: 2px solid ${AMBER};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const StartOverPanel = styled.div`
  padding: 1rem 1rem 0.85rem;
  border-radius: 1.4rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const StartOverHint = styled.p`
  margin: 0 0 0.85rem;
  font-size: 1.2rem;
  line-height: 1.45;
  color: #718096;
  text-align: center;
`;

const StartOverActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const StartOverPrimaryBtn = styled.button`
  flex: 1;
  min-width: 10rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.7rem 1rem;
  border-radius: 2rem;
  border: none;
  background: linear-gradient(135deg, ${AMBER}, ${AMBER_LIGHT});
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;

  svg {
    font-size: 1.3rem;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${AMBER};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const SessionCancelBtn = styled.button`
  flex: 1;
  min-width: 8rem;
  padding: 0.7rem 1rem;
  border-radius: 2rem;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    border-color: #cbd5e0;
    background: #f7fafc;
  }

  &:focus-visible {
    outline: 2px solid ${AMBER};
    outline-offset: 2px;
  }
`;

const ClosedSessionActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InputRow = styled.form`
  display: flex;
  gap: 0.8rem;
  padding: 1.2rem 1.4rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem 1.4rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 2.4rem;
  font-size: 1.4rem;
  outline: none;
  color: #2d3748;
  background: #f7f8fa;
  transition: border-color 0.15s;

  &:focus { border-color: ${AMBER}; }
  &::placeholder { color: #a0aec0; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SendBtn = styled.button`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, ${AMBER}, ${AMBER_LIGHT});
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s, opacity 0.15s;
  svg { color: #fff; font-size: 1.5rem; }

  &:hover:not(:disabled) { transform: scale(1.08); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const AssignedAgentFootnote = styled.p`
  margin: 0;
  padding: 0.5rem 1.4rem 0.9rem;
  font-size: 1.2rem;
  line-height: 1.45;
  color: #718096;
  text-align: center;
  background: #fff;
  border-top: 1px solid #edf2f7;
  flex-shrink: 0;

  strong {
    font-weight: 600;
    color: #2d3748;
  }
`;

const RequestNoteArea = styled.textarea`
  width: 100%;
  padding: 1rem 1.4rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 1.2rem;
  font-size: 1.4rem;
  font-family: inherit;
  outline: none;
  color: #2d3748;
  background: #f7f8fa;
  min-height: 8rem;
  resize: vertical;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${AMBER};
  }
  &::placeholder {
    color: #a0aec0;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RequestChatBtn = styled.button`
  width: 100%;
  padding: 1.2rem;
  border-radius: 1.2rem;
  height: 4.4rem;
  background: linear-gradient(135deg, ${AMBER}, ${AMBER_LIGHT});
  color: #fff;
  border: none;
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ── Helpers ───────────────────────────────────────────────
const fmtTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const closedBannerCopy = (reason) => {
  if (reason === 'participant') return 'You ended this chat.';
  if (reason === 'inactivity') {
    return 'This chat was closed after a period of inactivity.';
  }
  return 'This conversation has been closed.';
};

const genUUID = () => {
  // Prefer cryptographically-secure randomness for identifiers.
  // This is not an auth token, but it can be used for guest chat correlation.
  const cryptoObj = globalThis?.crypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    // RFC 4122 v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
      .slice(6, 8)
      .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  }

  // Fallback (older browsers / test env)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const getOrCreateGuestToken = () => {
  const key = 'eazseller_guest_chat_token';
  let token = sessionStorage.getItem(key);
  if (!token) {
    token = genUUID();
    sessionStorage.setItem(key, token);
  }
  return token;
};

// ── Component ─────────────────────────────────────────────
const SellerChatWidget = () => {
  const { seller, isAuthenticated } = useAuth();
  const sellerId = seller?._id || seller?.id;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [unread, setUnread] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestErrors, setGuestErrors] = useState({});
  const [guestCreds, setGuestCreds] = useState(null);
  const [sessionEndExpanded, setSessionEndExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    window.chatWidget = {
      open: () => setOpen(true),
      close: () => setOpen(false),
    };
    return () => {
      delete window.chatWidget;
    };
  }, []);

  /** Prefer stable seller id so the socket runs even if `isAuthenticated` lags after refresh. */
  const socketEnabled = Boolean(sellerId) || !!guestCreds;

  // Align REST session + DB row with Socket.io before chat (same participantId as seller_jwt).
  useEffect(() => {
    if (!open || !sellerId || guestCreds) return;
    const base = getEazsellerChatRestOrigin();
    fetch(`${base}/api/v1/chat/conversation`, {
      credentials: 'include',
      headers: { 'x-platform': 'eazseller' },
    }).catch(() => {});
  }, [open, sellerId, guestCreds]);

  const {
    connected,
    authError,
    socketError,
    clearSocketError,
    messages,
    convStatus,
    closeReason,
    adminTyping,
    needsSupportRequest,
    waitingForAdminAcceptance,
    supportMeta,
    effectiveChatPhase,
    sendMessage,
    submitSupportRequest,
    submittingSupportRequest,
    emitTyping,
    loadHistory,
    resetConversation,
  } = useSellerChatSocket(socketEnabled, guestCreds);

  const isClosed = convStatus === 'closed';

  useEffect(() => {
    setHistoryLoaded(false);
  }, [guestCreds?.guestToken, sellerId]);

  useEffect(() => {
    if (!open) setSessionEndExpanded(false);
  }, [open]);

  useEffect(() => {
    if (isClosed) setSessionEndExpanded(false);
  }, [isClosed]);

  useEffect(() => {
    if (open && socketEnabled && !historyLoaded) {
      loadHistory().then(() => setHistoryLoaded(true));
    }
  }, [open, socketEnabled, historyLoaded, loadHistory]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, adminTyping]);

  useEffect(() => {
    if (!open) {
      setUnread(messages.filter((m) => m.senderRole === 'admin' && !m.readAt).length);
    } else {
      setUnread(0);
    }
  }, [messages, open]);

  const handleGuestStart = useCallback(() => {
    const errs = {};
    if (!guestName.trim()) errs.name = 'Name is required';
    if (!guestEmail.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errs.email = 'Enter a valid email';
    }
    if (Object.keys(errs).length) {
      setGuestErrors(errs);
      return;
    }
    setGuestErrors({});
    setGuestCreds({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestToken: getOrCreateGuestToken(),
    });
  }, [guestName, guestEmail]);

  const handleSend = useCallback(
    (e) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;
      sendMessage(text);
      setInput('');
      emitTyping(false);
      clearTimeout(typingTimerRef.current);
    },
    [input, sendMessage, emitTyping]
  );

  const handleSupportRequest = useCallback(() => {
    if (import.meta.env.DEV) {
       
      console.info('[SellerChatWidget] Request chat clicked', {
        connected,
        needsSupportRequest,
        waitingForAdminAcceptance,
        noteLength: requestNote?.trim?.()?.length ?? 0,
        submittingSupportRequest,
      });
    }
    submitSupportRequest(requestNote);
    setRequestNote('');
    emitTyping(false);
    clearTimeout(typingTimerRef.current);
  }, [
    requestNote,
    submitSupportRequest,
    emitTyping,
    connected,
    needsSupportRequest,
    waitingForAdminAcceptance,
    submittingSupportRequest,
  ]);

  const handleResetChat = useCallback(() => {
    if (!connected) return;
    const ok = window.confirm(
      'Start over? Your message history will be cleared and you can request support again.'
    );
    if (!ok) return;
    resetConversation();
    setHistoryLoaded(false);
    setSessionEndExpanded(false);
  }, [connected, resetConversation]);

  const handleInputChange = useCallback(
    (e) => {
      setInput(e.target.value);
      emitTyping(true);
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => emitTyping(false), 1500);
    },
    [emitTyping]
  );

  const canSend =
    connected &&
    !isClosed &&
    !needsSupportRequest &&
    !waitingForAdminAcceptance;
  const guestDisplayName = guestCreds?.guestName;
  const showPreChatForm = !isAuthenticated && !guestCreds;

  const headerConnectionLive = connected && !(authError && !guestCreds);
  const topStatusLabel = !connected
    ? 'Connecting…'
    : authError && !guestCreds
      ? 'Offline'
      : 'Online';

  return (
    <>
      {open && (
        <Window>
          <WinHeader>
            <Avatar>
              <FaHeadset />
            </Avatar>
            <HeaderInfo>
              <TopOnlineRow
                $live={headerConnectionLive}
                role="status"
                aria-live="polite"
                aria-label={
                  headerConnectionLive
                    ? 'Status: online'
                    : !connected
                      ? 'Status: connecting'
                      : 'Status: offline'
                }
              >
                <TopStatusDot $live={headerConnectionLive} aria-hidden />
                {topStatusLabel}
              </TopOnlineRow>
              <AgentName>Saiisai Support</AgentName>
              <ContextSubtitle>
                {!connected
                  ? 'Establishing a secure connection…'
                  : authError && !guestCreds
                    ? 'Could not connect — try logging in again'
                    : waitingForAdminAcceptance
                      ? 'Request sent — waiting for an agent'
                      : needsSupportRequest
                        ? 'Request a chat to connect'
                        : 'We reply fast'}
              </ContextSubtitle>
            </HeaderInfo>
            <CloseBtn onClick={() => setOpen(false)} aria-label="Close chat">
              <FaTimes />
            </CloseBtn>
          </WinHeader>

          {!showPreChatForm && socketError && (
            <SocketErrorBar role="alert">
              <span>{socketError}</span>
              <SocketErrorDismiss type="button" onClick={clearSocketError}>
                Dismiss
              </SocketErrorDismiss>
            </SocketErrorBar>
          )}

          {showPreChatForm ? (
            <PreChatWrap>
              <PreChatIntro>
                Welcome! Share your details so our support team can reach you — same help flow as
                the buyer site.
              </PreChatIntro>
              <FieldLabel>
                Your name *
                <FieldInput
                  type="text"
                  placeholder="e.g. Ama Owusu"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (guestErrors.name) setGuestErrors((p) => ({ ...p, name: '' }));
                  }}
                  $error={!!guestErrors.name}
                  autoComplete="name"
                  maxLength={80}
                />
                {guestErrors.name && <FieldError>{guestErrors.name}</FieldError>}
              </FieldLabel>
              <FieldLabel>
                Email address *
                <FieldInput
                  type="email"
                  placeholder="e.g. ama@example.com"
                  value={guestEmail}
                  onChange={(e) => {
                    setGuestEmail(e.target.value);
                    if (guestErrors.email) setGuestErrors((p) => ({ ...p, email: '' }));
                  }}
                  $error={!!guestErrors.email}
                  autoComplete="email"
                  maxLength={200}
                />
                {guestErrors.email && <FieldError>{guestErrors.email}</FieldError>}
              </FieldLabel>
              <StartBtn type="button" onClick={handleGuestStart}>
                Start chat <FaArrowRight />
              </StartBtn>
            </PreChatWrap>
          ) : (
            <>
              {!isAuthenticated && guestDisplayName && (
                <GuestBadge>
                  <FaUserCircle />
                  Chatting as <span>{guestDisplayName}</span>
                </GuestBadge>
              )}

              <Messages>
                {waitingForAdminAcceptance && (
                  <WaitingBanner>
                    <p>
                      Request sent! Waiting for a support agent to join the chat...
                      <br />
                      <span style={{ fontSize: '1.1rem', opacity: 0.8, fontWeight: 400 }}>
                        We usually respond within a few minutes.
                      </span>
                    </p>
                  </WaitingBanner>
                )}

                {needsSupportRequest && (
                  <WelcomeMsg>
                    <p>
                      Hi
                      {isAuthenticated && seller?.name
                        ? ` ${seller.name.split(' ')[0]}`
                        : guestDisplayName
                          ? ` ${guestDisplayName.split(' ')[0]}`
                          : ''}
                      ! 👋
                      <br />
                      Request a chat with our team. An available agent will accept before messaging
                      starts.
                    </p>
                  </WelcomeMsg>
                )}

                {!needsSupportRequest &&
                  !waitingForAdminAcceptance &&
                  messages.length === 0 && (
                    <WelcomeMsg>
                      <p>
                        Hi
                        {isAuthenticated && seller?.name
                          ? ` ${seller.name.split(' ')[0]}`
                          : guestDisplayName
                            ? ` ${guestDisplayName.split(' ')[0]}`
                            : ''}
                        ! 👋
                        <br />
                        How can we help your store today?
                      </p>
                    </WelcomeMsg>
                  )}

                {messages.map((msg) => {
                  const fromMe =
                    msg.senderRole === 'seller' || msg.senderRole === 'guest';
                  const isAdmin = msg.senderRole === 'admin';
                  const adminName =
                    typeof msg.senderName === 'string'
                      ? msg.senderName.trim()
                      : '';
                  const adminLabel = adminName
                    ? `${adminName} · Saiisai Support`
                    : 'Saiisai Support';
                  return (
                    <MsgBlock key={msg._id} $fromMe={fromMe}>
                      {isAdmin && (
                        <AdminMsgLabel>
                          <FaHeadset aria-hidden />
                          <span>{adminLabel}</span>
                        </AdminMsgLabel>
                      )}
                      <MsgBubble $fromMe={fromMe}>
                        {msg.content}
                        <MsgTime $fromMe={fromMe}>{fmtTime(msg.createdAt)}</MsgTime>
                      </MsgBubble>
                    </MsgBlock>
                  );
                })}

                {adminTyping && (
                  <TypingDots>
                    <span />
                    <span />
                    <span />
                  </TypingDots>
                )}

                <div ref={messagesEndRef} />
              </Messages>

              {isClosed && (
                <ClosedBanner role="status">
                  <p>{closedBannerCopy(closeReason)}</p>
                </ClosedBanner>
              )}

              {!showPreChatForm && (
                <SessionActionsWrap>
                  {!isClosed && !sessionEndExpanded && (
                    <EndSessionTriggerBtn
                      type="button"
                      disabled={!connected}
                      onClick={() => setSessionEndExpanded(true)}
                      aria-expanded="false"
                      aria-controls="seller-chat-start-over-panel"
                    >
                      <FaSignOutAlt aria-hidden />
                      End chat
                    </EndSessionTriggerBtn>
                  )}
                  {!isClosed && sessionEndExpanded && (
                    <StartOverPanel
                      id="seller-chat-start-over-panel"
                      role="region"
                      aria-label="Start over options"
                    >
                      <StartOverHint>
                        Clear your history and return to the support request step.
                      </StartOverHint>
                      <StartOverActionsRow>
                        <StartOverPrimaryBtn
                          type="button"
                          disabled={!connected}
                          onClick={handleResetChat}
                          aria-label="Start over and clear history"
                        >
                          <FaRedo aria-hidden />
                          Start over
                        </StartOverPrimaryBtn>
                        <SessionCancelBtn
                          type="button"
                          onClick={() => setSessionEndExpanded(false)}
                        >
                          Cancel
                        </SessionCancelBtn>
                      </StartOverActionsRow>
                    </StartOverPanel>
                  )}
                  {isClosed && (
                    <ClosedSessionActions>
                      <StartOverHint>
                        This conversation is closed. Start over when you are ready.
                      </StartOverHint>
                      <StartOverPrimaryBtn
                        type="button"
                        disabled={!connected}
                        onClick={handleResetChat}
                        aria-label="Start a new chat session"
                      >
                        <FaRedo aria-hidden />
                        Start over
                      </StartOverPrimaryBtn>
                    </ClosedSessionActions>
                  )}
                </SessionActionsWrap>
              )}

              {needsSupportRequest && !isClosed && (
                <InputRow as="div" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <RequestNoteArea
                    rows={3}
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Optional: what do you need help with? (max 500 characters)"
                    disabled={!connected}
                    maxLength={500}
                  />
                  <RequestChatBtn
                    type="button"
                    onClick={handleSupportRequest}
                    disabled={!connected || submittingSupportRequest}
                    aria-busy={submittingSupportRequest}
                  >
                    {submittingSupportRequest ? (
                      'Sending request…'
                    ) : (
                      <>
                        Request chat with support <FaArrowRight />
                      </>
                    )}
                  </RequestChatBtn>
                </InputRow>
              )}

              {!needsSupportRequest && (
                <>
                  <InputRow onSubmit={handleSend}>
                    <Input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder={
                        isClosed
                          ? 'Conversation closed'
                          : waitingForAdminAcceptance
                            ? 'Waiting for an agent…'
                            : 'Type a message…'
                      }
                      disabled={!canSend}
                      maxLength={2000}
                      autoComplete="off"
                    />
                    <SendBtn type="submit" disabled={!canSend || !input.trim()}>
                      <FaPaperPlane />
                    </SendBtn>
                  </InputRow>
                  {!isClosed &&
                    effectiveChatPhase === 'active' &&
                    supportMeta?.assignedAdminName && (
                      <AssignedAgentFootnote role="status" aria-live="polite">
                        Chatting with{' '}
                        <strong>{supportMeta.assignedAdminName}</strong> from Saiisai Support
                      </AssignedAgentFootnote>
                    )}
                </>
              )}
            </>
          )}
        </Window>
      )}

      <Bubble onClick={() => setOpen((v) => !v)} aria-label="Open support chat">
        {open ? <FaTimes /> : <FaComments />}
        {!open && unread > 0 && (
          <UnreadBadge>{unread > 9 ? '9+' : unread}</UnreadBadge>
        )}
      </Bubble>
    </>
  );
};

export default SellerChatWidget;
