import React, { useState, useContext, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Divider, Grid, Avatar } from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/config';
import AuthContext from '../context/AuthContext';
import styled from 'styled-components';

const ProfileContainer = styled(Container)`
  padding-top: 40px;
  padding-bottom: 40px;
  min-height: 80vh;
`;

const ProfilePaper = styled(Paper)`
  padding: 32px;
  background-color: #1a1a1a;
  color: white;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 20px;
  color: white;
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 16px;
  
  .MuiInputBase-root {
    color: white;
  }
  
  .MuiOutlinedInput-root {
    fieldset {
      border-color: #333;
    }
    
    &:hover fieldset {
      border-color: white;
    }
  }
  
  .MuiInputLabel-root {
    color: #aaa;
  }
`;

const UpdateButton = styled(Button)`
  background-color: #e50914;
  margin-top: 16px;
  
  &:hover {
    background-color: #f40612;
  }
`;

const PlanCard = styled(Paper)`
  padding: 16px;
  margin-top: 16px;
  background-color: #333;
  border: ${({ active }) => (active ? '2px solid #e50914' : '2px solid transparent')};
`;

const ProfilePage = () => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setProfile({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || ''
      });

      // Fetch subscription plans
      axios.get(API_ENDPOINTS.PLANS)
        .then(response => setPlans(response.data))
        .catch(error => console.error('Error fetching plans:', error));

      // Fetch watch history
      axios.get(API_ENDPOINTS.HISTORY)
        .then(response => setHistory(response.data.results || response.data))
        .catch(error => console.error('Error fetching history:', error));
    }
  }, [isAuthenticated, currentUser]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.patch(API_ENDPOINTS.PROFILE, profile);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#111', minHeight: '100vh', color: 'white' }}>
      <ProfileContainer maxWidth="md">
        <SectionTitle variant="h4" gutterBottom>Mi Perfil</SectionTitle>

        <ProfilePaper elevation={3}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: '#e50914',
                    fontSize: '3rem',
                    mb: 2
                  }}
                >
                  {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h6">{currentUser?.username}</Typography>
                {currentUser?.plan && (
                  <Typography variant="body2" color="textSecondary">
                    Plan: {currentUser.plan.name}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Información Personal</Typography>
              <StyledTextField
                label="Nombre"
                variant="outlined"
                fullWidth
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
              />

              <StyledTextField
                label="Apellido"
                variant="outlined"
                fullWidth
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
              />

              <StyledTextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                name="email"
                value={profile.email}
                onChange={handleChange}
              />

              <UpdateButton
                variant="contained"
                onClick={handleUpdateProfile}
              >
                Actualizar Perfil
              </UpdateButton>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, backgroundColor: '#333' }} />

          <Box>
            <Typography variant="h6" gutterBottom>Detalles de Suscripción</Typography>
            {currentUser?.subscription_active ? (
              <Typography variant="body1" color="success.main" gutterBottom>
                Suscripción activa hasta: {currentUser?.subscription_end_date}
              </Typography>
            ) : (
              <Typography variant="body1" color="error.main" gutterBottom>
                Suscripción inactiva
              </Typography>
            )}

            {plans.length > 0 && (
              <Grid container spacing={2}>
                {plans.map(plan => (
                  <Grid item xs={12} sm={4} key={plan.id}>
                    <PlanCard active={currentUser?.plan?.id === plan.id}>
                      <Typography variant="h6">{plan.name}</Typography>
                      <Typography variant="body1">${plan.price}/mes</Typography>
                      <Typography variant="body2">
                        {plan.max_screens} {plan.max_screens === 1 ? 'pantalla' : 'pantallas'} •
                        Calidad {plan.video_quality}
                      </Typography>
                    </PlanCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>Historial de Visualización</Typography>

            {history.length > 0 ? (
              <Grid container spacing={2}>
                {history.map((item) => (
                  <Grid item xs={12} key={item.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        p: 2,
                        backgroundColor: '#333',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 120,
                          height: 70,
                          backgroundColor: '#222',
                          backgroundImage: `url(${item.content_details?.thumbnail || ''})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          mr: 2,
                          borderRadius: 1
                        }}
                      />
                      <Box>
                        <Typography variant="body1">
                          {item.content_details?.title || item.episode_details?.title || 'Contenido sin título'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Visto: {new Date(item.watched_date).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Progreso: {Math.round(item.watched_percentage)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No hay historial de visualización disponible.
              </Typography>
            )}
          </Box>
        </ProfilePaper>
      </ProfileContainer>
    </Box>
  );
};

export default ProfilePage;