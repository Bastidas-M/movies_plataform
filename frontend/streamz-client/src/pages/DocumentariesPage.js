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

const DocumentariesPage = () => {
  const [documentaries, setDocumentaries] = useState([]);
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
 
  // Cargar géneros (si aún no lo tienes cargado globalmente)
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GENRES);
        // Se valida el formato de la respuesta, similar a MoviesPage
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

  // Cargar documentales con filtros
  useEffect(() => {
    const fetchDocumentaries = async () => {
      setLoading(true);
      
      try {
        // Construir URL con parámetros de filtro
        let url = API_ENDPOINTS.DOCUMENTARIES;
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
  
        setDocumentaries(response.data.results || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching documentaries:', error);
        setDocumentaries([]);
        setLoading(false);
      }
    };

    fetchDocumentaries();
  }, [appliedFilters]);

  const handleApplyFilters = (newFilters) => {
    // Actualiza los filtros que se aplicarán en la consulta
    setAppliedFilters(newFilters);
  };

  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>Documentales</Typography>

      {/* Componente para seleccionar filtros */}
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
      ) : documentaries.length > 0 ? (
        <Grid container spacing={3}>
          {documentaries.map(doc => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <ContentCard content={doc} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>No se encontraron documentales con los filtros seleccionados.</Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default DocumentariesPage;
