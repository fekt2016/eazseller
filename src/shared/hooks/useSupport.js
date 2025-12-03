import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supportService } from '../services/supportApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * React Query hooks for support ticket operations (Seller)
 */

/**
 * Create a new support ticket
 */
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (ticketData) => supportService.createTicket(ticketData),
    onSuccess: (data) => {
      toast.success(
        data?.message || 'Support ticket created successfully! We\'ll get back to you soon.'
      );
      // Invalidate tickets list
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      // Redirect to ticket list or detail
      if (data?.data?.ticket?._id) {
        navigate(`/support/tickets/${data.data.ticket._id}`);
      } else {
        navigate('/support/tickets');
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create support ticket. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Get current user's tickets (seller-specific - only tickets related to their orders/products)
 */
export const useMyTickets = (params = {}) => {
  return useQuery({
    queryKey: ['support-tickets', 'my', params],
    queryFn: () => supportService.getMyTickets(params),
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on 403 (unauthorized)
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error) => {
      // Handle 403 - Not authorized
      if (error?.response?.status === 403) {
        toast.error('You are not authorized to access support tickets');
      }
    },
  });
};

/**
 * Get tickets related to seller's products
 */
export const useProductRelatedTickets = (params = {}) => {
  return useQuery({
    queryKey: ['support-tickets', 'product-related', params],
    queryFn: () => supportService.getProductRelatedTickets(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get single ticket by ID
 */
export const useTicketDetail = (ticketId) => {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => supportService.getTicketById(ticketId),
    enabled: !!ticketId,
    staleTime: 10000, // 10 seconds
    retry: (failureCount, error) => {
      // Don't retry on 403 (unauthorized) or 404 (not found)
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error) => {
      // Handle 403 - Not authorized to view this ticket
      if (error?.response?.status === 403) {
        toast.error('You are not authorized to view this ticket');
        navigate('/support/tickets');
      } else if (error?.response?.status === 404) {
        toast.error('Ticket not found');
        navigate('/support/tickets');
      }
    },
  });
};

/**
 * Reply to a ticket
 */
export const useReplyToTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, replyData }) => supportService.replyToTicket(ticketId, replyData),
    onSuccess: (data, variables) => {
      toast.success('Reply sent successfully');
      // Invalidate ticket detail and list
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send reply. Please try again.';
      toast.error(errorMessage);
    },
  });
};

/**
 * Legacy hook for backward compatibility
 */
export const useSupport = () => {
  const createTicket = useCreateTicket();
  return {
    submitTicket: createTicket,
    isSubmitting: createTicket.isPending,
  };
};

export default useSupport;
