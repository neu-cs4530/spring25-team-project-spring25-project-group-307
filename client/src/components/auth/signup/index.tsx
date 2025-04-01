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
import { Pets, Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a signup form with username, password, and password confirmation inputs,
 * password visibility toggle, error handling, and a link to the login page.
 */
const Signup = () => {
  const {
    username,
    password,
    passwordConfirmation,
    showPassword,
    showPasswordConfirmation,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
    togglePasswordConfirmationVisibility,
  } = useAuth('signup');
  const paperStyle = {
    'padding': '33px',
    'width': '480px',
    'margin': '20px auto',
    'border-radius': '10px',
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
      <Paper elevation={10} sx={paperStyle}>
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
            Create new account
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
          </div>
          <div>
            <label htmlFor='confirmPassword'>
              Confirm Password<span style={{ color: 'red' }}>*</span>
            </label>
            <TextField
              sx={textFieldStyle}
              id='confirmPassword'
              value={passwordConfirmation}
              placeholder='Enter password'
              type={showPasswordConfirmation ? 'text' : 'password'}
              variant='outlined'
              onChange={event => handleInputChange(event, 'confirmPassword')}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Button onClick={togglePasswordConfirmationVisibility}>
                      {showPasswordConfirmation ? <Visibility /> : <VisibilityOff />}
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
            Sign up
          </Button>
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to='/' style={{ textDecoration: 'none' }}>
              <Typography component='span' sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Sign in
              </Typography>
            </Link>
          </Typography>
        </FormControl>
      </Paper>
    </Grid2>
  );
};

export default Signup;
