import React from 'react';
import './index.css';
import { Box, TextField } from '@mui/material';
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
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className='bold_title'>Users List</div>
        <Box sx={{ width: '300px' }}>
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
      <Box sx={{ my: 5 }}>
        <div id='user_count'>{userCount} users</div>
      </Box>
    </div>
  );
};

export default UsersListHeader;
