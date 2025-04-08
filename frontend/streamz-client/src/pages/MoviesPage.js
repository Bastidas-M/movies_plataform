import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/config';
import ContentCard from '../components/ContentCard';
import styled from 'styled-components';

const PageContainer = styled(Container)`
  padding-top: 40px;
  padding-bottom: 40px;
  min-height: 100vh;
  background-color: #111;
  color: white;
`;

const MoviesGrid = styled(Grid)`
  margin-top: 24px;
`;

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.MOVIES);
        setMovies(response.data.results || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>Películas</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Cargando películas...</Typography>
        </Box>
      ) : movies.length > 0 ? (
        <MoviesGrid container spacing={3}>
          {movies.map(movie => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
              <ContentCard content={movie} />
            </Grid>
          ))}
        </MoviesGrid>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>No se encontraron películas disponibles.</Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default MoviesPage;