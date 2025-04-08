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

const DocumentariesGrid = styled(Grid)`
  margin-top: 24px;
`;

const DocumentariesPage = () => {
  const [documentaries, setDocumentaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentaries = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.DOCUMENTARIES);
        setDocumentaries(response.data.results || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching documentaries:', error);
        setLoading(false);
      }
    };

    fetchDocumentaries();
  }, []);

  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>Documentales</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Cargando documentales...</Typography>
        </Box>
      ) : documentaries.length > 0 ? (
        <DocumentariesGrid container spacing={3}>
          {documentaries.map(documentary => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={documentary.id}>
              <ContentCard content={documentary} />
            </Grid>
          ))}
        </DocumentariesGrid>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>No se encontraron documentales disponibles.</Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default DocumentariesPage;