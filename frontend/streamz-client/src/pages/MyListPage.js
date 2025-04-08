import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/config';
import ContentCard from '../components/ContentCard';
import AuthContext from '../context/AuthContext';
import styled from 'styled-components';

const PageContainer = styled(Container)`
  padding-top: 40px;
  padding-bottom: 40px;
  min-height: 100vh;
  background-color: #111;
  color: white;
`;

const MyListGrid = styled(Grid)`
  margin-top: 24px;
`;

const EmptyStateBox = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  text-align: center;
`;

const MyListPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyList = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Nota: Para esta funcionalidad, necesitarías implementar un endpoint en tu backend
        // que devuelva la lista de favoritos del usuario actual
        const response = await axios.get(`${API_ENDPOINTS.CONTENT}?favorite=true`);
        setMyList(response.data.results || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching my list:', error);
        setLoading(false);
      }
    };

    fetchMyList();
  }, [isAuthenticated]);

  return (
    <PageContainer maxWidth="xl">
      <Typography variant="h4" gutterBottom>Mi Lista</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Cargando tu lista...</Typography>
        </Box>
      ) : myList.length > 0 ? (
        <MyListGrid container spacing={3}>
          {myList.map(content => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={content.id}>
              <ContentCard content={content} />
            </Grid>
          ))}
        </MyListGrid>
      ) : (
        <EmptyStateBox>
          <FavoriteIcon sx={{ fontSize: 64, color: '#e50914', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Tu lista está vacía
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Añade películas y series a tu lista para verlas más tarde.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href="/"
            sx={{ backgroundColor: '#e50914' }}
          >
            Explorar contenido
          </Button>
        </EmptyStateBox>
      )}
    </PageContainer>
  );
};

export default MyListPage;