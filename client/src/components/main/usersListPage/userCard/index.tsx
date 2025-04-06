import React from 'react';
import './index.css';
import { Card, CardContent, Typography } from '@mui/material';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = (props: UserProps) => {
  const { user, handleUserCardViewClickHandler } = props;

  return (
    <Card
      className='content_background'
      sx={{
        'display': 'flex',
        'flexDirection': 'column',
        'justifyContent': 'space-between',
        'px': 2,
        'marginBottom': 1,
        'cursor': 'pointer',
        'boxShadow': 3,
        'borderRadius': 5,
        '&:hover': {
          boxShadow: 6,
          backgroundColor: '#F7F7F7',
        },
      }}
      onClick={() => handleUserCardViewClickHandler(user)}>
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 3,
        }}>
        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
          {user.username}
        </Typography>
        <Typography variant='body2' color='text.disabled'>
          Joined: {new Date(user.dateJoined).toUTCString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default UserCardView;
