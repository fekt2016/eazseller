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
      
      // Redirect to ticket list or detail after a short delay
      // This ensures the success toast is visible and auth state is stable
      // Also ensures ProtectedRoute has time to verify auth before navigation
      setTimeout(() => {
        try {
          // Use dashboard path to match the route structure
          if (data?.data?.ticket?._id) {
            navigate(`/dashboard/support/tickets/${data.data.ticket._id}`, { replace: false });
          } else {
            navigate('/dashboard/support/tickets', { replace: false });
          }
        } catch (navError) {
          console.error('[useCreateTicket] Navigation error:', navError);
          // Fallback: just show success message, user can navigate manually
          toast.info('Ticket created! You can view it in your tickets list.');
        }
      }, 1500); // 1.5 second delay to ensure auth state is ready
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create support ticket. Please try again.';
      toast.error(errorMessage);
      
      // Don't redirect on error - let user stay on form to retry
    },
  });
};

/**
 * Get current user's tickets (seller-specific - only tickets related to their orders/products)
 */
export const useMyTickets = (params = {}) => {
  const navigate = useNavigate();
  
  return useQuery({
    queryKey: ['support-tickets', 'my', params],
    queryFn: () => supportService.getMyTickets(params),
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on 403 (unauthorized) or 401 (unauthenticated)
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error) => {
      // Handle 403 - Wrong role (user logged in as buyer instead of seller)
      if (error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message || 'You are not authorized to access support tickets';
        if (errorMessage.includes('Required role: seller')) {
          toast.error('Please log in as a seller to access support tickets');
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.error(errorMessage);
        }
      }
      // Handle 401 - Not authenticated
      if (error?.response?.status === 401) {
        toast.error('Please log in to access support tickets');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
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
      // Handle 403 - Wrong role or not authorized
      if (error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message || 'You are not authorized to view this ticket';
        if (errorMessage.includes('Required role: seller')) {
          toast.error('Please log in as a seller to view this ticket');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.error(errorMessage);
          navigate('/dashboard/support/tickets');
        }
      } else if (error?.response?.status === 404) {
        toast.error('Ticket not found');
        navigate('/dashboard/support/tickets');
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
