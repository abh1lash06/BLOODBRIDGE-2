import apiClient from './client';

export const hospitalApi = {
  /**
   * Get authenticated hospital's profile
   * GET /api/hospitals/me
   */
  getMyHospital: async () => {
    const response = await apiClient.get('/hospitals/me');
    return response.data;
  },

  /**
   * Update authenticated hospital's profile
   * PUT /api/hospitals/me
   * @param {Object} data { hospitalName, address, city, state, contactPhone }
   */
  updateHospital: async (data) => {
    const response = await apiClient.put('/hospitals/me', data);
    return response.data;
  },

  /**
   * Get hospital verification status
   * GET /api/hospitals/me/verification
   */
  getVerificationStatus: async () => {
    const response = await apiClient.get('/hospitals/me/verification');
    return response.data;
  },

  /**
   * List verified hospitals (Public / Authenticated directory)
   * GET /api/hospitals?page=...&size=...
   */
  listVerifiedHospitals: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/hospitals', {
      params: { page, size },
    });
    return response.data;
  },
};

export default hospitalApi;
