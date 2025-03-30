import { Badge, Box, Divider, IconButton, Link, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useEffect, useState } from 'react';
import { Notification } from '@fake-stack-overflow/shared';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

import useUserContext from '../../../../hooks/useUserContext';
import {
  clearAllNotifications,
  clearNotification,
  getNotifications,
} from '../../../../services/userNotificationService';

const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket, user } = useUserContext();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleClickBell = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const refreshNotifications = useCallback(() => {
    getNotifications(user.username).then(notificationsResponse => {
      if (notificationsResponse) setNotifications(notificationsResponse.notifications);
    });
  }, [user.username]);

  const handleClickNotification = useCallback(
    (notification: Notification) => {
      navigate(`/question/${notification.questionId}`);
      clearNotification(user.username, notification.questionId).then(() => {
        refreshNotifications();
        handleClose();
      });
    },
    [navigate, refreshNotifications, handleClose, user.username],
  );

  const handleClear = useCallback(() => {
    handleClose();
    clearAllNotifications(user.username).then(() => setNotifications([]));
  }, [handleClose, user.username]);

  useEffect(() => {
    refreshNotifications();

    socket.on('preferencesUpdate', () => {
      refreshNotifications();
    });

    return () => {
      socket.off('preferencesUpdate');
    };
  }, [socket, user.username, refreshNotifications]);
  return (
    <>
      <IconButton onClick={handleClickBell} color='inherit'>
        <Badge badgeContent={notifications.length} color='error'>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
        sx={{
          padding: '10px',
          borderRadius: '8px',
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            flexDirection: 'column',
          }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}>
            <Typography variant='h6' sx={{ p: 1 }}>
              Your Notifications
            </Typography>
          </Box>

          <Divider sx={{ mb: 1 }} />
        </Box>

        {notifications.map((notification, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              flexDirection: 'column',
            }}>
            <MenuItem onClick={() => handleClickNotification(notification)}>
              {notification.message}
            </MenuItem>
            <Divider />
          </Box>
        ))}
        {notifications.length === 0 ? (
          <MenuItem onClick={handleClose}>No new notifications...</MenuItem>
        ) : (
          <MenuItem onClick={handleClear}>
            <Link underline='hover' sx={{ fontSize: '14px', textAlign: 'center', width: '100%' }}>
              Clear
            </Link>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
