import apiClient from './client';

export const donorApi = {
  /**
   * Get authenticated donor's profile
   * GET /api/donors/me
   */
  getMyProfile: async () => {
    const response = await apiClient.get('/donors/me');
    return response.data;
  },

  /**
   * Update authenticated donor's profile
   * PUT /api/donors/me
   * @param {Object} data { bloodGroup, dateOfBirth, gender, address, city, state, availableToDonate }
   */
  updateProfile: async (data) => {
    const response = await apiClient.put('/donors/me', data);
    return response.data;
  },

  /**
   * Get donor's verification status string
   * GET /api/donors/me/verification
   */
  getVerificationStatus: async () => {
    const response = await apiClient.get('/donors/me/verification');
    return response.data;
  },

  /**
   * List verified donors (Public/Authenticated directory)
   * GET /api/donors?bloodGroup=...&page=...&size=...
   */
  listVerifiedDonors: async ({ bloodGroup, page = 0, size = 20 } = {}) => {
    const params = { page, size };
    if (bloodGroup) params.bloodGroup = bloodGroup;
    const response = await apiClient.get('/donors', { params });
    return response.data;
  },
};

export default donorApi;
