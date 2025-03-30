import api from './config';
import { Notification, UserNotifications } from '../types/types';

const NOTIFICATIONS_API_URL = `${process.env.REACT_APP_SERVER_URL}/notifications`;

/**
 * Fetches all notifications for a specific user.
 *
 * @param username - The username to fetch notifications for.
 * @throws Error if the request fails.
 */
const getNotifications = async (username: string): Promise<UserNotifications | null> => {
  const res = await api.get(`${NOTIFICATIONS_API_URL}/${username}`);
  if (res.status !== 200) {
    throw new Error('Error while fetching notifications');
  }
  return res.data;
};

/**
 * Clears a specific notification for a user.
 *
 * @param username - The username of the user.
 * @param questionId - The ID of the question associated with the notification to clear.
 * @throws Error if the request fails.
 */
const clearNotification = async (
  username: string,
  questionId: string,
): Promise<UserNotifications> => {
  const res = await api.post(`${NOTIFICATIONS_API_URL}/clear`, { username, questionId });
  if (res.status !== 200) {
    throw new Error('Error while clearing notification');
  }
  return res.data;
};

/**
 * Clears all notifications for a user.
 *
 * @param username - The username of the user.
 * @throws Error if the request fails.
 */
const clearAllNotifications = async (username: string): Promise<UserNotifications> => {
  const res = await api.post(`${NOTIFICATIONS_API_URL}/clearAll`, { username });
  if (res.status !== 200) {
    throw new Error('Error while clearing all notifications');
  }
  return res.data;
};

export { getNotifications, clearNotification, clearAllNotifications };
