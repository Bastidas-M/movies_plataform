// MoviesPage.test.js
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MoviesPage from './MoviesPage';
import { API_ENDPOINTS } from '../api/config';

// Mock navigate function
const mockNavigate = jest.fn();

// Mock virtual de react-router-dom
jest.mock('react-router-dom', () => {
  return {
    BrowserRouter: ({ children }) => children,
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props} data-testid="mock-link">
        {children}
      </a>
    ),
    Routes: ({ children }) => children,
    Route: ({ path, element }) => element,
    Navigate: ({ to }) => <div>Redirecting to {to}</div>,
    Outlet: () => <div>Outlet</div>,
    useParams: () => ({}),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useMatch: () => null,
    useRoutes: () => null,
  };
}, { virtual: true });

// Mocks
jest.mock('axios');
jest.mock('../components/ContentCard', () => {
  return function MockContentCard({ content }) {
    return <div data-testid={`movie-card-${content.id}`}>{content.title}</div>;
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
        <button 
          data-testid="clear-filters-btn" 
          onClick={() => onApplyFilters({ genre: '', year: '' })}
        >
          Clear Filters
        </button>
      </div>
    );
  };
});

describe('MoviesPage Component', () => {
  // Mock data
  const mockMovies = [
    { id: 1, title: 'Action Movie 1', content_type: 'movie' },
    { id: 2, title: 'Comedy Movie 2', content_type: 'movie' },
    { id: 3, title: 'Drama Movie 3', content_type: 'movie' }
  ];
  
  const mockGenres = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Comedy' },
    { id: 3, name: 'Drama' }
  ];
  
  // Helper function to setup axios mocks
  const setupMocks = (movieData = mockMovies, genreData = mockGenres) => {
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: { results: movieData } });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: genreData });
      } else if (url.startsWith(API_ENDPOINTS.MOVIES) && url.includes('genres=1')) {
        // Mock filtered response
        const filteredMovies = [{ id: 1, title: 'Filtered Movie', content_type: 'movie' }];
        return Promise.resolve({ data: { results: filteredMovies } });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });
  
  // Caso de prueba: Carga inicial de películas y géneros
  test('loads and displays movies correctly', async () => {
    render(<MoviesPage />);
    
    // Inicialmente debería mostrar un indicador de carga
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Después de cargar, debería mostrar las películas
    await waitFor(() => {
      expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Comedy Movie 2')).toBeInTheDocument();
      expect(screen.getByText('Drama Movie 3')).toBeInTheDocument();
    });
    
    // Verificar que se llamó a los endpoints correctos
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.MOVIES);
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.GENRES);
  });
  
  // Caso de prueba: Aplicación de filtros
  test('applies filters correctly', async () => {
    render(<MoviesPage />);
    
    // Esperar a que carguen las películas iniciales
    await waitFor(() => {
      expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
    });
    
    // Simular aplicación de filtros
    await act(async () => {
      userEvent.click(screen.getByTestId('apply-filters-btn'));
    });
    
    // Verificar que se llamó a la API con los filtros correctos
    expect(axios.get).toHaveBeenCalledWith(`${API_ENDPOINTS.MOVIES}?genres=1&release_year=2022`);
    
    // Después de filtrar, debería mostrar las películas filtradas
    await waitFor(() => {
      expect(screen.getByText('Filtered Movie')).toBeInTheDocument();
      expect(screen.queryByText('Comedy Movie 2')).not.toBeInTheDocument();
    });
  });
  
  // Caso de prueba: Manejo de respuesta de películas vacía
  test('handles empty movies response', async () => {
    // Configurar mock para devolver lista vacía
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: { results: [] } });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: mockGenres });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    render(<MoviesPage />);
    
    // Después de cargar, debería mostrar mensaje de no resultados
    await waitFor(() => {
      expect(screen.getByText('No se encontraron películas con los filtros seleccionados.')).toBeInTheDocument();
    });
  });
  
  // Caso de prueba: Manejo de error en carga de películas
  test('handles error when loading movies', async () => {
    // Mock de consola para evitar mensajes de error en test
    console.error = jest.fn();
    
    // Configurar mock para simular error
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.MOVIES) {
        return Promise.reject(new Error('Failed to fetch movies'));
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: mockGenres });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    render(<MoviesPage />);
    
    // Después de error, debería mostrar mensaje de no resultados
    await waitFor(() => {
      expect(screen.getByText('No se encontraron películas con los filtros seleccionados.')).toBeInTheDocument();
    });
    
    // Verificar que se registró el error
    expect(console.error).toHaveBeenCalledWith('Error fetching movies:', expect.any(Error));
  });
  
  // Caso de prueba: Manejo de diferentes formatos de respuesta en géneros
  test('handles different genre response formats', async () => {
    // Probar con respuesta que tiene propiedad 'results'
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: { results: mockMovies } });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: { results: mockGenres } });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    render(<MoviesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
    });
    
    // Limpiar mocks
    jest.clearAllMocks();
    
    // Probar con respuesta que es directamente un array
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: { results: mockMovies } });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: mockGenres }); // Sin 'results'
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    render(<MoviesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
    });
  });
  
  // Caso de prueba: Manejo de errores en carga de géneros
  test('handles error when loading genres', async () => {
    // Mock de consola para evitar mensajes de error en test
    console.error = jest.fn();
    
    // Configurar mock para simular error en géneros
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: { results: mockMovies } });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.reject(new Error('Failed to fetch genres'));
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    render(<MoviesPage />);
    
    // A pesar del error en géneros, las películas deberían cargarse
    await waitFor(() => {
      expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
    });
    
    // Verificar que se registró el error
    expect(console.error).toHaveBeenCalledWith('Error fetching genres:', expect.any(Error));
  });
  
  // Caso de prueba: Manejo de formato inesperado en géneros
  test('handles unexpected genre response format', async () => {
    // Mock de consola para evitar mensajes de error en test
    console.error = jest.fn();
    
    // Configurar mock para simular formato inesperado
    axios.get.mockImplementation((url) => {
      if (url === API_ENDPOINTS.MOVIES) {
        return Promise.resolve({ data: { results: mockMovies } });
      } else if (url === API_ENDPOINTS.GENRES) {
        return Promise.resolve({ data: { unexpected: 'format' } }); // Formato inesperado
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
    
    render(<MoviesPage />);
    
    // Las películas deberían cargarse a pesar del formato inesperado
    await waitFor(() => {
      expect(screen.getByText('Action Movie 1')).toBeInTheDocument();
    });
    
    // Verificar que se registró el error
    expect(console.error).toHaveBeenCalledWith(
      'Formato de respuesta inesperado para géneros:', 
      expect.anything()
    );
  });
});