// src/App.js
import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaCog,
  FaSearch,
  FaPhone,
  FaVideo,
  FaInfoCircle,
  FaPaperclip,
  FaSmile,
  FaPaperPlane,
  FaShoppingBag,
  FaStickyNote,
  FaUserShield,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// Global styles

// Animation for messages
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Theme variables removed - using CSS variables from GlobalStyles

// Main container
const Container = styled.div`
  display: flex;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  background: white;
  box-shadow: var(--shadow-md);
`;

// Sidebar Styles
const Sidebar = styled.div`
  width: 320px;
  background: white;
  border-right: 1px solid var(--color-grey-200);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-primary-500);
  color: white;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-500);
  font-weight: bold;
  font-size: 20px;
`;

const BrandName = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: white;
`;

const SearchBar = styled.div`
  padding: 10px 20px;
  border-bottom: 1px solid var(--color-grey-200);
  background: #f0f4ff;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-500);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 15px 10px 40px;
  border-radius: 20px;
  border: 1px solid var(--color-grey-200);
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  background: white;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
  }
`;

const Conversations = styled.div`
  flex: 1;
  overflow-y: auto;
  background: #f8fafd;
`;

const Conversation = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) =>
    props.active ? "rgba(74, 108, 247, 0.05)" : "white"};
  border-left: ${(props) =>
      props.active ? `3px solid var(--color-primary-500)` : "none"};

  &:hover {
    background-color: #f0f4ff;
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${(props) =>
    props.admin
      ? "linear-gradient(45deg, #8e44ad, #9b59b6)"
      : "linear-gradient(45deg, #27ae60, #2ecc71)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  flex-shrink: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    background-color: ${(props) =>
      props.online ? "var(--color-green-700)" : "var(--color-grey-500)"};
  }
`;

const ConversationDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConversationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const CustomerName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${(props) => (props.admin ? "#8e44ad" : "var(--color-grey-700)")};
`;

const Time = styled.div`
  color: var(--color-grey-500);
  font-size: 12px;
`;

const MessagePreview = styled.div`
  font-size: 13px;
  color: var(--color-grey-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Unread = styled.div`
  background-color: var(--color-primary-500);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
`;

// Main Chat Area
const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
`;

const ChatHeader = styled.div`
  padding: 15px 25px;
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
`;

const ChatCustomer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ChatAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) =>
    props.admin
      ? "linear-gradient(45deg, #8e44ad, #9b59b6)"
      : "linear-gradient(45deg, #27ae60, #2ecc71)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid white;
    background-color: ${(props) =>
      props.online ? "var(--color-green-700)" : "var(--color-grey-500)"};
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CustomerNameLg = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${(props) => (props.admin ? "#8e44ad" : "var(--color-grey-700)")};
`;

const CustomerStatus = styled.div`
  font-size: 13px;
  color: var(--color-grey-500);
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.status === "online" ? "var(--color-green-700)" : "var(--color-grey-500)"};
`;

const ChatActions = styled.div`
  display: flex;
  gap: 15px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--color-grey-500);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-primary-500);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-image: linear-gradient(
      rgba(240, 244, 255, 0.5),
      rgba(240, 244, 255, 0.5)
    ),
    radial-gradient(
      circle at top left,
      rgba(142, 68, 173, 0.05) 0%,
      transparent 20%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(39, 174, 96, 0.05) 0%,
      transparent 20%
    );
`;

const Message = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
  align-self: ${(props) => (props.outgoing ? "flex-end" : "flex-start")};
  background: ${(props) => (props.outgoing ? "var(--color-primary-500)" : "white")};
  color: ${(props) => (props.outgoing ? "white" : "var(--color-grey-700)")};
  border-bottom-right-radius: ${(props) => (props.outgoing ? "5px" : "18px")};
  border-bottom-left-radius: ${(props) => (props.outgoing ? "18px" : "5px")};
  border: ${(props) =>
    !props.outgoing ? `1px solid var(--color-grey-200)` : "none"};
  box-shadow: ${(props) =>
    !props.outgoing
      ? "0 2px 4px rgba(0,0,0,0.05)"
      : "0 2px 4px rgba(74, 108, 247, 0.2)"};
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: ${(props) =>
    props.outgoing ? "rgba(255, 255, 255, 0.7)" : "var(--color-grey-500)"};
  margin-top: 5px;
  text-align: right;
`;

const ChatInput = styled.div`
  padding: 20px;
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  gap: 15px;
  align-items: center;
  background: white;
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  background: var(--color-grey-100);
  border-radius: 24px;
  padding: 0 15px;
`;

const InputField = styled.input`
  flex: 1;
  border: none;
  background: none;
  padding: 12px 0;
  font-size: 15px;
  outline: none;
`;

const InputActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const InputButton = styled.button`
  background: none;
  border: none;
  color: var(--color-grey-500);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(74, 108, 247, 0.1);
    color: var(--color-primary-500);
  }
