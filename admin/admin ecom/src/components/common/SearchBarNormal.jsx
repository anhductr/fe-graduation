import * as React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';

// Tùy chỉnh TextField bằng styled + Tailwind-like classes
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '40px',
    borderRadius: '6px',
    backgroundColor: '#fff',
    fontSize: '15px',
    paddingLeft: '12px',
    '& fieldset': {
      borderColor: '#e5e7eb', // border-gray-300
    },
    '&:hover fieldset': {
      borderColor: '#d1d5db',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6', // blue-500
      borderWidth: '2px',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 14px',
    '&::placeholder': {
      color: '#9ca3af', // text-gray-400
      opacity: 1,
    },
  },
}));

export default function SearchBarNormal() {
  return (
    <div className="w-[250px]">
      <StyledTextField
        fullWidth
        placeholder="Tìm kiếm..."
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#9ca3af', fontSize: 22 }} />
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
}