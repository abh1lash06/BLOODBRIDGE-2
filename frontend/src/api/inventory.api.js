import apiClient from './client';

export const inventoryApi = {
  /**
   * Get inventory of authenticated hospital (must be VERIFIED)
   * GET /api/inventory/my-hospital
   */
  getMyHospitalInventory: async () => {
    const response = await apiClient.get('/inventory/my-hospital');
    return response.data;
  },

  /**
   * Update blood stock units for authenticated hospital
   * PUT /api/inventory/my-hospital
   * @param {Object} data { bloodGroup, availableUnits }
   */
  updateStock: async (data) => {
    const response = await apiClient.put('/inventory/my-hospital', data);
    return response.data;
  },

  /**
   * Search verified hospitals having available inventory (> 0 units)
   * GET /api/inventory/search?bloodGroup=...
   * @param {string} bloodGroup e.g. "O_POSITIVE"
   */
  searchInventory: async (bloodGroup) => {
    const response = await apiClient.get('/inventory/search', {
      params: { bloodGroup },
    });
    return response.data;
  },

  /**
   * View inventory of a specific hospital
   * GET /api/inventory/hospital/{hospitalId}
   * @param {number|string} hospitalId
   */
  getHospitalInventory: async (hospitalId) => {
    const response = await apiClient.get(`/inventory/hospital/${hospitalId}`);
    return response.data;
  },
};

export default inventoryApi;
