import apiClient from './client';

export const authApi = {
  /**
   * Register a new user (DONOR or PATIENT only)
   * POST /api/auth/register
   * @param {Object} data { fullName, email, password, role, phoneNumber }
   */
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   * @param {Object} data { email, password }
   */
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  /**
   * Get current authenticated user profile summary
   * GET /api/auth/me
   */
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authApi;
