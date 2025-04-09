import React from 'react';
import './index.css';
import { Box, TextField, Typography } from '@mui/material';
import useUserSearch from '../../../../hooks/useUserSearch';

/**
 * Interface representing the props for the UserHeader component.
 *
 * userCount - The number of users to be displayed in the header.
 * setUserFilter - A function that sets the search bar filter value.
 */
interface UserHeaderProps {
  userCount: number;
  setUserFilter: (search: string) => void;
}

/**
 * UsersListHeader component displays the header section for a list of users.
 * It includes the title and search bar to filter the user.
 * Username search is case-sensitive.
 *
 * @param userCount - The number of users displayed in the header.
 * @param setUserFilter - Function that sets the search bar filter value.
 */
const UsersListHeader = ({ userCount, setUserFilter }: UserHeaderProps) => {
  const { val, handleInputChange } = useUserSearch(setUserFilter);

  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Typography variant='h4' className='bold_title' sx={{ mb: 1 }}>
        Users List
      </Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>
        {userCount} users
      </Typography>
      <Box sx={{ maxWidth: 300, mx: 'auto' }}>
        <TextField
          id='user_search'
          placeholder='Search for Username'
          className='content_background'
          sx={{ width: '100%' }}
          variant='outlined'
          size='small'
          value={val}
          onChange={handleInputChange}
        />
      </Box>
    </Box>
  );
};

export default UsersListHeader;
