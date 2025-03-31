import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';

const useUserPreferenceUpdates = () => {
  const { socket } = useUserContext();

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  useEffect(() => {
    socket.on('preferencesUpdate', updateMessage => {
      setSnackbarOpen(true);
      setSnackbarMessage(updateMessage);
    });
  }, [socket]);
  return { snackbarOpen, handleClose, snackbarMessage };
};

export default useUserPreferenceUpdates;