`;

const SendButton = styled(InputButton)`
  background-color: var(--color-primary-500) !important;
  color: white !important;

  &:hover {
    background-color: var(--color-primary-600) !important;
  }
`;

// Admin Info Panel
const InfoPanel = styled.div`
  width: 300px;
  border-left: 1px solid var(--color-grey-200);
  padding: 25px;
  background: white;
  overflow-y: auto;

  @media (max-width: 1200px) {
    display: none;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const PanelTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary-500);
`;

const ClosePanel = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-grey-500);
  cursor: pointer;
`;

const AdminDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
`;

const InfoAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #8e44ad, #9b59b6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 30px;
  margin-bottom: 15px;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    border: 2px solid white;
    background-color: ${(props) =>
      props.online ? "var(--color-green-700)" : "var(--color-grey-500)"};
  }
`;

const AdminName = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #8e44ad;
`;

const AdminEmail = styled.div`
  color: var(--color-grey-500);
  font-size: 14px;
  margin-bottom: 15px;
`;

const AdminStats = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary-500);
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: var(--color-grey-500);
`;

const Section = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary-500);
`;

const Notes = styled.div`
  background-color: var(--color-grey-100);
  padding: 15px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
`;

const AdminBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(142, 68, 173, 0.1);
  color: #8e44ad;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
`;

