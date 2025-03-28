import Box from '@mui/material/Box';

import CircularProgress from '@mui/material/CircularProgress';

import { Link, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RecommendedContentPanel from './recommendedContentPanel';
import useFeedPage from '../../../hooks/useFeedPage';

const FeedPage = () => {
  const { feedItems, isQuestionsLoading, pageEndElement, noMoreContent, resetFeed } = useFeedPage();

  return (
    <>
      <RecommendedContentPanel feedItems={feedItems} />
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <Box ref={pageEndElement} sx={{ width: '100%', p: 2 }}></Box>
        {noMoreContent && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #5C869F, #765C9F, #5C649F)',
              }}>
              <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>

            {/* Text */}
            <Typography variant='h6' sx={{ mt: 2, fontWeight: 'bold' }}>
              {"You're All Caught Up"}
            </Typography>

            {/* Link */}
            <Link
              onClick={e => {
                e.preventDefault();
                resetFeed();
              }}
              sx={{ mt: 1, color: '#1877F2', fontSize: 14 }}>
              Refresh Feed
            </Link>
          </Box>
        )}
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
