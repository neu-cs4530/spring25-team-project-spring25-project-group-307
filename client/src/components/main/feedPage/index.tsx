import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CircularProgress from '@mui/material/CircularProgress';

import { useState } from 'react';

import useLeaderboardPage from '../../../hooks/useLeaderboardPage';
import TopUsersTab from '../leaderboardPage/topUsersTab';
import TopCommunitiesTab from '../leaderboardPage/topCommunitiesTab';
import RecommendedContentPanel from './recommendedContentPanel';

const FeedPage = () => {
  const { communities, isCommunitiesLoading, topUsers, istopUsersLoading } = useLeaderboardPage();

  return (
    <Box sx={{ borderTop: 1, width: '100%', typography: 'body1' }}>
      {isCommunitiesLoading ? (
        <Box display='flex' justifyContent='center' alignItems='center'>
          <CircularProgress />
        </Box>
      ) : (
        <RecommendedContentPanel />
      )}
    </Box>
  );
};

export default FeedPage;
