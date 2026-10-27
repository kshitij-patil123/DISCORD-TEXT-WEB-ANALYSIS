// Dynamic Base URL: uses VITE_API_URL environment variable in production (e.g., on Vercel),
// or falls back to '/api' for Vite's local dev proxy.
const rawUrl = import.meta.env.VITE_API_URL || '';
const cleanRaw = rawUrl.replace(/\/+$/, '');
const BASE_URL = cleanRaw
  ? (cleanRaw.endsWith('/api') ? cleanRaw : `${cleanRaw}/api`)
  : '/api';

/**
 * Generic API fetch helper with response parsing and error handling.
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorDetail = `Request failed with status ${res.status}`;
      try {
        const errJson = await res.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch (e) {
        // fallback
      }
      throw new Error(errorDetail);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error on [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Health & Dashboard
  getHealth: () => apiRequest('/health'),
  getDashboard: () => apiRequest('/dashboard'),

  // Text Analytics & NLP
  processText: (text) => apiRequest('/nlp/process-text', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  getTermFrequencies: () => apiRequest('/nlp/term-frequencies'),
  getTopics: () => apiRequest('/topics'),
  getEntities: () => apiRequest('/entities'),
  triggerAnalysis: () => apiRequest('/analyze', { method: 'POST' }),

  // Sentiment Analysis
  predictSentiment: (text) => apiRequest('/sentiment/predict', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  getSentimentDistribution: () => apiRequest('/sentiment/distribution'),

  // Social Mining
  getNetwork: () => apiRequest('/network'),

  // Recommender
  getRecommendations: (preferred_genres, interests, top_n = 6) => apiRequest('/recommend', {
    method: 'POST',
    body: JSON.stringify({ preferred_genres, interests, top_n }),
  }),
  getAvailableGenres: () => apiRequest('/recommend/genres'),

  // Web Analytics
  getWebAnalyticsOverview: () => apiRequest('/web-analytics/overview'),
  runABTest: (payload) => apiRequest('/web-analytics/ab-test', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Model Evaluation & Explainability
  getModelMetrics: () => apiRequest('/model/metrics'),
  explainPrediction: (text) => apiRequest('/model/explain', {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),

  // Drift & Feedback
  getDrift: () => apiRequest('/drift'),
  submitFeedback: (feedback) => apiRequest('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedback),
  }),
  getFeedbackList: () => apiRequest('/feedback/list'),

  // Data Management
  getDataPreview: (limit = 25, offset = 0) => apiRequest(`/data/preview?limit=${limit}&offset=${offset}`),
  getDataStats: () => apiRequest('/data/stats'),
  resetDemoData: () => apiRequest('/data/reset-demo', { method: 'POST' }),
  getDiscordStatus: () => apiRequest('/data/discord/status'),
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/data/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  },
  downloadCSVUrl: `${BASE_URL}/data/download`,
};
