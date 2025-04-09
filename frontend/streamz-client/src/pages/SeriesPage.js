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

const SeriesGrid = styled(Grid)`
  margin-top: 24px;
`;

const SeriesPage = () => {
  const [series, setSeries] = useState([]);
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

  // Cargar géneros para los filtros (si no los tienes disponibles globalmente)
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GENRES);
        if (response.data && Array.isArray(response.data.results)) {
          setGenres(response.data.results);
        } else if (Array.isArray(response.data)) {
          setGenres(response.data);
        } else {
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

  // Cargar series con filtros aplicados
  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);

      try {
        // Construir la URL con filtros
        let url = API_ENDPOINTS.SERIES;
        const queryParams = [];

        if (appliedFilters.genre) {
          queryParams.push(`genres=${appliedFilters.genre}`);
        }
        if (appliedFilters.year) {
          queryParams.push(`release_year=${appliedFilters.year}`);
        }
        if (queryParams.length > 0) {
          url = `${url}?${queryParams.join('&')}`;
        }


        const response = await axios.get(url);
        setSeries(response.data.results || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching series:', error);
        setSeries([]);
        setLoading(false);
      }
    };

    fetchSeries();
  }, [appliedFilters]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>Series</Typography>
      
      {/* Componente de filtros reutilizable */}
      <ContentFilters 
        filters={filters} 
        setFilters={setFilters} 
        genres={genres} 
        onApplyFilters={handleApplyFilters}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: '#e50914' }} />
        </Box>
      ) : series.length > 0 ? (
        <SeriesGrid container spacing={3}>
          {series.map(show => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={show.id}>
              <ContentCard content={show} />
            </Grid>
          ))}
        </SeriesGrid>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>No se encontraron series con los filtros seleccionados.</Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default SeriesPage;