// App Component
function ChatSupport() {
  const [activeConversation, setActiveConversation] = useState(1);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  // Sample data - Seller chatting with admins
  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Please send order details",
      time: "10:24 AM",
      unread: 3,
      admin: true,
      online: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      lastMessage: "Your support ticket has been resolved",
      time: "9:45 AM",
      unread: 0,
      admin: true,
      online: true,
    },
    {
      id: 3,
      name: "Emma Wilson",
      lastMessage: "New seller guidelines available",
      time: "Yesterday",
      unread: 1,
      admin: true,
      online: false,
    },
    {
      id: 4,
      name: "Robert Garcia",
      lastMessage: "Account verification complete",
      time: "Jun 28",
      unread: 0,
      admin: true,
      online: true,
    },
  ];

  const messages = {
    1: [
      {
        id: 1,
        text: "Hello, I'm having an issue with my seller dashboard",
        sender: "seller",
        time: "10:05 AM",
      },
      {
        id: 2,
        text: "Hello! I'm Sarah from Seller Support. How can I assist you today?",
        sender: "admin",
        time: "10:06 AM",
      },
      {
        id: 3,
        text: "I can't see my recent orders in the dashboard. It shows nothing",
        sender: "seller",
        time: "10:10 AM",
      },
      {
        id: 4,
        text: "Let me check that for you. Could you please provide your store ID?",
        sender: "admin",
        time: "10:12 AM",
      },
    ],
    2: [
      {
        id: 1,
        text: "Hi, I submitted a support ticket about payment delays",
        sender: "seller",
        time: "9:30 AM",
      },
      {
        id: 2,
        text: "Yes, we've resolved that issue. Your payments will be processed by end of day",
        sender: "admin",
        time: "9:32 AM",
      },
      {
        id: 3,
        text: "Great, thank you for the quick resolution!",
        sender: "seller",
        time: "9:40 AM",
      },
    ],
    3: [
      {
        id: 1,
        text: "Are there any updates to the seller policies?",
        sender: "seller",
        time: "Yesterday",
      },
      {
        id: 2,
        text: "Yes, we've updated our return policy. I'll send you the document",
        sender: "admin",
        time: "Yesterday",
      },
    ],
  };

  const adminDetails = {
    1: {
      name: "Sarah Johnson",
      email: "s.johnson@seller-support.com",
      role: "Senior Support Admin",
      status: "Online",
      responseTime: "5 min",
      notes:
        "Specializes in dashboard and account issues. Available Mon-Fri 9AM-5PM. Fluent in English and Spanish.",
    },
    2: {
      name: "Michael Chen",
      email: "m.chen@seller-support.com",
      role: "Billing Specialist",
      status: "Online",
      responseTime: "8 min",
      notes:
        "Handles payment and financial issues. Contact for payout delays or transaction discrepancies.",
    },
    3: {
      name: "Emma Wilson",
      email: "e.wilson@seller-support.com",
      role: "Policy Administrator",
      status: "Offline",
      responseTime: "2 hrs",
      notes:
        "Manages seller guidelines and policy updates. Will respond within 24 hours during business days.",
    },
    4: {
      name: "Robert Garcia",
      email: "r.garcia@seller-support.com",
      role: "Account Manager",
      status: "Online",
      responseTime: "3 min",
      notes:
        "Handles account verifications and security issues. Contact for any account access problems.",
    },
  };

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;

    // Add new message
    const newMessage = {
      id: messages[activeConversation].length + 1,
      text: messageText,
      sender: "seller",
      time: "Just now",
    };

    // Update messages (in a real app, this would come from backend)
    messages[activeConversation].push(newMessage);

    // Clear input
    setMessageText("");

    // Scroll to bottom
    setTimeout(scrollToBottom, 100);

    // Simulate admin reply after 1-3 seconds
    setTimeout(() => {
      const replies = [
        "I'll look into this right away.",
        "Thanks for the details. Let me check your account.",
        "Can you provide more information about this issue?",
        "I've forwarded this to our technical team.",
        "We're working on a solution for this.",
      ];

      const reply = replies[Math.floor(Math.random() * replies.length)];
      const replyMessage = {
        id: messages[activeConversation].length + 1,
        text: reply,
        sender: "admin",
        time: "Just now",
      };

      messages[activeConversation].push(replyMessage);
      scrollToBottom();
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const activeAdmin = adminDetails[activeConversation];

  return (
    <Container>
      {/* Sidebar */}
      <Sidebar>
        <Header>
          <Brand>
            <Logo>S</Logo>
            <BrandName>Seller Support</BrandName>
          </Brand>
          <ActionButton>
            <FaCog color="white" />
          </ActionButton>
        </Header>

        <SearchBar>
          <SearchContainer>
            <SearchIcon />
            <SearchInput type="text" placeholder="Search admins..." />
          </SearchContainer>
        </SearchBar>

        <Conversations>
          <div
            style={{
              padding: "15px 20px 10px",
              color: "var(--color-grey-500)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaUserShield /> Admin Support Team
          </div>
          {conversations.map((convo) => (
            <Conversation
              key={convo.id}
              active={activeConversation === convo.id}
              onClick={() => setActiveConversation(convo.id)}
            >
              <Avatar admin online={convo.online}>
                {convo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar>
              <ConversationDetails>
                <ConversationHeader>
                  <CustomerName admin>
                    {convo.name}
                    {convo.admin && (
                      <AdminBadge>
                        <FaUserShield size={10} /> ADMIN
                      </AdminBadge>
                    )}
                  </CustomerName>
                  <Time>{convo.time}</Time>
                </ConversationHeader>
                <MessagePreview>{convo.lastMessage}</MessagePreview>
              </ConversationDetails>
              {convo.unread > 0 && <Unread>{convo.unread}</Unread>}
            </Conversation>
          ))}
        </Conversations>
      </Sidebar>

      {/* Main Chat Area */}
      <ChatContainer>
        <ChatHeader>
          <ChatCustomer>
            <ChatAvatar
              admin
              online={
                conversations.find((c) => c.id === activeConversation)?.online
              }
            >
              {conversations
                .find((c) => c.id === activeConversation)
                ?.name.split(" ")
                .map((n) => n[0])
                .join("")}
            </ChatAvatar>
            <CustomerInfo>
              <CustomerNameLg admin>
                {conversations.find((c) => c.id === activeConversation)?.name}
              </CustomerNameLg>
              <CustomerStatus>
                <StatusIndicator
                  status={
                    conversations.find((c) => c.id === activeConversation)
                      ?.online
                      ? "online"
                      : "offline"
                  }
                />
                <span>
                  {conversations.find((c) => c.id === activeConversation)
                    ?.online
                    ? "Online - Active now"
                    : "Offline"}
                </span>
              </CustomerStatus>
            </CustomerInfo>
          </ChatCustomer>
          <ChatActions>
            <ActionButton>
              <FaPhone />
            </ActionButton>
            <ActionButton>
              <FaVideo />
            </ActionButton>
            <ActionButton>
              <FaInfoCircle />
            </ActionButton>
          </ChatActions>
        </ChatHeader>

        <ChatMessages>
          {messages[activeConversation]?.map((msg) => (
            <Message key={msg.id} outgoing={msg.sender === "seller"}>
              <div className="message-text">{msg.text}</div>
              <MessageTime outgoing={msg.sender === "seller"}>
                {msg.time}
              </MessageTime>
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>

        <ChatInput>
          <InputGroup>
            <InputButton>
              <FaPaperclip />
            </InputButton>
            <InputField
              type="text"
              placeholder="Type a message to admin..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <InputButton>
              <FaSmile />
            </InputButton>
          </InputGroup>
          <InputActions>
            <SendButton onClick={handleSendMessage}>
              <FaPaperPlane />
            </SendButton>
          </InputActions>
        </ChatInput>
      </ChatContainer>

      {/* Admin Info Panel */}
      <InfoPanel>
        <PanelHeader>
          <PanelTitle>Admin Details</PanelTitle>
          <ClosePanel>
            <IoClose />
          </ClosePanel>
        </PanelHeader>

        <AdminDetails>
          <InfoAvatar
            online={
              conversations.find((c) => c.id === activeConversation)?.online
            }
          >
            {activeAdmin?.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </InfoAvatar>
          <AdminName>{activeAdmin?.name}</AdminName>
          <AdminEmail>{activeAdmin?.email}</AdminEmail>

          <AdminStats>
            <Stat>
              <StatValue>{activeAdmin?.role}</StatValue>
              <StatLabel>Role</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{activeAdmin?.responseTime}</StatValue>
              <StatLabel>Avg. Response</StatLabel>
            </Stat>
          </AdminStats>
        </AdminDetails>

        <Section>
          <SectionTitle>
            <FaStickyNote />
            <span>Admin Notes</span>
          </SectionTitle>
          <Notes>{activeAdmin?.notes}</Notes>
        </Section>

        <Section>
          <SectionTitle>
            <FaShoppingBag />
            <span>Seller Guidelines</span>
          </SectionTitle>
          <Notes>
            For faster resolution, please provide your store ID and order
            numbers when contacting support. Our team is available
            Monday-Friday, 8AM-6PM.
          </Notes>
        </Section>
      </InfoPanel>
    </Container>
  );
}

export default ChatSupport;
