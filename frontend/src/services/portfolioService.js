/**
 * Portfolio Service — all portfolio-related API calls.
 *
 * Keeps API contract details out of Redux slices and UI components.
 */
import { apiClient } from './apiClient';

const PortfolioService = {
  /**
   * Submit portfolio form data and trigger AI generation.
   * @param {object} formData - Full portfolio form payload
   * @returns {Promise<{ portfolioId: string, liveUrl: string, templateName: string }>}
   */
  generate: (formData) => apiClient.post('/portfolio/generate', { formData }),

  /**
   * Fetch the authenticated user's portfolio.
   * @returns {Promise<{ portfolio: object }>}
   */
  getMyPortfolio: () => apiClient.get('/portfolio/me'),

  /**
   * Update portfolio content.
   * @param {string} id - Portfolio ID
   * @param {object} updates - Fields to update
   * @returns {Promise<{ portfolio: object }>}
   */
  update: (id, updates) => apiClient.put(`/portfolio/${id}`, updates),

  /**
   * Change the active template for a portfolio.
   * @param {string} id - Portfolio ID
   * @param {{ templateName: string }} payload
   * @returns {Promise<{ portfolio: object }>}
   */
  changeTemplate: (id, payload) => apiClient.patch(`/portfolio/${id}/template`, payload),

  /**
   * Fetch portfolio analytics (views, clicks, etc.)
   * @param {string} id - Portfolio ID
   * @returns {Promise<{ analytics: object }>}
   */
  getAnalytics: (id) => apiClient.get(`/portfolio/${id}/analytics`),

  /**
   * Delete the portfolio permanently.
   * @param {string} id - Portfolio ID
   * @returns {Promise<{ message: string }>}
   */
  delete: (id) => apiClient.delete(`/portfolio/${id}`),

  /**
   * Save draft — persists formData + currentStep without triggering AI.
   * Called on every step advance. Idempotent: creates or updates the draft.
   * @param {object} formData - Portfolio form data so far
   * @param {number} currentStep - Step user just completed (1-7)
   * @returns {Promise<{ portfolioId: string, currentStep: number, slug: string }>}
   */
  saveDraft: (formData, currentStep) =>
    apiClient.post('/portfolio/save-draft', { formData, currentStep }),

  /**
   * Check slug availability from a name in real-time.
   * @param {string} name - The full name typed by the user
   * @returns {Promise<{ slug: string, available: boolean }>}
   */
  checkSlug: (name) =>
    apiClient.get(`/portfolio/slug-check?name=${encodeURIComponent(name)}`),
};

export default PortfolioService;
