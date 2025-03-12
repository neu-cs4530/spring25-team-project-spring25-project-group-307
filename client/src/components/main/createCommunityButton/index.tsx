import { Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CreateCommunityButton component that renders a button for navigating to the
 * "New Community" page. When clicked, it redirects the user to the page
 * where they can ask a new community.
 */
const CreateCommunityButton = () => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Community" page.
   */
  const handleNewCommunity = () => {
    navigate('/new/community');
  };

  return (
    <Button
      variant='contained'
      color='primary'
      onClick={() => {
        handleNewCommunity();
      }}>
      Create Community
    </Button>
  );
};

export default CreateCommunityButton;
