import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  position: relative;
  width: 200px;
  margin: 10px;
  transition: transform 0.3s ease;
  background-color: #1a1a1a;
  color: white;

  &:hover {
    transform: scale(1.05);
    z-index: 1;
  }
`;

const ContentInfo = styled(CardContent)`
  padding: 10px;
`;

const ContentCard = ({ content }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/content/${content.id}`);
  };

  return (
    <StyledCard onClick={handleClick}>
      <CardMedia
        component="img"
        height="280"
        image={content.thumbnail || '/placeholder.png'} 
        alt={content.title}
      />
      <ContentInfo>
        <Typography variant="h6" noWrap>
          {content.title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {content.release_year} • {content.content_type === 'movie' ? 'Película' : content.content_type === 'series' ? 'Serie' : 'Documental'}
        </Typography>
      </ContentInfo>
    </StyledCard>
  );
};

export default ContentCard;