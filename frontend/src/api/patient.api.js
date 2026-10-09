import apiClient from './client';

export const patientApi = {
  /**
   * Get authenticated patient's profile
   * GET /api/patients/me
   */
  getMyProfile: async () => {
    const response = await apiClient.get('/patients/me');
    return response.data;
  },

  /**
   * Update authenticated patient's profile
   * PUT /api/patients/me
   * @param {Object} data { address, city, state, emergencyContactName, emergencyContactPhone }
   */
  updateProfile: async (data) => {
    const response = await apiClient.put('/patients/me', data);
    return response.data;
  },
};

export default patientApi;
