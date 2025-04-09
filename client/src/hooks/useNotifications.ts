import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@fake-stack-overflow/shared';

import {
  getNotifications,
  clearNotification,
  clearAllNotifications,
} from '../services/userNotificationService';

import useUserContext from './useUserContext';

const useNotifications = () => {
  // State to handle anchor element for notification dropdown (null when closed)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // State to store fetched notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Get user & socket from context
  const { socket, user } = useUserContext();

  const navigate = useNavigate();

  // Boolean flag to determine if notifications popover is open
  const open = Boolean(anchorEl);

  // Handles clicking the bell icon → opens the notification dropdown
  const handleClickBell = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  // Closes the notification dropdown
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Fetches latest notifications from backend for current user
  const refreshNotifications = useCallback(() => {
    getNotifications(user.username).then(notificationsResponse => {
      if (notificationsResponse) setNotifications(notificationsResponse.notifications);
    });
  }, [user.username]);

  // Handles clicking a specific notification:
  // navigates to relevant question
  // clears that notification
  // refreshes notifications
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

  // Clears all notifications for the user
  const handleClear = useCallback(() => {
    handleClose();
    clearAllNotifications(user.username).then(() => setNotifications([]));
  }, [handleClose, user.username]);

  // On mount:
  // - Fetch initial notifications
  // - Listen for 'preferencesUpdate' socket event to refresh notifications in real-time
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
