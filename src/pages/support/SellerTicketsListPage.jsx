import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaTicketAlt } from 'react-icons/fa';
import styled from 'styled-components';
import { useMyTickets } from '../../shared/hooks/useSupport';
import { STATUS_COLORS, PRIORITY_COLORS } from './supportTypes';
import { PATHS } from '../../routes/routePaths';
import { SkeletonTableRows } from '../../shared/components/ui/LoadingComponents';

/* ─── Styled Components ───────────────────────────────────────────────────── */
const Container = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  background: #F9F8F5;
  min-height: 100vh;
`;

const Header = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CreateButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 36px;
  padding: 0 1rem;
  background: #E8920A;
  color: #FFFFFF;
  border: none;
  border-radius: 9px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: #D97706; }
`;

const FiltersBar = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 0.8rem;
`;

const Input = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 0.9rem 0 2.2rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.875rem;
  background: #F9F8F5;
  color: #111827;
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: #9CA3AF; }
  &:focus { border-color: #E8920A; background: #FFFFFF; }
`;

const FilterSelect = styled.select`
  height: 36px;
  padding: 0 0.75rem;
  border: 0.5px solid #F1EFE8;
  border-radius: 9px;
  font-size: 0.8rem;
  color: #374151;
  background: #FFFFFF;
  cursor: pointer;
  outline: none;
  &:focus { border-color: #E8920A; }
`;

const TicketsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TicketCard = styled(motion.div)`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;

  &:hover { background: #FFFDF9; border-color: #E8920A; }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const TicketLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const TicketNumber = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: #9CA3AF;
  font-family: ui-monospace, 'Courier New', monospace;
  margin-bottom: 0.25rem;
`;

const TicketTitle = styled.h3`
  font-size: 0.925rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.4rem;
  line-height: 1.4;
`;

const TicketMeta = styled.div`
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  font-size: 0.775rem;
  color: #9CA3AF;
`;

const TicketRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
  flex-shrink: 0;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${(p) => p.$bgColor || '#F3F4F6'};
  color: ${(p) => p.$color || '#374151'};
`;

const EmptyState = styled.div`
  background: #FFFFFF;
  border: 0.5px solid #F1EFE8;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  color: #D1D5DB;
  margin-bottom: 0.5rem;
`;

const EmptyTitle = styled.h3`
  font-size: 0.975rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 0.8rem;
  color: #9CA3AF;
  margin: 0 0 1rem;
`;


/**
 * Seller Tickets List Page
 */
const SellerTicketsListPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useMyTickets({
    status: statusFilter || undefined,
    department: departmentFilter || undefined,
  });

  const tickets = data?.data?.tickets || [];

  // Filter by search query
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(query) ||
      ticket.ticketNumber?.toLowerCase().includes(query) ||
      ticket.department?.toLowerCase().includes(query)
    );
  });

  const handleTicketClick = (ticketId) => {
    navigate(PATHS.SUPPORT_TICKET_DETAIL.replace(':id', ticketId));
  };

  const handleCreateTicket = () => {
    navigate(PATHS.SUPPORT);
  };

  const getStatusBadge = (status) => {
    const colors = STATUS_COLORS[status] || '#6B7280';
    return (
      <Badge $bgColor={`${colors}15`} $color={colors}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = PRIORITY_COLORS[priority] || '#6B7280';
    return (
      <Badge $bgColor={`${colors}15`} $color={colors}>
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Container>
        <SkeletonTableRows count={6} />
      </Container>
    );
  }

  if (error) {
    // Handle 403 - Wrong role (user logged in as buyer instead of seller)
    if (error?.response?.status === 403) {
      const errorMessage = error?.response?.data?.message || '';
      if (errorMessage.includes('Required role: seller')) {
        return (
          <Container>
            <EmptyState>
              <EmptyTitle>Access Denied</EmptyTitle>
              <EmptyText>
                You are logged in as a buyer. Please log out and log in as a seller to access support tickets.
              </EmptyText>
              <CreateButton
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Go to Login
              </CreateButton>
            </EmptyState>
          </Container>
        );
      }
    }
    
    return (
      <Container>
        <EmptyState>
          <EmptyTitle>Error loading tickets</EmptyTitle>
          <EmptyText>
            {error?.response?.status === 403
              ? 'You are not authorized to access support tickets. Please ensure you are logged in as a seller.'
              : 'Please try again later.'}
          </EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>My Support Tickets</Title>
        <CreateButton
          onClick={handleCreateTicket}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaPlus />
          Create New Ticket
        </CreateButton>
      </Header>

      <FiltersBar>
        <SearchInput>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <Input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInput>
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="awaiting_user">Awaiting Response</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </FilterSelect>
        <FilterSelect
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          <option value="Payout & Finance">Payout & Finance</option>
          <option value="Orders">Orders</option>
          <option value="Listings">Listings</option>
          <option value="Account Verification">Account Verification</option>
        </FilterSelect>
      </FiltersBar>

      {filteredTickets.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FaTicketAlt />
          </EmptyIcon>
          <EmptyTitle>No tickets found</EmptyTitle>
          <EmptyText>
            {searchQuery || statusFilter || departmentFilter
              ? 'Try adjusting your filters'
              : "You haven't created any support tickets yet."}
          </EmptyText>
          {!searchQuery && !statusFilter && !departmentFilter && (
            <CreateButton
              onClick={handleCreateTicket}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus />
              Create Your First Ticket
            </CreateButton>
          )}
        </EmptyState>
      ) : (
        <TicketsList>
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              onClick={() => handleTicketClick(ticket._id)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <TicketHeader>
                <TicketLeft>
                  <TicketNumber>{ticket.ticketNumber}</TicketNumber>
                  <TicketTitle>{ticket.title}</TicketTitle>
                  <TicketMeta>
                    <span>{ticket.department}</span>
                    <span>•</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    {ticket.lastMessageAt && (
                      <>
                        <span>•</span>
                        <span>Last updated: {formatDate(ticket.lastMessageAt)}</span>
                      </>
                    )}
                  </TicketMeta>
                </TicketLeft>
                <TicketRight>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </TicketRight>
              </TicketHeader>
            </TicketCard>
          ))}
        </TicketsList>
      )}
    </Container>
  );
};

export default SellerTicketsListPage;

