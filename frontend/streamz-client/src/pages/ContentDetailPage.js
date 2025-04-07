import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Chip, Divider } from '@mui/material';
import { PlayArrow, Add } from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/config';
import AuthContext from '../context/AuthContext';
import styled from 'styled-components';

const HeroSection = styled(Box)`
  position: relative;
  height: 70vh;
  background-size: cover;
  background-position: center;
  margin-bottom: 30px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.9) 100%
    );
  }
`;

const ContentInfo = styled(Box)`
  position: relative;
  z-index: 1;
  padding: 40px;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ActionButton = styled(Button)`
  margin-right: 10px;
  margin-top: 20px;
`;

const EpisodeItem = styled(Box)`
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 10px;
  background-color: #333;
  cursor: pointer;
  
  &:hover {
    background-color: #444;
  }
`;

const ContentDetailPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.CONTENT}${id}/`);
        setContent(response.data);
      } catch (error) {
        console.error('Error fetching content details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handlePlay = (episodeId = null) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (episodeId) {
      navigate(`/player/${id}?episode=${episodeId}`);
    } else {
      navigate(`/player/${id}`);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography>Cargando...</Typography>
        </Box>
      </Container>
    );
  }

  if (!content) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography>Contenido no encontrado</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#111', minHeight: '100vh', color: 'white' }}>
      <HeroSection style={{ backgroundImage: `url(${content.thumbnail})` }}>
        <ContentInfo>
          <Typography variant="h3" gutterBottom>{content.title}</Typography>
          <Typography variant="h6" gutterBottom>
            {content.release_year} • 
            {content.content_type === 'movie' ? ' Película' : 
             content.content_type === 'series' ? ' Serie' : ' Documental'}
          </Typography>
          
          <Box mt={2}>
            {content.genres?.map((genre) => (
              <Chip 
                key={genre.id} 
                label={genre.name} 
                sx={{ mr: 1, mb: 1, backgroundColor: '#333' }} 
              />
            ))}
          </Box>
          
          <Typography variant="body1" paragraph sx={{ maxWidth: '700px' }}>
            {content.description}
          </Typography>
          
          <Box>
            <ActionButton
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => handlePlay()}
              sx={{ backgroundColor: '#e50914' }}
            >
              Reproducir
            </ActionButton>
            
            <ActionButton
              variant="outlined"
              startIcon={<Add />}
            >
              Mi Lista
            </ActionButton>
          </Box>
        </ContentInfo>
      </HeroSection>
      
      <Container maxWidth="xl">
        {content.content_type === 'series' && content.episodes && (
          <Box my={4}>
            <Typography variant="h5" gutterBottom>Episodios</Typography>
            <Divider sx={{ mb: 2, backgroundColor: '#333' }} />
            
            <Grid container spacing={2}>
              {content.episodes.map((episode) => (
                <Grid item xs={12} key={episode.id}>
                  <EpisodeItem onClick={() => handlePlay(episode.id)}>
                    <Typography variant="h6">
                      {episode.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Temporada {episode.season_number}, Episodio {episode.episode_number} • {episode.duration} min
                    </Typography>
                  </EpisodeItem>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ContentDetailPage;