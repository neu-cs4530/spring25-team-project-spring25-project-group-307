import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  clearNotification,
  clearAllNotifications,
} from '../services/userNotificationService';
import { Notification } from '@fake-stack-overflow/shared';

import useUserContext from './useUserContext';

const useNotifications = () => {
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
  return {
    handleClickBell,
    notifications,
    anchorEl,
    handleClose,
    open,
    handleClickNotification,
    handleClear,
  };
};
export default useNotifications;
