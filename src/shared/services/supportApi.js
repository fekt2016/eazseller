import api from './api';

/**
 * Support API Service
 * Full ticket management for sellers
 */
export const supportService = {
  /**
   * Create a new support ticket
   * @param {Object} ticketData - Support ticket data
   * @returns {Promise} API response
   */
  createTicket: async (ticketData) => {
    const formData = new FormData();

    // Add text fields
    formData.append('department', ticketData.department);
    formData.append('title', ticketData.subject || ticketData.title);
    formData.append('message', ticketData.message);
    formData.append('priority', ticketData.priority || 'medium');
    
    if (ticketData.issueType) {
      formData.append('issueType', ticketData.issueType);
    }
    if (ticketData.relatedOrderId) {
      formData.append('relatedOrderId', ticketData.relatedOrderId);
    }
    if (ticketData.relatedPayoutId) {
      formData.append('relatedPayoutId', ticketData.relatedPayoutId);
    }

    // Add attachments if provided
    if (ticketData.screenshot && ticketData.screenshot instanceof File) {
      formData.append('attachments', ticketData.screenshot);
    }
    if (ticketData.attachments && Array.isArray(ticketData.attachments)) {
      ticketData.attachments.forEach((file) => {
        if (file instanceof File) {
          formData.append('attachments', file);
        }
      });
    }

    const response = await api.post('/support/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get seller's tickets (only tickets related to their orders or products)
   * Uses seller-specific endpoint for secure filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getMyTickets: async (params = {}) => {
    const response = await api.get('/support/seller/tickets', { params });
    return response.data;
  },

  /**
   * Get tickets related to seller's products
   * @deprecated Use getMyTickets instead - it includes product-related tickets
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getProductRelatedTickets: async (params = {}) => {
    // For backward compatibility, filter getMyTickets results
    const allTickets = await supportService.getMyTickets(params);
    // Filter to only product-related tickets
    const productRelated = {
      ...allTickets,
      data: {
        ...allTickets.data,
        tickets: allTickets.data.tickets.filter((ticket) => ticket.relatedProductId),
      },
    };
    return productRelated;
  },

  /**
   * Get single ticket by ID (seller-specific endpoint)
   * Only returns tickets related to seller's orders or products
   * @param {string} ticketId - Ticket ID
   * @returns {Promise} API response
   */
  getTicketById: async (ticketId) => {
    const response = await api.get(`/support/seller/tickets/${ticketId}`);
    return response.data;
  },

  /**
   * Reply to a ticket
   * @param {string} ticketId - Ticket ID
   * @param {Object} replyData - Reply data
   * @returns {Promise} API response
   */
  replyToTicket: async (ticketId, replyData) => {
    const formData = new FormData();
    formData.append('message', replyData.message);

    // Add attachments if provided
    if (replyData.attachments && Array.isArray(replyData.attachments)) {
      replyData.attachments.forEach((file) => {
        if (file instanceof File) {
          formData.append('attachments', file);
        }
      });
    }

    const response = await api.post(`/support/tickets/${ticketId}/reply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Legacy method for backward compatibility
   */
  submitTicket: async (ticketData) => {
    return supportService.createTicket(ticketData);
  },
};

export default supportService;
