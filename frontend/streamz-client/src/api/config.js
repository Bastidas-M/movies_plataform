//const API_BASE_URL = 'http://127.0.0.1:8000/api';
const API_BASE_URL = 'https://web-production-08ce.up.railway.app/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login/`,
  REGISTER: `${API_BASE_URL}/auth/register/`,
  PROFILE: `${API_BASE_URL}/auth/profile/`,
  PLANS: `${API_BASE_URL}/auth/plans/`,
  
  // Content endpoints
  GENRES: `${API_BASE_URL}/content/genres/`,
  CONTENT: `${API_BASE_URL}/content/content/`,
  MOVIES: `${API_BASE_URL}/content/content/movies/`,
  SERIES: `${API_BASE_URL}/content/content/series/`,
  DOCUMENTARIES: `${API_BASE_URL}/content/content/documentaries/`,
  
  // Streaming endpoints
  HISTORY: `${API_BASE_URL}/streaming/history/`,
  CONTINUE_WATCHING: `${API_BASE_URL}/streaming/history/continue_watching/`,
  UPDATE_PROGRESS: `${API_BASE_URL}/streaming/history/update_progress/`,
  RECOMMENDATIONS: `${API_BASE_URL}/streaming/recommendations/`,
  TRENDING: `${API_BASE_URL}/streaming/trending/`,
};

export default API_BASE_URL;