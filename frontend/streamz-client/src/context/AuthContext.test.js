import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from './AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/config';

// Mock de axios
jest.mock('axios');

// Componente de prueba para acceder al contexto
const TestComponent = () => {
  const { currentUser, login, logout, isAuthenticated } = React.useContext(AuthContext);
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-info">{currentUser ? JSON.stringify(currentUser) : 'no-user'}</div>
      <button onClick={() => login('testuser', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Componente de prueba para acceder a register
const RegisterTestComponent = () => {
  const { register, isAuthenticated, currentUser } = React.useContext(AuthContext);
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-info">{currentUser ? JSON.stringify(currentUser) : 'no-user'}</div>
      <button onClick={() => register({username: 'newuser', email: 'new@example.com', password: 'password123'})}>
        Register
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Limpiar localStorage y mocks de axios antes de cada prueba
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('should start with no authentication', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
  });

  test('should authenticate user on successful login', async () => {
    // Mock de respuesta exitosa para axios.post
    const mockUser = { id: 1, username: 'testuser' };
    const mockToken = 'test-token-123';
    
    axios.post.mockResolvedValueOnce({
      data: { token: mockToken, user: mockUser }
    });
    
    // Mock de obtención de perfil tras login
    axios.get.mockResolvedValueOnce({
      data: mockUser
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Hacer clic en el botón de login
    await act(async () => {
      userEvent.click(screen.getByText('Login'));
    });
    
    // Verificar que se llamó a la API correcta
    expect(axios.post).toHaveBeenCalledWith(API_ENDPOINTS.LOGIN, {
      username: 'testuser',
      password: 'password123'
    });
    
    // Verificar que el estado de autenticación y el usuario se actualizaron
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-info')).toContain(mockUser.username);
    });
    
    // Verificar que el token se guardó en localStorage
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  test('should handle login failure', async () => {
    // Mock de respuesta fallida
    const errorMessage = 'Invalid credentials';
    axios.post.mockRejectedValueOnce({
      response: { data: errorMessage }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Hacer clic en el botón de login
    await act(async () => {
      userEvent.click(screen.getByText('Login'));
    });
    
    // Verificar que el estado sigue siendo no autenticado
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('should log out user correctly', async () => {
    // Simular usuario ya autenticado
    localStorage.setItem('token', 'test-token-123');
    
    const mockUser = { id: 1, username: 'testuser' };
    axios.get.mockResolvedValueOnce({
      data: mockUser
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Esperar a que se cargue el perfil
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });
    
    // Hacer clic en el botón de logout
    await act(async () => {
      userEvent.click(screen.getByText('Logout'));
    });
    
    // Verificar que el estado cambió a no autenticado
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.getItem('token')).toBeNull();
  });

  // NUEVAS PRUEBAS PARA AUMENTAR COBERTURA

  test('should register user successfully', async () => {
    // Mock de respuesta exitosa para axios.post
    const mockUser = { id: 2, username: 'newuser', email: 'new@example.com' };
    const mockToken = 'register-token-123';
    
    axios.post.mockResolvedValueOnce({
      data: { token: mockToken, user: mockUser }
    });
    
    render(
      <AuthProvider>
        <RegisterTestComponent />
      </AuthProvider>
    );
    
    // Hacer clic en el botón de registro
    await act(async () => {
      userEvent.click(screen.getByText('Register'));
    });
    
    // Verificar que se llamó a la API correcta
    expect(axios.post).toHaveBeenCalledWith(API_ENDPOINTS.REGISTER, {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123'
    });
    
    // Verificar que el estado de autenticación y el usuario se actualizaron
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-info')).toContain(mockUser.username);
    });
    
    // Verificar que el token se guardó en localStorage
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  test('should handle registration failure', async () => {
    // Mock de respuesta fallida
    const errorMessage = 'Username already exists';
    axios.post.mockRejectedValueOnce({
      response: { data: errorMessage }
    });

    render(
      <AuthProvider>
        <RegisterTestComponent />
      </AuthProvider>
    );
    
    // Hacer clic en el botón de registro
    await act(async () => {
      userEvent.click(screen.getByText('Register'));
    });
    
    // Verificar que el estado sigue siendo no autenticado
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('should handle error when fetching user profile', async () => {
    // Simular token existente
    localStorage.setItem('token', 'test-token-123');
    
    // Mock de error al obtener el perfil
    axios.get.mockRejectedValueOnce({
      response: { status: 401, data: 'Unauthorized' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Esperar a que se procese el error y se realice el logout automático
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  test('should handle initialization with invalid token format', async () => {
    // Simular token con formato inválido
    localStorage.setItem('token', 'invalid-token');
    
    // Mock de error al obtener el perfil con este token
    axios.get.mockRejectedValueOnce({
      response: { status: 401, data: 'Invalid token format' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verificar que eventualmente se realiza logout
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    });
  });

  test('should handle login with network error (no response object)', async () => {
    // Mock de error de red sin objeto response
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Hacer clic en el botón de login
    await act(async () => {
      userEvent.click(screen.getByText('Login'));
    });
    
    // Verificar que el estado sigue siendo no autenticado
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
  });

  test('should handle registration with network error (no response object)', async () => {
    // Mock de error de red sin objeto response
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <AuthProvider>
        <RegisterTestComponent />
      </AuthProvider>
    );
    
    // Hacer clic en el botón de registro
    await act(async () => {
      userEvent.click(screen.getByText('Register'));
    });
    
    // Verificar que el estado sigue siendo no autenticado
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
  });

  test('should initialize with existing token and verify authentication', async () => {
    // Simular token existente
    const mockToken = 'existing-token-456';
    localStorage.setItem('token', mockToken);
    
    const mockUser = { id: 3, username: 'existinguser' };
    
    // Mock de obtención de perfil exitosa
    axios.get.mockResolvedValueOnce({
      data: mockUser
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verificar que se configura la autenticación correctamente
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('user-info')).toContain(mockUser.username);
    });
    
    // Verificar que se llamó a axios.get con la URL correcta
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.PROFILE);
    
    // Verificar que se configuró el header de autorización correctamente
    expect(axios.defaults.headers.common['Authorization']).toBe(`Token ${mockToken}`);
  });
});