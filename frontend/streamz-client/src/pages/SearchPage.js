import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Box, Grid, CircularProgress } from '@mui/material';
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

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_ENDPOINTS.CONTENT}?search=${encodeURIComponent(searchQuery)}`);
        setResults(response.data.results || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error searching content:', error);
        setLoading(false);
      }
    };
    
    if (searchQuery) {
      fetchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [searchQuery]);
  
  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Resultados para: "{searchQuery}"
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: '#e50914' }} />
        </Box>
      ) : results.length > 0 ? (
        <Grid container spacing={3} mt={2}>
          {results.map(item => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <ContentCard content={item} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box py={8} textAlign="center">
          <Typography variant="h6">
            No se encontraron resultados para "{searchQuery}"
          </Typography>
          <Typography variant="body1" color="textSecondary" mt={2}>
            Intenta con otros términos o explora nuestras categorías.
          </Typography>
        </Box>
      )}
    </PageContainer>
  );
};

export default SearchPage;