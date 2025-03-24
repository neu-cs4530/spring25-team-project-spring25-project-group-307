import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

type RankUpContextType = {
  notifyRankUp: (rank: string) => void;
};

const RankUpContext = createContext<RankUpContextType | undefined>(undefined);

export const RankUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [rank, setRank] = useState('');

  const notifyRankUp = (newRank: string) => {
    setRank(newRank);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <RankUpContext.Provider value={{ notifyRankUp }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity='success' variant='filled' sx={{ width: '100%' }}>
          🎉 You’ve ranked up to <strong>{rank}</strong>!
        </Alert>
      </Snackbar>
    </RankUpContext.Provider>
  );
};

export const useRankUpNotifier = (): RankUpContextType => {
  const context = useContext(RankUpContext);
  if (!context) {
    throw new Error('useRankUpNotifier must be used within a RankUpProvider');
  }
  return context;
};
