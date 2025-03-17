import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CircularProgress from '@mui/material/CircularProgress';

import { useState } from 'react';
import { Button } from '@mui/material';

import useLeaderboardPage from '../../../hooks/useLeaderboardPage';
import TopUsersTab from '../leaderboardPage/topUsersTab';
import TopCommunitiesTab from '../leaderboardPage/topCommunitiesTab';
import RecommendedContentPanel from './recommendedContentPanel';
import useFeedPage from '../../../hooks/useFeedPage';

const FeedPage = () => {
  const { questions, isQuestionsLoading, getMoreQuestions } = useFeedPage();

  return (
    <>
      <RecommendedContentPanel questions={questions} />
      <Box sx={{ width: '100%', typography: 'body1' }}>
        {isQuestionsLoading && (
          <Box sx={{ p: 1 }} display='flex' justifyContent='center' alignItems='center'>
            <CircularProgress />
          </Box>
        )}
      </Box>
      <Button onClick={() => getMoreQuestions(1)}>Get More</Button>
    </>
  );
};

export default FeedPage;
