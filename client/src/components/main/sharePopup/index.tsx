import React from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
} from '@mui/material';

import UsersListPage from '../usersListPage';
import useSharePopup from '../../../hooks/useSharePopup';

interface SharePopupProps {
  open: boolean;
  onClose: () => void;
  questionId: string;
}

const SharePopup: React.FC<SharePopupProps> = ({ open, onClose, questionId }) => {
  const { snackbarOpen, sendLoading, handleUserSelect, setSnackbarOpen } = useSharePopup(
    onClose,
    questionId,
  );
  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
        <DialogTitle textAlign={'center'}>Share to User</DialogTitle>
        <DialogContent>
          <UsersListPage handleUserSelect={handleUserSelect} />
        </DialogContent>
        {sendLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: '20px',
            }}>
            <CircularProgress />
          </Box>
        )}
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity='success' sx={{ width: '100%', fontSize: '18px' }}>
          Sent
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SharePopup;
