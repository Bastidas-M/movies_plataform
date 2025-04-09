import React, { useEffect, useState, useContext, useCallback  } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Grid } from '@mui/material';
import { API_ENDPOINTS } from '../api/config';
import ContentCard from '../components/ContentCard';
import AuthContext from '../context/AuthContext';
import styled from 'styled-components';
import ContentFilters from '../components/ContentFilters';

const Section = styled(Box)`
  margin-bottom: 30px;
`;

const SectionTitle = styled(Typography)`
  font-weight: bold;
  margin-bottom: 15px;
  color: white;
`;

const ContentGrid = styled(Grid)`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #111;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e50914;
    border-radius: 4px;
  }
`;

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [documentaries, setDocumentaries] = useState([]);

  const [filters, setFilters] = useState({
    genre: '',
    year: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    genre: '',
    year: ''
  });
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    // Fetch trending content for everyone
    axios.get(API_ENDPOINTS.TRENDING)
      .then(response => setTrending(response.data.results || response.data))
      .catch(error => console.error('Error fetching trending:', error));

    // Fetch movies and series for everyone
    axios.get(API_ENDPOINTS.MOVIES)
      .then(response => setMovies(response.data.results || response.data))
      .catch(error => console.error('Error fetching movies:', error));

    axios.get(API_ENDPOINTS.SERIES)
      .then(response => setSeries(response.data.results || response.data))
      .catch(error => console.error('Error fetching series:', error));

    axios.get(API_ENDPOINTS.DOCUMENTARIES)
      .then(response => setDocumentaries(response.data.results || response.data))
      .catch(error => console.error('Error fetching documentaries:', error));

    // Fetch personalized content for authenticated users
    if (isAuthenticated) {
      axios.get(API_ENDPOINTS.RECOMMENDATIONS)
        .then(response => setRecommendations(response.data.results || response.data))
        .catch(error => console.error('Error fetching recommendations:', error));

      axios.get(API_ENDPOINTS.CONTINUE_WATCHING)
        .then(response => setContinueWatching(response.data.results || response.data))
        .catch(error => console.error('Error fetching continue watching:', error));
    }
  }, [isAuthenticated]);

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


  const fetchContentWithFilters = useCallback(async () => {
    const queryParams = [];
    if (appliedFilters.genre) queryParams.push(`genres=${appliedFilters.genre}`);
    if (appliedFilters.year) queryParams.push(`release_year=${appliedFilters.year}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
    try {
      const moviesRes = await axios.get(`${API_ENDPOINTS.MOVIES}${queryString}`);
      setMovies(moviesRes.data.results || moviesRes.data);
    } catch (err) {
      console.error('Error fetching filtered movies:', err);
      setMovies([]);
    }
  
    try {
      const seriesRes = await axios.get(`${API_ENDPOINTS.SERIES}${queryString}`);
      setSeries(seriesRes.data.results || seriesRes.data);
    } catch (err) {
      console.error('Error fetching filtered series:', err);
      setSeries([]);
    }
  
    try {
      const docsRes = await axios.get(`${API_ENDPOINTS.DOCUMENTARIES}${queryString}`);
      setDocumentaries(docsRes.data.results || docsRes.data);
    } catch (err) {
      console.error('Error fetching filtered documentaries:', err);
      setDocumentaries([]);
    }
  }, [appliedFilters]);
  
  useEffect(() => {
    fetchContentWithFilters();
  }, [fetchContentWithFilters]);
  
  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, backgroundColor: '#111', minHeight: '100vh', color: 'white' }}>

      {isAuthenticated && continueWatching.length > 0 && (
        <Section>
          <SectionTitle variant="h5">Continuar Viendo</SectionTitle>
          <ContentGrid container>
            {continueWatching.map(item => (
              <ContentCard key={`continue-${item.id}`} content={item.content_details} />
            ))}
          </ContentGrid>
        </Section>
      )}

      {isAuthenticated && recommendations.length > 0 && (
        <Section>
          <SectionTitle variant="h5">Recomendado para ti</SectionTitle>
          <ContentGrid container>
            {recommendations.map(content => (
              <ContentCard key={`rec-${content.id}`} content={content} />
            ))}
          </ContentGrid>
        </Section>
      )}

      {trending.length > 0 && (
        <Section>
          <SectionTitle variant="h5">Tendencias</SectionTitle>
          <ContentGrid container>
            {trending.map(content => (
              <ContentCard key={`trend-${content.id}`} content={content} />
            ))}
          </ContentGrid>
        </Section>
      )}
      <Section>
        <ContentFilters
          filters={filters}
          setFilters={setFilters}
          genres={genres} // ← ya cargados correctamente
          onApplyFilters={handleApplyFilters}
        />
      </Section>

      {movies.length > 0 && (
        <Section>
          <SectionTitle variant="h5">Películas</SectionTitle>
          <ContentGrid container>
            {movies.map(content => (
              <ContentCard key={`movie-${content.id}`} content={content} />
            ))}
          </ContentGrid>
        </Section>
      )}

      {series.length > 0 && (
        <Section>
          <SectionTitle variant="h5">Series</SectionTitle>
          <ContentGrid container>
            {series.map(content => (
              <ContentCard key={`series-${content.id}`} content={content} />
            ))}
          </ContentGrid>
        </Section>
      )}

      {documentaries.length > 0 && (
        <Section>
          <SectionTitle variant="h5">Documentales</SectionTitle>
          <ContentGrid container>
            {documentaries.map(content => (
              <ContentCard key={`doc-${content.id}`} content={content} />
            ))}
          </ContentGrid>
        </Section>
      )}
    </Container>
  );
};

export default HomePage;