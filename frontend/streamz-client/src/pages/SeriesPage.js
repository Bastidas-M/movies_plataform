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

const SeriesGrid = styled(Grid)`
  margin-top: 24px;
`;

const SeriesPage = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.SERIES);
        setSeries(response.data.results || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching series:', error);
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>Series</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Cargando series...</Typography>
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
          <Typography>No se encontraron series disponibles.</Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default SeriesPage;