// RegisterPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import RegisterPage from './RegisterPage';
import AuthContext from '../context/AuthContext';
import { API_ENDPOINTS } from '../api/config';

// Mocks
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock navigate function
const mockNavigate = jest.fn();

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
      <BrowserRouter>
        <AuthContext.Provider value={{ register: registerMock }}>
          <RegisterPage />
        </AuthContext.Provider>
      </BrowserRouter>
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
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan de suscripción *')).toBeInTheDocument();
    
    // Verificar que se cargaron los planes
    expect(axios.get).toHaveBeenCalledWith(API_ENDPOINTS.PLANS);
    
    // Seleccionar un plan
    fireEvent.mouseDown(screen.getByLabelText('Plan de suscripción *'));
    
    // Esperar a que se muestren las opciones
    await waitFor(() => {
      expect(screen.getByText('Básico - $8.99/mes (HD)')).toBeInTheDocument();
      expect(screen.getByText('Estándar - $12.99/mes (Full HD)')).toBeInTheDocument();
      expect(screen.getByText('Premium - $15.99/mes (4K UHD)')).toBeInTheDocument();
    });
  });

  // Caso de prueba: Validación de campos obligatorios
  test('shows error when required fields are empty', async () => {
    renderWithContext();
    
    // Submit form sin llenar campos
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    // Verificar mensaje de error
    expect(screen.getByText('Por favor, complete todos los campos obligatorios')).toBeInTheDocument();
    
    // Verificar que no se llamó a register
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // Caso de prueba: Validación de coincidencia de contraseñas
  test('shows error when passwords do not match', async () => {
    renderWithContext();
    
    // Llenar campos
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'differentpassword');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
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
    
    // Llenar campos obligatorios
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'password123');
    
    // Seleccionar plan
    fireEvent.mouseDown(screen.getByLabelText('Plan de suscripción *'));
    await waitFor(() => screen.getByText('Básico - $8.99/mes (HD)'));
    fireEvent.click(screen.getByText('Básico - $8.99/mes (HD)'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    // Verificar que se llamó a register con los datos correctos
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        password2: 'password123',
        first_name: '',
        last_name: '',
        plan: 1
      });
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
    
    // Llenar campos obligatorios
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'existinguser');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'password123');
    
    // Seleccionar plan
    fireEvent.mouseDown(screen.getByLabelText('Plan de suscripción *'));
    await waitFor(() => screen.getByText('Básico - $8.99/mes (HD)'));
    fireEvent.click(screen.getByText('Básico - $8.99/mes (HD)'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
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
    
    // Llenar campos obligatorios
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'newuser');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'existing@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'password123');
    
    // Seleccionar plan
    fireEvent.mouseDown(screen.getByLabelText('Plan de suscripción *'));
    await waitFor(() => screen.getByText('Básico - $8.99/mes (HD)'));
    fireEvent.click(screen.getByText('Básico - $8.99/mes (HD)'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
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
    
    // Seleccionar un plan
    fireEvent.mouseDown(screen.getByLabelText('Plan de suscripción *'));
    
    // Verificar que se muestran los planes
    await waitFor(() => {
      expect(screen.getByText('Básico - $8.99/mes (HD)')).toBeInTheDocument();
    });
  });

  // Caso de prueba: Manejo de planes no válidos
  test('handles invalid plans data', async () => {
    // Mock de respuesta con formato inválido (no array)
    axios.get.mockResolvedValueOnce({ data: { invalid: 'format' } });
    
    renderWithContext();
    
    // Seleccionar un plan
    fireEvent.mouseDown(screen.getByLabelText('Plan de suscripción *'));
    
    // No debería haber opciones disponibles (excepto el placeholder)
    await waitFor(() => {
      expect(screen.queryByText('Básico - $8.99/mes (HD)')).not.toBeInTheDocument();
    });
  });

  // Caso de prueba: Cambio en campos de formulario
  test('updates form fields correctly on user input', async () => {
    renderWithContext();
    
    // Llenar todos los campos
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Nombre'), 'Test');
    await userEvent.type(screen.getByLabelText('Apellido'), 'User');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'password123');
    
    // Verificar valores
    expect(screen.getByLabelText('Nombre de usuario')).toHaveValue('testuser');
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Nombre')).toHaveValue('Test');
    expect(screen.getByLabelText('Apellido')).toHaveValue('User');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('password123');
    expect(screen.getByLabelText('Confirmar contraseña')).toHaveValue('password123');
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
    
    // Llenar campos obligatorios
    await userEvent.type(screen.getByLabelText('Nombre de usuario'), 'testuser');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'password123');
    
    // Seleccionar plan
    fireEvent.mouseDown(screen.getByLabelText('Plan de suscripción *'));
    await waitFor(() => screen.getByText('Básico - $8.99/mes (HD)'));
    fireEvent.click(screen.getByText('Básico - $8.99/mes (HD)'));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));
    
    // Verificar mensaje de error genérico
    await waitFor(() => {
      expect(screen.getByText('Error en el registro')).toBeInTheDocument();
    });
  });
});