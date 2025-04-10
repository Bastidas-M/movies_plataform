// MyListPage.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import MyListPage from './MyListPage';
import AuthContext from '../context/AuthContext';
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
    return <div data-testid={`content-card-${content.id}`}>{content.title}</div>;
  };
});

describe('MyListPage Component', () => {
  // Mock data
  const mockMyList = [
    { id: 1, title: 'Favorite Movie 1', content_type: 'movie' },
    { id: 2, title: 'Favorite Series 1', content_type: 'series' },
    { id: 3, title: 'Favorite Documentary 1', content_type: 'documentary' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to render with context
  const renderWithAuth = (isAuth) => {
    return render(
      <AuthContext.Provider value={{ isAuthenticated: isAuth }}>
        <MyListPage />
      </AuthContext.Provider>
    );
  };

  // Caso de prueba: Usuario no autenticado
  test('does not fetch data when user is not authenticated', async () => {
    renderWithAuth(false);
    
    // Should still show the page title
    expect(screen.getByText('Mi Lista')).toBeInTheDocument();
    
    // API should not be called
    expect(axios.get).not.toHaveBeenCalled();
  });

  // Caso de prueba: Usuario autenticado con lista de favoritos
  test('renders user favorites when authenticated and has items', async () => {
    // Mock successful API response
    axios.get.mockResolvedValueOnce({ data: mockMyList });
    
    renderWithAuth(true);
    
    // Initially should show loading state
    expect(screen.getByText('Cargando tu lista...')).toBeInTheDocument();
    
    // After loading, should show content
    await waitFor(() => {
      expect(screen.getByText('Favorite Movie 1')).toBeInTheDocument();
      expect(screen.getByText('Favorite Series 1')).toBeInTheDocument();
      expect(screen.getByText('Favorite Documentary 1')).toBeInTheDocument();
    });
    
    // Verify API was called with correct parameters
    expect(axios.get).toHaveBeenCalledWith(`${API_ENDPOINTS.CONTENT}?favorite=true`);
  });

  // Caso de prueba: Usuario autenticado con lista vacía
  test('renders empty state when authenticated but has no favorites', async () => {
    // Mock empty response
    axios.get.mockResolvedValueOnce({ data: [] });
    
    renderWithAuth(true);
    
    // After loading, should show empty state
    await waitFor(() => {
      expect(screen.getByText('Tu lista está vacía')).toBeInTheDocument();
      expect(screen.getByText('Añade películas y series a tu lista para verlas más tarde.')).toBeInTheDocument();
      expect(screen.getByText('Explorar contenido')).toBeInTheDocument();
    });
  });

  // Caso de prueba: Manejo de respuesta API en formato diferente (con property results)
  test('handles API response with results property', async () => {
    // Mock response with 'results' property
    axios.get.mockResolvedValueOnce({ 
      data: { 
        results: mockMyList 
      } 
    });
    
    renderWithAuth(true);
    
    // After loading, should show content
    await waitFor(() => {
      expect(screen.getByText('Favorite Movie 1')).toBeInTheDocument();
    });
  });

  // Caso de prueba: Manejo de error en la API
  test('handles API error gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Silenciar errores de consola para la prueba
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch favorites'));
    
    renderWithAuth(true);
    
    // After error, should show empty state
    await waitFor(() => {
      expect(screen.getByText('Tu lista está vacía')).toBeInTheDocument();
    });
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching my list:', 
      expect.any(Error)
    );
  });
});