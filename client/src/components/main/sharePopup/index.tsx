import React, { useState } from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
} from '@mui/material';

import { SafeDatabaseUser } from '@fake-stack-overflow/shared';

import UsersListPage from '../usersListPage';
import { createChat, getChatsByUser, sendMessage } from '../../../services/chatService';
import useUserContext from '../../../hooks/useUserContext';

interface SharePopupProps {
  open: boolean;
  onClose: () => void;
  questionId: string;
}

const SharePopup: React.FC<SharePopupProps> = ({ open, onClose, questionId }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const { user } = useUserContext();

  const handleUserSelect = (selectedUser: SafeDatabaseUser) => {
    const baseUrl = new URL(window.location.origin);

    const questionURL = `${baseUrl}question/${questionId}`;

    const message = { msg: questionURL, msgFrom: user.username, msgDateTime: new Date() };
    setSendLoading(true);

    getChatsByUser(user.username)
      .then(chats => {
        const chatWithSelectedUser = chats.find(chat =>
          chat.participants.includes(selectedUser.username),
        );

        if (!chatWithSelectedUser) {
          createChat([user.username, selectedUser.username]).then(createdChat =>
            sendMessage(message, createdChat._id),
          );
        } else {
          sendMessage(message, chatWithSelectedUser._id);
        }
      })
      .finally(() => {
        setSnackbarOpen(true);
        setSendLoading(false);
        onClose();
      });
  };

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
