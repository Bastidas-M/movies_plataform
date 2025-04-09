import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import styled from 'styled-components';

const FiltersContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-end;
`;

const StyledFormControl = styled(FormControl)`
  min-width: 200px;
  width: 250px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  margin-right: 16px;
  
  .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .MuiOutlinedInput-root {
    color: white;
    fieldset {
      border-color: rgba(255, 255, 255, 0.2);
    }
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.4);
    }
  }
`;

const StyledTextField = styled(TextField)`
  min-width: 120px;
  width: 150px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  
  .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .MuiOutlinedInput-root {
    color: white;
    fieldset {
      border-color: rgba(255, 255, 255, 0.2);
    }
    &:hover fieldset {
      border-color: rgba(255, 255, 255, 0.4);
    }
    input {
      padding: 10px 14px;
    }
  }
`;

const ContentFilters = ({ filters, setFilters, genres = [], onApplyFilters }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleClearFilters = () => {

        setFilters({
            genre: '',
            year: ''
        });

        onApplyFilters({
            genre: '',
            year: ''
        });
    };

    return (
        <FiltersContainer>
            <StyledFormControl variant="outlined" size="small">
                <InputLabel>Género</InputLabel>
                <Select
                    name="genre"
                    value={filters.genre}
                    onChange={handleChange}
                    label="Género"
                >
                    <MenuItem value="">Todos</MenuItem>
                    {Array.isArray(genres) && genres.map(genre => (
                        <MenuItem key={genre.id} value={genre.id}>
                            {genre.name} {/* Muestra el nombre del género tal como viene del servidor */}
                        </MenuItem>
                    ))}
                </Select>
            </StyledFormControl>

            <StyledTextField
                label="Año"
                name="year"
                variant="outlined"
                size="small"
                type="number"
                value={filters.year}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
            />

            <Button
                variant="contained"
                onClick={() => onApplyFilters(filters)}
                sx={{
                    backgroundColor: '#e50914',
                    '&:hover': { backgroundColor: '#b20710' },
                    height: '40px'
                }}
            >
                Aplicar Filtros
            </Button>

            <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: '#e50914' },
                    height: '40px'
                }}
            >
                Limpiar Filtros
            </Button>
        </FiltersContainer>
    );
};

export default ContentFilters;