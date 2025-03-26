import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';

const useUserPreferenceUpdates = () => {
  const { socket } = useUserContext();

  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    socket.on('preferencesUpdate', () => {
      setSnackbarOpen(true);
    });
  }, [socket]);
  return { snackbarOpen, setSnackbarOpen };
};

export default useUserPreferenceUpdates;
