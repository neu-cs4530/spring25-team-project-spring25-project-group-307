import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  TextField,
  Avatar,
  Typography,
  IconButton,
  Box,
  Button,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import { SafeDatabaseUser } from '@fake-stack-overflow/shared';

import UsersListPage from '../usersListPage';

interface SharePopupProps {
  open: boolean;
  onClose: () => void;
}

const SharePopup: React.FC<SharePopupProps> = ({ open, onClose }) => {
  const handleUserSelect = (user: SafeDatabaseUser) => {
    console.log(user);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <UsersListPage handleUserSelect={handleUserSelect} />
    </Dialog>
  );
};

export default SharePopup;
