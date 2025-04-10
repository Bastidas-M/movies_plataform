// ContentFilters.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentFilters from './ContentFilters';

describe('ContentFilters Component', () => {
  // Mock props
  const mockGenres = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Comedy' },
    { id: 3, name: 'Drama' }
  ];
  
  const mockFilters = {
    genre: '',
    year: ''
  };
  
  const mockSetFilters = jest.fn();
  const mockOnApplyFilters = jest.fn();

  // Función para renderizar con props por defecto
  const renderComponent = (props = {}) => {
    const defaultProps = {
      filters: mockFilters,
      setFilters: mockSetFilters,
      genres: mockGenres,
      onApplyFilters: mockOnApplyFilters,
      ...props
    };
    
    return render(<ContentFilters {...defaultProps} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Caso de prueba: Renderizado básico
  test('renders all filter components correctly', () => {
    renderComponent();
    
    // Verificar campos de filtro
    expect(screen.getByLabelText('Género')).toBeInTheDocument();
    expect(screen.getByLabelText('Año')).toBeInTheDocument();
    
    // Verificar botones
    expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument();
    expect(screen.getByText('Limpiar Filtros')).toBeInTheDocument();
  });

  // Caso de prueba: Opciones de género renderizadas correctamente
  test('renders genre options correctly', () => {
    renderComponent();
    
    // Abrir el dropdown de géneros
    fireEvent.mouseDown(screen.getByLabelText('Género'));
    
    // Verificar opciones
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Comedy')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
  });

  // Caso de prueba: Cambio en el filtro de género
  test('calls setFilters when genre selection changes', () => {
    renderComponent();
    
    // Abrir el dropdown
    fireEvent.mouseDown(screen.getByLabelText('Género'));
    
    // Seleccionar una opción
    fireEvent.click(screen.getByText('Action'));
    
    // Verificar que se llamó a setFilters con los valores correctos
    expect(mockSetFilters).toHaveBeenCalledWith({
      ...mockFilters,
      genre: 1
    });
  });

  // Caso de prueba: Cambio en el filtro de año
  test('calls setFilters when year input changes', () => {
    renderComponent();
    
    // Cambiar el valor del año
    fireEvent.change(screen.getByLabelText('Año'), {
      target: { value: '2022' }
    });
    
    // Verificar que se llamó a setFilters con los valores correctos
    expect(mockSetFilters).toHaveBeenCalledWith({
      ...mockFilters,
      year: '2022'
    });
  });

  // Caso de prueba: Aplicar filtros
  test('calls onApplyFilters when Apply button is clicked', () => {
    const customFilters = {
      genre: '2',
      year: '2020'
    };
    
    renderComponent({ filters: customFilters });
    
    // Hacer clic en el botón Aplicar
    fireEvent.click(screen.getByText('Aplicar Filtros'));
    
    // Verificar que se llamó a onApplyFilters con los filtros correctos
    expect(mockOnApplyFilters).toHaveBeenCalledWith(customFilters);
  });

  // Caso de prueba: Limpiar filtros
  test('resets filters when Clear button is clicked', () => {
    const customFilters = {
      genre: '2',
      year: '2020'
    };
    
    renderComponent({ filters: customFilters });
    
    // Hacer clic en el botón Limpiar
    fireEvent.click(screen.getByText('Limpiar Filtros'));
    
    // Verificar que se llamó a setFilters con valores vacíos
    expect(mockSetFilters).toHaveBeenCalledWith({
      genre: '',
      year: ''
    });
    
    // Verificar que se aplicaron los filtros vacíos
    expect(mockOnApplyFilters).toHaveBeenCalledWith({
      genre: '',
      year: ''
    });
  });

  // Caso de prueba: Manejo de géneros vacíos
  test('handles empty genres array gracefully', () => {
    renderComponent({ genres: [] });
    
    // Abrir el dropdown de géneros
    fireEvent.mouseDown(screen.getByLabelText('Género'));
    
    // Solo debería mostrar la opción "Todos"
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  // Caso de prueba: Manejo de géneros undefined
  test('handles undefined genres gracefully', () => {
    renderComponent({ genres: undefined });
    
    // Abrir el dropdown de géneros
    fireEvent.mouseDown(screen.getByLabelText('Género'));
    
    // Solo debería mostrar la opción "Todos"
    expect(screen.getByText('Todos')).toBeInTheDocument();
  });

  // Caso de prueba: Validación del campo año
  test('year input has min and max constraints', () => {
    renderComponent();
    
    const yearInput = screen.getByLabelText('Año');
    
    // Verificar atributos min y max
    expect(yearInput).toHaveAttribute('min', '1900');
    expect(yearInput).toHaveAttribute('max', new Date().getFullYear().toString());
  });
});