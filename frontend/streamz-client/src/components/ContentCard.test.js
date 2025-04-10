// ContentCard.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentCard from './ContentCard';
import { useNavigate } from 'react-router-dom';

const mockNavigate = jest.fn();

// Mock virtual de react-router-dom
jest.mock('react-router-dom', () => {
  return {
    useNavigate: jest.fn(() => mockNavigate)
  };
}, {virtual: true});



describe('ContentCard Component', () => {
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  // Caso de prueba positivo: Película
  test('renders movie content correctly', () => {
    const movieContent = {
      id: 1,
      title: 'Inception',
      thumbnail: '/inception.jpg',
      release_year: 2010,
      content_type: 'movie'
    };

    render(<ContentCard content={movieContent} />);
    
    // Verificar título
    expect(screen.getByText('Inception')).toBeInTheDocument();
    
    // Verificar año y tipo
    expect(screen.getByText('2010 • Película')).toBeInTheDocument();
    
    // Verificar imagen
    const image = screen.getByAltText('Inception');
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('/inception.jpg');
  });

  // Caso de prueba positivo: Serie
  test('renders series content correctly', () => {
    const seriesContent = {
      id: 2,
      title: 'Breaking Bad',
      thumbnail: '/breaking-bad.jpg',
      release_year: 2008,
      content_type: 'series'
    };

    render(<ContentCard content={seriesContent} />);
    
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('2008 • Serie')).toBeInTheDocument();
  });

  // Caso de prueba positivo: Documental
  test('renders documentary content correctly', () => {
    const documentaryContent = {
      id: 3,
      title: 'Planet Earth',
      thumbnail: '/planet-earth.jpg',
      release_year: 2006,
      content_type: 'documentary'
    };

    render(<ContentCard content={documentaryContent} />);
    
    expect(screen.getByText('Planet Earth')).toBeInTheDocument();
    expect(screen.getByText('2006 • Documental')).toBeInTheDocument();
  });

  // Caso de prueba negativo: Sin thumbnail
  test('uses placeholder image when thumbnail is not provided', () => {
    const contentWithoutThumbnail = {
      id: 4,
      title: 'No Image Movie',
      release_year: 2022,
      content_type: 'movie'
    };

    render(<ContentCard content={contentWithoutThumbnail} />);
    
    const image = screen.getByAltText('No Image Movie');
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('/placeholder.png');
  });

  // Prueba de interacción
  test('navigates to content detail page when clicked', () => {
    const movieContent = {
      id: 5,
      title: 'The Matrix',
      thumbnail: '/matrix.jpg',
      release_year: 1999,
      content_type: 'movie'
    };

    render(<ContentCard content={movieContent} />);
    
    // Simular clic en la tarjeta
    userEvent.click(screen.getByText('The Matrix'));
    
    // Verificar que se llamó a navigate con la ruta correcta
    expect(mockNavigate).toHaveBeenCalledWith('/content/5');
  });

  // Prueba de caso extremo: Título largo
  test('handles long titles without breaking layout', () => {
    const contentWithLongTitle = {
      id: 6,
      title: 'The Incredibly Long Title That Should Be Truncated In The UI Component For Better Display',
      thumbnail: '/long-title.jpg',
      release_year: 2020,
      content_type: 'movie'
    };

    render(<ContentCard content={contentWithLongTitle} />);
    
    // Verificamos que el título está presente (aunque puede estar truncado visualmente por el noWrap)
    expect(screen.getByText('The Incredibly Long Title That Should Be Truncated In The UI Component For Better Display')).toBeInTheDocument();
  });
});