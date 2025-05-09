import { Box, Stack, Typography, Button } from '@mui/material';

import QuestionView from '../questionPage/question';
import SharePopup from '../sharePopup';
import useSavedPage from '../../../hooks/useSavedPage';

const SavedPage = () => {
  const {
    savedQuestions,
    handleUnsave,
    handleShare,
    sharePopupOpen,
    setSharePopupOpen,
    sharePopupId,
  } = useSavedPage();

  return (
    <>
      <div className='space_between right_padding'>
        <div className='bold_title'>Saved Questions</div>
      </div>

      <Box sx={{ padding: '0% 5%' }}>
        <Stack spacing={4}>
          {savedQuestions.map(q => (
            <Box
              key={String(q._id)}
              sx={{ border: '1px solid #ccc', borderRadius: '8px', paddingX: 2, paddingTop: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <QuestionView question={q} />
                </Box>
                <Stack spacing={1} direction='column' alignItems='flex-end' sx={{ flexShrink: 0 }}>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    onClick={() => handleUnsave(q._id)}>
                    Unsave
                  </Button>
                  <Button
                    variant='outlined'
                    color='primary'
                    size='small'
                    onClick={() => handleShare(q._id)}>
                    Share
                  </Button>
                </Stack>
              </Box>
            </Box>
          ))}
          <SharePopup
            open={sharePopupOpen}
            onClose={() => {
              setSharePopupOpen(false);
            }}
            questionId={sharePopupId}
          />
          {savedQuestions.length === 0 && (
            <Typography variant='body1' color='text.secondary'>
              You haven’t saved any questions yet.
            </Typography>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default SavedPage;
