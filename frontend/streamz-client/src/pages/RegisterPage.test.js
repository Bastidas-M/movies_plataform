// RegisterPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import RegisterPage from './RegisterPage';
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

// Mock register function
const mockRegister = jest.fn();

describe('RegisterPage Component', () => {
  // Mock data
  const mockPlans = [
    { id: 1, name: 'Básico', price: 8.99, video_quality: 'HD' },
    { id: 2, name: 'Estándar', price: 12.99, video_quality: 'Full HD' },
    { id: 3, name: 'Premium', price: 15.99, video_quality: '4K UHD' }
  ];

  // Helper para renderizar con contexto
  const renderWithContext = (registerMock = mockRegister) => {
    return render(
      <AuthContext.Provider value={{ register: registerMock }}>
        <RegisterPage />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock de la respuesta de planes por defecto
    axios.get.mockResolvedValue({ data: mockPlans });
  });

  // Caso de prueba: Renderizado básico y carga de planes
  test('renders register form and loads subscription plans', async () => {
    renderWithContext();
    
    // Verificar elementos del formulario
    expect(screen.getByText('Regístrate')).toBeInTheDocument();
    
    // Verificar que se cargaron los planes
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.PLANS);
  });

  // Caso de prueba: Validación de campos obligatorios
  test('shows error when required fields are empty', async () => {
    renderWithContext();
    
    // Submit form sin llenar campos
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    // Verificar mensaje de error
    expect(screen.getByText('Por favor, complete todos los campos obligatorios')).toBeInTheDocument();
    
    // Verificar que no se llamó a register
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // Caso de prueba: Validación de coincidencia de contraseñas
  test('shows error when passwords do not match', async () => {
    renderWithContext();
    
    // Llenar campos usando name attribute
    const inputs = screen.getAllByRole('textbox');
    const usernameInput = inputs.find(input => input.getAttribute('name') === 'username') || 
                         screen.getByRole('textbox', { name: /nombre de usuario/i });
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email') || 
                      screen.getByRole('textbox', { name: /correo electrónico/i });
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Para los campos de contraseña, usar querySelectorAll
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await userEvent.type(passwordInputs[0], 'password123');
      await userEvent.type(passwordInputs[1], 'differentpassword');
    }
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    // Verificar mensaje de error
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    
    // Verificar que no se llamó a register
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // Caso de prueba: Registro exitoso
  test('navigates to home on successful registration', async () => {
    // Mock de registro exitoso
    mockRegister.mockResolvedValueOnce({ success: true });
    
    renderWithContext();
    
    // Llenar campos (usando selectores más robustos)
    const inputs = screen.getAllByRole('textbox');
    const usernameInput = inputs.find(input => input.getAttribute('name') === 'username') || 
                         screen.getByRole('textbox', { name: /nombre de usuario/i });
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email') || 
                      screen.getByRole('textbox', { name: /correo electrónico/i });
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Para los campos de contraseña, usar querySelectorAll
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await userEvent.type(passwordInputs[0], 'password123');
      await userEvent.type(passwordInputs[1], 'password123');
    }
    
    // Encontrar el select por aria-labelledby o id
    const selectElement = document.querySelector('[aria-labelledby="mui-component-select-plan"]') || 
                          document.getElementById('mui-component-select-plan');
    
    if (selectElement) {
      fireEvent.mouseDown(selectElement);
      
      // Esperar a que las opciones estén disponibles y seleccionar la primera
      await waitFor(() => {
        const option = screen.getByText(/Básico - \$8.99\/mes \(HD\)/i);
        fireEvent.click(option);
      });
    }
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    // Verificar que se llamó a register con los datos correctos
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        password2: 'password123',
        plan: 1
      }));
    });
    
    // Verificar navegación después del registro exitoso
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Caso de prueba: Registro fallido (error de nombre de usuario)
  test('shows username error on failed registration', async () => {
    // Mock de registro fallido con error de username
    mockRegister.mockResolvedValueOnce({ 
      success: false, 
      error: { username: 'El nombre de usuario ya existe' } 
    });
    
    renderWithContext();
    
    // Llenar campos (usando selectores más robustos)
    const inputs = screen.getAllByRole('textbox');
    const usernameInput = inputs.find(input => input.getAttribute('name') === 'username') || 
                         screen.getByRole('textbox', { name: /nombre de usuario/i });
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email') || 
                      screen.getByRole('textbox', { name: /correo electrónico/i });
    
    await userEvent.type(usernameInput, 'existinguser');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Para los campos de contraseña, usar querySelectorAll
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await userEvent.type(passwordInputs[0], 'password123');
      await userEvent.type(passwordInputs[1], 'password123');
    }
    
    // Encontrar el select por aria-labelledby o id
    const selectElement = document.querySelector('[aria-labelledby="mui-component-select-plan"]') || 
                          document.getElementById('mui-component-select-plan');
    
    if (selectElement) {
      fireEvent.mouseDown(selectElement);
      
      // Esperar a que las opciones estén disponibles y seleccionar la primera
      await waitFor(() => {
        const option = screen.getByText(/Básico - \$8.99\/mes \(HD\)/i);
        fireEvent.click(option);
      });
    }
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    // Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText('El nombre de usuario ya existe')).toBeInTheDocument();
    });
    
    // No debe haber navegación
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Caso de prueba: Registro fallido (error de email)
  test('shows email error on failed registration', async () => {
    // Mock de registro fallido con error de email
    mockRegister.mockResolvedValueOnce({ 
      success: false, 
      error: { email: 'El correo electrónico ya está registrado' } 
    });
    
    renderWithContext();
    
    // Llenar campos (usando selectores más robustos)
    const inputs = screen.getAllByRole('textbox');
    const usernameInput = inputs.find(input => input.getAttribute('name') === 'username') || 
                         screen.getByRole('textbox', { name: /nombre de usuario/i });
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email') || 
                      screen.getByRole('textbox', { name: /correo electrónico/i });
    
    await userEvent.type(usernameInput, 'newuser');
    await userEvent.type(emailInput, 'existing@example.com');
    
    // Para los campos de contraseña, usar querySelectorAll
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await userEvent.type(passwordInputs[0], 'password123');
      await userEvent.type(passwordInputs[1], 'password123');
    }
    
    // Encontrar el select por aria-labelledby o id
    const selectElement = document.querySelector('[aria-labelledby="mui-component-select-plan"]') || 
                          document.getElementById('mui-component-select-plan');
    
    if (selectElement) {
      fireEvent.mouseDown(selectElement);
      
      // Esperar a que las opciones estén disponibles y seleccionar la primera
      await waitFor(() => {
        const option = screen.getByText(/Básico - \$8.99\/mes \(HD\)/i);
        fireEvent.click(option);
      });
    }
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    // Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText('El correo electrónico ya está registrado')).toBeInTheDocument();
    });
  });

  // Caso de prueba: Error en la carga de planes
  test('handles error when loading plans', async () => {
    // Mock de consola para evitar mensajes de error en test
    console.error = jest.fn();
    
    // Mock error de carga de planes
    axios.get.mockRejectedValueOnce(new Error('Failed to load plans'));
    
    renderWithContext();
    
    // A pesar del error en planes, el formulario debería cargarse
    expect(screen.getByText('Regístrate')).toBeInTheDocument();
    
    // Verificar que se registró el error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching plans:', expect.any(Error));
    });
  });

  // Caso de prueba: Diferentes formatos de respuesta de planes
  test('handles different plan response formats', async () => {
    // Probar con respuesta que tiene propiedad 'results'
    axios.get.mockResolvedValueOnce({ data: { results: mockPlans } });
    
    renderWithContext();
    
    // Verificar que el formulario se carga correctamente
    expect(screen.getByText('Regístrate')).toBeInTheDocument();
  });

  // Caso de prueba: Manejo de planes no válidos
  test('handles invalid plans data', async () => {
    // Mock de respuesta con formato inválido (no array)
    axios.get.mockResolvedValueOnce({ data: { invalid: 'format' } });
    
    renderWithContext();
    
    // Verificar que el formulario se carga correctamente
    expect(screen.getByText('Regístrate')).toBeInTheDocument();
  });

  // Caso de prueba: Link a login
  test('login link points to correct route', () => {
    renderWithContext();
    
    const loginLink = screen.getByText('Inicia sesión');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  // Caso de prueba: Error genérico de registro
  test('displays generic error when server returns unknown error format', async () => {
    // Mock de registro fallido con error genérico
    mockRegister.mockResolvedValueOnce({ 
      success: false,
      error: 'Unexpected error format'
    });
    
    renderWithContext();
    
    // Llenar campos (usando selectores más robustos)
    const inputs = screen.getAllByRole('textbox');
    const usernameInput = inputs.find(input => input.getAttribute('name') === 'username') || 
                         screen.getByRole('textbox', { name: /nombre de usuario/i });
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email') || 
                      screen.getByRole('textbox', { name: /correo electrónico/i });
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Para los campos de contraseña, usar querySelectorAll
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await userEvent.type(passwordInputs[0], 'password123');
      await userEvent.type(passwordInputs[1], 'password123');
    }
    
    // Encontrar el select por aria-labelledby o id
    const selectElement = document.querySelector('[aria-labelledby="mui-component-select-plan"]') || 
                          document.getElementById('mui-component-select-plan');
    
    if (selectElement) {
      fireEvent.mouseDown(selectElement);
      
      // Esperar a que las opciones estén disponibles y seleccionar la primera
      await waitFor(() => {
        const option = screen.getByText(/Básico - \$8.99\/mes \(HD\)/i);
        fireEvent.click(option);
      });
    }
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));
    
    // Verificar mensaje de error genérico
    await waitFor(() => {
      expect(screen.getByText('Error en el registro')).toBeInTheDocument();
    });
  });
});