// HomePage.test.js
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import HomePage from './HomePage';
import AuthContext from '../context/AuthContext';
import { API_ENDPOINTS } from '../api/config';

// Mocks
jest.mock('axios');
jest.mock('../components/ContentCard', () => {
  return function MockContentCard({ content }) {
    return <div data-testid={`content-card-${content.id}`}>{content.title}</div>;
  };
});
jest.mock('../components/ContentFilters', () => {
  return function MockContentFilters({ onApplyFilters }) {
    return (
      <div data-testid="content-filters">
        <button 
          data-testid="apply-filters-btn" 
          onClick={() => onApplyFilters({ genre: '1', year: '2022' })}
        >
          Apply Filters
        </button>
      </div>
    );
  };
});

describe('HomePage Component', () => {
  // Mock data
  const mockTrending = [
    { id: 1, title: 'Trending Movie 1', content_type: 'movie' },
    { id: 2, title: 'Trending Series 1', content_type: 'series' }
  ];
  
  const mockMovies = [
    { id: 3, title: 'Action Movie 1', content_type: 'movie' },
    { id: 4, title: 'Comedy Movie 1', content_type: 'movie' }
  ];
  
  const mockSeries = [
    { id: 5, title: 'Drama Series 1', content_type: 'series' },
    { id: 6, title: 'Sci-fi Series 1', content_type: 'series' }
  ];
  
  const mockDocumentaries = [
    { id: 7, title: 'Nature Documentary 1', content_type: 'documentary' },
    { id: 8, title: 'History Documentary 1', content_type: 'documentary' }
  ];
  
  const mockRecommendations = [
    { id: 9, title: 'Recommended Movie 1', content_type: 'movie' },
    { id: 10, title: 'Recommended Series 1', content_type: 'series' }
  ];
  
  const mockContinueWatching = [
    { 
      id: 11, 
      content_details: { 
        id: 111, 
        title: 'Continue Watching Movie 1', 
        content_type: 'movie' 
      } 
    },
    { 
      id: 12, 
      content_details: { 
        id: 112, 
        title: 'Continue Watching Series 1', 
        content_type: 'series' 
      } 
    }
  ];
  
  const mockGenres = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Comedy' },
    { id: 3, name: 'Drama' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Caso de prueba: Usuario no autenticado - carga básica
  test('renders correctly for non-authenticated users', async () => {
    // Setup axios mock responses
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.TRENDING) {
        return Promise.resolve({ data: mockTrending });
      } else if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: mockMovies });
      } else if (url === API_ENDPOINTS.SERIES) {
        return Promise.resolve({ data: mockSeries });
      } else if (url === API_ENDPOINTS.DOCUMENTARIES) {
        return Promise.resolve({ data: mockDocumentaries });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: mockGenres });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    // Render with non-authenticated context
    render(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <HomePage />
      </AuthContext.Provider>
    );

    // Wait for data to load
    await waitFor(() => {
      // Check section titles
      expect(screen.getByText('Tendencias')).toBeInTheDocument();
      expect(screen.getByText('Películas')).toBeInTheDocument();
      expect(screen.getByText('Series')).toBeInTheDocument();
      expect(screen.getByText('Documentales')).toBeInTheDocument();
      
      // Verify recommendations and continue watching sections are NOT present
      expect(screen.queryByText('Recomendado para ti')).not.toBeInTheDocument();
      expect(screen.queryByText('Continuar Viendo')).not.toBeInTheDocument();
    });

    // Verify content is displayed
    expect(screen.getByText('Trending Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Drama Series 1')).toBeInTheDocument();
    expect(screen.getByText('Nature Documentary 1')).toBeInTheDocument();
    
    // Verify filter component is rendered
    expect(screen.getByTestId('content-filters')).toBeInTheDocument();
    
    // Verify correct API calls
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.TRENDING);
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.MOVIES);
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.SERIES);
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.DOCUMENTARIES);
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.GENRES);
    expect(axios.get).not.toHaveBeenCalledWith(API_ENDPOINTS.RECOMMENDATIONS);
    expect(axios.get).not.toHaveBeenCalledWith(API_ENDPOINTS.CONTINUE_WATCHING);
  });

  // Caso de prueba: Usuario autenticado - carga completa
  test('renders correctly for authenticated users', async () => {
    // Setup axios mock responses
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.TRENDING) {
        return Promise.resolve({ data: mockTrending });
      } else if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: mockMovies });
      } else if (url === API_ENDPOINTS.SERIES) {
        return Promise.resolve({ data: mockSeries });
      } else if (url === API_ENDPOINTS.DOCUMENTARIES) {
        return Promise.resolve({ data: mockDocumentaries });
      } else if (url === API_ENDPOINTS.RECOMMENDATIONS) {
        return Promise.resolve({ data: mockRecommendations });
      } else if (url === API_ENDPOINTS.CONTINUE_WATCHING) {
        return Promise.resolve({ data: mockContinueWatching });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: mockGenres });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    // Render with authenticated context
    render(
      <AuthContext.Provider value={{ isAuthenticated: true }}>
        <HomePage />
      </AuthContext.Provider>
    );

    // Wait for data to load
    await waitFor(() => {
      // Check all section titles including authenticated-only sections
      expect(screen.getByText('Tendencias')).toBeInTheDocument();
      expect(screen.getByText('Películas')).toBeInTheDocument();
      expect(screen.getByText('Series')).toBeInTheDocument();
      expect(screen.getByText('Documentales')).toBeInTheDocument();
      expect(screen.getByText('Recomendado para ti')).toBeInTheDocument();
      expect(screen.getByText('Continuar Viendo')).toBeInTheDocument();
    });

    // Verify all content is displayed including authenticated-only content
    expect(screen.getByText('Trending Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Recommended Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Continue Watching Movie 1')).toBeInTheDocument();
    
    // Verify API calls for authenticated user
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.RECOMMENDATIONS);
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.CONTINUE_WATCHING);
  });

  // Caso de prueba: Manejo de respuestas de API en formato diferente
  test('handles different API response formats', async () => {
    // Mock API responses with 'results' property
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.TRENDING) {
        return Promise.resolve({ data: { results: mockTrending } });
      } else if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: { results: mockMovies } });
      } else if (url === API_ENDPOINTS.SERIES) {
        return Promise.resolve({ data: { results: mockSeries } });
      } else if (url === API_ENDPOINTS.DOCUMENTARIES) {
        return Promise.resolve({ data: { results: mockDocumentaries } });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: { results: mockGenres } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    render(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <HomePage />
      </AuthContext.Provider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Trending Movie 1')).toBeInTheDocument();
    });
  });

  // Caso de prueba: Manejo de errores de API
  test('handles API errors gracefully', async () => {
    // Mock API errors
    console.error = jest.fn(); // Silenciar errores de consola para la prueba
    
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.TRENDING) {
        return Promise.resolve({ data: mockTrending });
      } else if (url === API_ENDPOINTS.MOVIES) {
        return Promise.reject(new Error('Failed to fetch movies'));
      } else if (url === API_ENDPOINTS.SERIES) {
        return Promise.resolve({ data: mockSeries });
      } else if (url === API_ENDPOINTS.DOCUMENTARIES) {
        return Promise.resolve({ data: mockDocumentaries });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: mockGenres });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    render(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <HomePage />
      </AuthContext.Provider>
    );

    // Wait for data to load
    await waitFor(() => {
      // Trending and other sections should still render
      expect(screen.getByText('Tendencias')).toBeInTheDocument();
      expect(screen.getByText('Series')).toBeInTheDocument();
      
      // Movies section should still be present but without content
      expect(screen.getByText('Películas')).toBeInTheDocument();
    });
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching movies:', 
      expect.any(Error)
    );
  });
  
  // Caso de prueba: Aplicación de filtros
  test('applies filters correctly', async () => {
    // Initial setup for unfiltered content
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.TRENDING) {
        return Promise.resolve({ data: mockTrending });
      } else if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: mockMovies });
      } else if (url === API_ENDPOINTS.SERIES) {
        return Promise.resolve({ data: mockSeries });
      } else if (url === API_ENDPOINTS.DOCUMENTARIES) {
        return Promise.resolve({ data: mockDocumentaries });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: mockGenres });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    render(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <HomePage />
      </AuthContext.Provider>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Trending Movie 1')).toBeInTheDocument();
    });

    // Setup mock responses for filtered content
    const filteredMovies = [{ id: 100, title: 'Filtered Movie', content_type: 'movie' }];
    const filteredSeries = [{ id: 101, title: 'Filtered Series', content_type: 'series' }];
    const filteredDocs = [{ id: 102, title: 'Filtered Documentary', content_type: 'documentary' }];

    axios.get.mockImplementation((url) => {
      if (url.startsWith(API_ENDPOINTS.MOVIES) && url.includes('genres=1') && url.includes('release_year=2022')) {
        return Promise.resolve({ data: filteredMovies });
      } else if (url.startsWith(API_ENDPOINTS.SERIES) && url.includes('genres=1') && url.includes('release_year=2022')) {
        return Promise.resolve({ data: filteredSeries });
      } else if (url.startsWith(API_ENDPOINTS.DOCUMENTARIES) && url.includes('genres=1') && url.includes('release_year=2022')) {
        return Promise.resolve({ data: filteredDocs });
      }
      return Promise.reject(new Error('Unexpected filtered URL'));
    });

    // Apply filters
    await act(async () => {
      userEvent.click(screen.getByTestId('apply-filters-btn'));
    });

    // Wait for filtered data to load
    await waitFor(() => {
      expect(screen.getByText('Filtered Movie')).toBeInTheDocument();
      expect(screen.getByText('Filtered Series')).toBeInTheDocument();
      expect(screen.getByText('Filtered Documentary')).toBeInTheDocument();
    });

    // Verify filter API calls
    expect(axios.get).toHaveBeenCalledWith(`${API_ENDPOINTS.MOVIES}?genres=1&release_year=2022`);
    expect(axios.get).toHaveBeenCalledWith(`${API_ENDPOINTS.SERIES}?genres=1&release_year=2022`);
    expect(axios.get).toHaveBeenCalledWith(`${API_ENDPOINTS.DOCUMENTARIES}?genres=1&release_year=2022`);
  });

  // Caso de prueba: Manejo de respuesta de géneros vacía o invalida
  test('handles invalid genres response format', async () => {
    console.error = jest.fn(); // Silenciar errores de consola para la prueba
    
    // Mock API with invalid genres format
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.TRENDING) {
        return Promise.resolve({ data: mockTrending });
      } else if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: mockMovies });
      } else if (url === API_ENDPOINTS.SERIES) {
        return Promise.resolve({ data: mockSeries });
      } else if (url === API_ENDPOINTS.DOCUMENTARIES) {
        return Promise.resolve({ data: mockDocumentaries });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: { invalid_format: true } }); // Invalid format
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    render(
      <AuthContext.Provider value={{ isAuthenticated: false }}>
        <HomePage />
      </AuthContext.Provider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Trending Movie 1')).toBeInTheDocument();
    });
    
    // Verify error was logged for genres
    expect(console.error).toHaveBeenCalledWith(
      'Formato de respuesta inesperado para géneros:',
      expect.anything()
    );
  });
});