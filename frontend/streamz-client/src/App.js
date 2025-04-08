import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContentDetailPage from './pages/ContentDetailPage';
import PlayerPage from './pages/PlayerPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import DocumentariesPage from './pages/DocumentariesPage';
import MyListPage from './pages/MyListPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e50914',
    },
    secondary: {
      main: '#ffffff',
    },
    background: {
      default: '#111',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/content/:id" element={<ContentDetailPage />} />

            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/documentaries" element={<DocumentariesPage />} />
            <Route path="/my-list" element={<PrivateRoute><MyListPage /></PrivateRoute>} />
            
            <Route 
              path="/player/:contentId" 
              element={<PrivateRoute><PlayerPage /></PrivateRoute>} 
            />
            <Route 
              path="/profile" 
              element={<PrivateRoute><ProfilePage /></PrivateRoute>} 
            />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;