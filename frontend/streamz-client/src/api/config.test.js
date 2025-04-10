// config.test.js
import API_BASE_URL, { API_ENDPOINTS } from './config';

describe('API Configuration', () => {
  // Prueba básica de la URL base
  test('API_BASE_URL should be a valid URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL).toMatch(/^https?:\/\//); // Verifica que comience con http:// o https://
  });

  // Pruebas para endpoints de autenticación
  describe('Authentication Endpoints', () => {
    test('LOGIN endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.LOGIN).toBe(`${API_BASE_URL}/auth/login/`);
    });

    test('REGISTER endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.REGISTER).toBe(`${API_BASE_URL}/auth/register/`);
    });

    test('PROFILE endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.PROFILE).toBe(`${API_BASE_URL}/auth/profile/`);
    });

    test('PLANS endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.PLANS).toBe(`${API_BASE_URL}/auth/plans/`);
    });
  });

  // Pruebas para endpoints de contenido
  describe('Content Endpoints', () => {
    test('GENRES endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.GENRES).toBe(`${API_BASE_URL}/content/genres/`);
    });

    test('CONTENT endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.CONTENT).toBe(`${API_BASE_URL}/content/content/`);
    });

    test('MOVIES endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.MOVIES).toBe(`${API_BASE_URL}/content/content/movies/`);
    });

    test('SERIES endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.SERIES).toBe(`${API_BASE_URL}/content/content/series/`);
    });

    test('DOCUMENTARIES endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.DOCUMENTARIES).toBe(`${API_BASE_URL}/content/content/documentaries/`);
    });
  });

  // Pruebas para endpoints de streaming
  describe('Streaming Endpoints', () => {
    test('HISTORY endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.HISTORY).toBe(`${API_BASE_URL}/streaming/history/`);
    });

    test('CONTINUE_WATCHING endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.CONTINUE_WATCHING).toBe(`${API_BASE_URL}/streaming/history/continue_watching/`);
    });

    test('UPDATE_PROGRESS endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.UPDATE_PROGRESS).toBe(`${API_BASE_URL}/streaming/history/update_progress/`);
    });

    test('RECOMMENDATIONS endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.RECOMMENDATIONS).toBe(`${API_BASE_URL}/streaming/recommendations/`);
    });

    test('TRENDING endpoint should be correctly formatted', () => {
      expect(API_ENDPOINTS.TRENDING).toBe(`${API_BASE_URL}/streaming/trending/`);
    });
  });

  // Prueba de estructura completa
  test('API_ENDPOINTS should have all required categories', () => {
    // Verificar que tenemos las tres categorías principales de endpoints
    expect(API_ENDPOINTS).toHaveProperty('LOGIN');
    expect(API_ENDPOINTS).toHaveProperty('REGISTER');
    expect(API_ENDPOINTS).toHaveProperty('PROFILE');
    
    expect(API_ENDPOINTS).toHaveProperty('GENRES');
    expect(API_ENDPOINTS).toHaveProperty('CONTENT');
    expect(API_ENDPOINTS).toHaveProperty('MOVIES');
    
    expect(API_ENDPOINTS).toHaveProperty('HISTORY');
    expect(API_ENDPOINTS).toHaveProperty('RECOMMENDATIONS');
    expect(API_ENDPOINTS).toHaveProperty('TRENDING');
  });

  // Caso negativo: Comprobar que no hay endpoints incorrectos
  test('API_ENDPOINTS should not contain invalid endpoints', () => {
    // Verificar que no hay un endpoint inexistente
    expect(API_ENDPOINTS).not.toHaveProperty('INVALID_ENDPOINT');
    
    // Verificar que todos los endpoints comienzan con la URL base
    Object.values(API_ENDPOINTS).forEach(endpoint => {
      expect(endpoint.startsWith(API_BASE_URL)).toBeTruthy();
    });
  });
});