// LoginPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import AuthContext from '../context/AuthContext';

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock navigate function
const mockNavigate = jest.fn();

// Mock login function
const mockLogin = jest.fn();

describe('LoginPage Component', () => {
  // Helper para renderizar con contexto
  const renderWithContext = (loginMock = mockLogin) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ login: loginMock }}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Caso de prueba: Renderizado básico
  test('renders login form correctly', () => {
    renderWithContext();
    
    // Verificar elementos del formulario
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByText('¿No tienes una cuenta?')).toBeInTheDocument();
    expect(screen.getByText('Regístrate')).toBeInTheDocument();
  });

  // Caso de prueba: Validación de campos
  test('shows error when submitting empty form', async () => {
    renderWithContext();
    
    // Submit form without filling fields
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    
    // Check error message
    expect(screen.getByText('Por favor, complete todos los campos')).toBeInTheDocument();
    
    // Verify login wasn't called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  // Caso de prueba: Validación parcial
  test('shows error when username is filled but password is empty', async () => {
    renderWithContext();
    
    // Fill only username
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    
    // Check error message
    expect(screen.getByText('Por favor, complete todos los campos')).toBeInTheDocument();
    
    // Verify login wasn't called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  // Caso de prueba: Validación parcial inversa
  test('shows error when password is filled but username is empty', async () => {
    renderWithContext();
    
    // Fill only password
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    
    // Check error message
    expect(screen.getByText('Por favor, complete todos los campos')).toBeInTheDocument();
    
    // Verify login wasn't called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  // Caso de prueba: Login exitoso
  test('navigates to home on successful login', async () => {
    // Mock successful login
    mockLogin.mockResolvedValueOnce({ success: true });
    
    renderWithContext();
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    
    // Verify login was called with correct params
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    
    // Verify navigation after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // Caso de prueba: Login fallido (error general)
  test('shows error message on failed login', async () => {
    // Mock failed login
    mockLogin.mockResolvedValueOnce({ 
      success: false, 
      error: { non_field_errors: ['Credenciales incorrectas'] } 
    });
    
    renderWithContext();
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'wronguser');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'wrongpass');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Credenciales incorrectas')).toBeInTheDocument();
    });
    
    // Navigation should not be called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Caso de prueba: Login fallido (formato de error alternativo)
  test('shows generic error message when error format is unexpected', async () => {
    // Mock failed login with different error format
    mockLogin.mockResolvedValueOnce({ 
      success: false, 
      error: 'Server error' // No es el formato esperado
    });
    
    renderWithContext();
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    
    // Verify generic error message
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });

  // Caso de prueba: Cambio en campos de formulario
  test('updates form fields correctly on user input', async () => {
    renderWithContext();
    
    // Get input elements
    const usernameInput = screen.getByLabelText('Nombre de usuario');
    const passwordInput = screen.getByLabelText('Contraseña');
    
    // Type in username field
    await userEvent.type(usernameInput, 'testuser');
    expect(usernameInput).toHaveValue('testuser');
    
    // Type in password field
    await userEvent.type(passwordInput, 'password123');
    expect(passwordInput).toHaveValue('password123');
  });

  // Caso de prueba: Link de registro
  test('register link points to correct route', () => {
    renderWithContext();
    
    const registerLink = screen.getByText('Regístrate');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  // Caso de prueba: Manejo de errores del servidor
  test('handles network errors during login', async () => {
    // Mock login with rejected promise (network error)
    const mockLoginError = jest.fn().mockRejectedValueOnce(new Error('Network error'));
    
    renderWithContext(mockLoginError);
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    
    // Submit form - this should not throw an unhandled promise rejection
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    
    // No assertion here - we're just making sure the component doesn't crash
    // If the test completes, it means the component handled the error
  });
});