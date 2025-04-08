import React from 'react';
import './index.css';
import { Card, CardContent, Typography, Box } from '@mui/material';
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
        'mb': 1.5,
        'cursor': 'pointer',
        'boxShadow': 4,
        'borderRadius': 5,
        'maxWidth': 900,
        'width': '100%',
        'mx': 'auto',
        '&:hover': {
          boxShadow: 6,
          backgroundColor: '#F7F7F7',
        },
      }}
      onClick={() => handleUserCardViewClickHandler(user)}>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingY: 2.5,
          paddingX: 3,
          gap: 2, // small spacing between items
        }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            {user.username}
          </Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary', mt: 0.5 }}>
            {user.ranking ?? 'Unranked'}
          </Typography>
        </Box>

        <Typography
          variant='body2'
          color='text.disabled'
          sx={{ flex: 1, textAlign: 'right', fontSize: '0.85rem' }}>
          Joined: {new Date(user.dateJoined).toUTCString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default UserCardView;
