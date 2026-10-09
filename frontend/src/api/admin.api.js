import apiClient from './client';

export const adminApi = {
  /**
   * List pending donors
   * GET /api/admin/donors/pending?page=...&size=...
   */
  getPendingDonors: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/admin/donors/pending', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Verify donor
   * PATCH /api/admin/donors/{donorProfileId}/verify
   */
  verifyDonor: async (donorProfileId) => {
    const response = await apiClient.patch(`/admin/donors/${donorProfileId}/verify`);
    return response.data;
  },

  /**
   * Reject donor
   * PATCH /api/admin/donors/{donorProfileId}/reject
   * @param {number|string} donorProfileId
   * @param {string} reason
   */
  rejectDonor: async (donorProfileId, reason) => {
    const response = await apiClient.patch(`/admin/donors/${donorProfileId}/reject`, {
      reason,
    });
    return response.data;
  },

  /**
   * List pending hospitals
   * GET /api/admin/hospitals/pending?page=...&size=...
   */
  getPendingHospitals: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/admin/hospitals/pending', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Verify hospital
   * PATCH /api/admin/hospitals/{hospitalId}/verify
   */
  verifyHospital: async (hospitalId) => {
    const response = await apiClient.patch(`/admin/hospitals/${hospitalId}/verify`);
    return response.data;
  },

  /**
   * Unverify hospital
   * PATCH /api/admin/hospitals/{hospitalId}/unverify
   */
  unverifyHospital: async (hospitalId) => {
    const response = await apiClient.patch(`/admin/hospitals/${hospitalId}/unverify`);
    return response.data;
  },

  /**
   * Create hospital account
   * POST /api/admin/hospitals/accounts
   * @param {Object} data { fullName, email, password, phoneNumber, hospitalName, registrationNumber, address, city, state, contactPhone }
   */
  createHospitalAccount: async (data) => {
    const response = await apiClient.post('/admin/hospitals/accounts', data);
    return response.data;
  },
};

export default adminApi;
