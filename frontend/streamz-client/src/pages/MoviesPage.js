import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/config';
import ContentCard from '../components/ContentCard';
import ContentFilters from '../components/ContentFilters';
import styled from 'styled-components';

const PageContainer = styled(Container)`
  padding-top: 40px;
  padding-bottom: 40px;
  min-height: 100vh;
  background-color: #111;
  color: white;
`;


const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    year: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    genre: '',
    year: ''
  });
  
  
  // Cargar géneros
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GENRES);
        
        // Si la respuesta incluye 'results', usar esa propiedad
        if (response.data && Array.isArray(response.data.results)) {
          setGenres(response.data.results);
        } 
        // Si la respuesta es directamente un array
        else if (Array.isArray(response.data)) {
          setGenres(response.data);
        } 
        // En cualquier otro caso, establecer un array vacío
        else {
          console.error('Formato de respuesta inesperado para géneros:', response.data);
          setGenres([]);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        setGenres([]);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Cargar películas con filtros
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      
      try {
        // Construir URL con parámetros de filtro
        let url = API_ENDPOINTS.MOVIES;
        const queryParams = [];
        
        if (appliedFilters.genre) {
          queryParams.push(`genres=${appliedFilters.genre}`);
        }
        
        if (appliedFilters.year) {
          queryParams.push(`release_year=${appliedFilters.year}`);
        }
        
        // Añadir parámetros a la URL
        if (queryParams.length > 0) {
          url = `${url}?${queryParams.join('&')}`;
        }
        
        const response = await axios.get(url);
        
        setMovies(response.data.results || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setLoading(false);
        setMovies([]);
      }
    };
    
    fetchMovies();
  }, [appliedFilters]);
  
  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };
  
  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>Películas</Typography>
      
      <ContentFilters 
        filters={filters} 
        setFilters={setFilters} 
        genres={genres} 
        onApplyFilters={handleApplyFilters}
      />
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#e50914' }} />
        </Box>
      ) : movies.length > 0 ? (
        <Grid container spacing={3}>
          {movies.map(movie => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
              <ContentCard content={movie} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>No se encontraron películas con los filtros seleccionados.</Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default MoviesPage;