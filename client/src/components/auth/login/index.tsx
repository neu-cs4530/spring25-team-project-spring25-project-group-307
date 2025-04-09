import React from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  Grid2,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Pets from '@mui/icons-material/Pets';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a login form with username and password inputs, password visibility toggle,
 * error handling, and a link to the signup page.
 */
const Login = () => {
  const {
    username,
    password,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('login');

  const paperStyle = {
    'padding': '33px',
    'width': '480px',
    'margin': '20px auto',
    'border-radius': '10px',
    'backgroundColor': '#FDFBF7',
  };
  const btnStyle = { 'padding': '10px 14px', 'border-radius': '10px' };
  const textFieldStyle = {
    'marginTop': '8px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  };
  const errBoxSyle = {
    border: '1px solid red',
    borderRadius: '5px',
    padding: '5px',
    backgroundColor: '#f8d7da',
  };

  return (
    <Grid2
      container
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Paper elevation={5} sx={paperStyle}>
        <FormControl onSubmit={handleSubmit} component='form' noValidate>
          <Typography
            variant='h4'
            sx={{
              padding: '4px 0px',
              textAlign: 'center',
              color: 'primary.main',
            }}>
            HuskyFlow <Pets />
          </Typography>
          <Typography variant='h5' sx={{ paddingBottom: '8px' }}>
            Sign In
          </Typography>
          <div>
            <label htmlFor='username'>
              Username<span style={{ color: 'red' }}>*</span>
            </label>
            <TextField
              sx={textFieldStyle}
              id='username'
              value={username}
              placeholder='Enter username'
              variant='outlined'
              onChange={event => handleInputChange(event, 'username')}
              fullWidth
              required
            />
          </div>
          <div>
            <label htmlFor='password'>
              Password<span style={{ color: 'red' }}>*</span>
            </label>
            <TextField
              sx={textFieldStyle}
              id='password'
              value={password}
              placeholder='Enter password'
              type={showPassword ? 'text' : 'password'}
              variant='outlined'
              onChange={event => handleInputChange(event, 'password')}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Button onClick={togglePasswordVisibility}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant='body2' sx={{ marginTop: '8px', float: 'right', color: 'red' }}>
              *required fields
            </Typography>
          </div>
          {err && (
            <Box sx={errBoxSyle}>
              <Typography sx={{ color: 'red', textAlign: 'center' }}>{err}</Typography>
            </Box>
          )}
          <Button type='submit' color='primary' variant='contained' sx={btnStyle} fullWidth>
            Sign in
          </Button>
          <Typography sx={{ textAlign: 'center' }}>
            Don&#39;t Have an account?{' '}
            <Link to='/signup' style={{ textDecoration: 'none' }}>
              <Typography component='span' sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Create an account
              </Typography>
            </Link>
          </Typography>
        </FormControl>
      </Paper>
    </Grid2>
  );
};

export default Login;
