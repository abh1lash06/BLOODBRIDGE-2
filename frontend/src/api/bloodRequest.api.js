import apiClient from './client';

export const bloodRequestApi = {
  /**
   * Create blood request (PATIENT only)
   * POST /api/blood-requests
   * @param {Object} data { bloodGroup, unitsRequired, urgency, requiredDate, hospitalId, notes }
   */
  createRequest: async (data) => {
    const response = await apiClient.post('/blood-requests', data);
    return response.data;
  },

  /**
   * Get my blood requests (PATIENT only)
   * GET /api/blood-requests/my?page=...&size=...
   */
  getMyRequests: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/blood-requests/my', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get blood request by ID
   * GET /api/blood-requests/{id}
   */
  getRequestById: async (id) => {
    const response = await apiClient.get(`/blood-requests/${id}`);
    return response.data;
  },

  /**
   * Update blood request (Owner patient, Assigned hospital, or Admin)
   * PUT /api/blood-requests/{id}
   * @param {number|string} id
   * @param {Object} data { unitsRequired, urgency, requiredDate, notes, status }
   */
  updateRequest: async (id, data) => {
    const response = await apiClient.put(`/blood-requests/${id}`, data);
    return response.data;
  },

  /**
   * Cancel blood request (Owner patient only)
   * PATCH /api/blood-requests/{id}/cancel
   */
  cancelRequest: async (id) => {
    const response = await apiClient.patch(`/blood-requests/${id}/cancel`);
    return response.data;
  },

  /**
   * List open / pending requests (HOSPITAL or ADMIN)
   * GET /api/blood-requests/open?page=...&size=...
   */
  listOpenRequests: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/blood-requests/open', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * List requests assigned to the authenticated hospital
   * GET /api/blood-requests/hospital?page=...&size=...
   */
  listHospitalRequests: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/blood-requests/hospital', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * List open requests matching the authenticated donor's blood group
   * GET /api/blood-requests/matching?page=...&size=...
   */
  getMatchingRequestsForDonor: async ({ page = 0, size = 10 } = {}) => {
    const response = await apiClient.get('/blood-requests/matching', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Respond to an emergency blood request as a donor (ACCEPT or DECLINE)
   * POST /api/blood-requests/{id}/respond
   * @param {number|string} id
   * @param {Object} data { action: 'ACCEPT'|'DECLINE', notes: '' }
   */
  respondToRequest: async (id, { action = 'ACCEPT', notes = '' } = {}) => {
    const response = await apiClient.post(`/blood-requests/${id}/respond`, {
      action,
      notes,
    });
    return response.data;
  },

  /**
   * Get donor responses for a blood request with authorized contact details
   * GET /api/blood-requests/{id}/responses
   * @param {number|string} id
   */
  getRequestResponses: async (id) => {
    const response = await apiClient.get(`/blood-requests/${id}/responses`);
    return response.data;
  },
};

export default bloodRequestApi;
