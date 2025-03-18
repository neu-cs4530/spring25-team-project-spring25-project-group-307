import Box from '@mui/material/Box';

import CircularProgress from '@mui/material/CircularProgress';

import { Button } from '@mui/material';

import RecommendedContentPanel from './recommendedContentPanel';
import useFeedPage from '../../../hooks/useFeedPage';

const FeedPage = () => {
  const { questions, isQuestionsLoading, pageEndElement } = useFeedPage();

  return (
    <>
      <RecommendedContentPanel questions={questions} />
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <Box
          ref={pageEndElement}
          sx={{ width: '100%', backgroundColor: 'lightblue', color: 'white', p: 2 }}></Box>

        {isQuestionsLoading && (
          <Box sx={{ p: 1 }} display='flex' justifyContent='center' alignItems='center'>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </>
  );
};

export default FeedPage;
