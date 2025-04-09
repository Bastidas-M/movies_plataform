import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { Search as SearchIcon, AccountCircle, Home as HomeIcon } from '@mui/icons-material';
import styled from 'styled-components';
import AuthContext from '../context/AuthContext';

const StyledAppBar = styled(AppBar)`
  background-color: #111;
`;

const Logo = styled(Typography)`
  flex-grow: 1;
  font-weight: bold;
  color: #e50914;
  cursor: pointer;
`;

const SearchInput = styled.input`
  background-color: #333;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  margin-right: 16px;
  width: 250px;

  &:focus {
    outline: none;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
`;

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Logo variant="h6" onClick={() => navigate('/')}>
          StreamZ
        </Logo>

        {isAuthenticated && (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
            >
              Inicio
            </Button>
            <Button color="inherit" component={Link} to="/movies">
              Películas
            </Button>
            <Button color="inherit" component={Link} to="/series">
              Series
            </Button>
            <Button color="inherit" component={Link} to="/documentaries">
              Documentales
            </Button>
            <Button color="inherit" component={Link} to="/my-list">
              Mi Lista
            </Button>

            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                placeholder="Buscar títulos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IconButton type="submit" color="inherit">
                <SearchIcon />
              </IconButton>
            </SearchForm>

            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <AccountCircle />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                Mi Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
            </Menu>
          </>
        )}

        {!isAuthenticated && (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
            >
              Inicio
            </Button>
            <Button color="inherit" component={Link} to="/login">
              Iniciar Sesión
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Registrarse
            </Button>
          </>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;