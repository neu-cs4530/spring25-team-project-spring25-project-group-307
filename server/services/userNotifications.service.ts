import UserNotificationsModel from '../models/userNotifications.model';
import { DatabaseUserNotifications, Notification } from '../types/types';

/**
 * Retrieves all notifications for a specific user.
 * @param {string} username - The username of the user.
 * @returns {Promise<DatabaseUserNotifications | null>} - The user's notifications or null if not found.
 */
export const getNotifications = async (
  username: string,
): Promise<DatabaseUserNotifications | null> => {
  try {
    return await UserNotificationsModel.findOne({ username });
  } catch (error) {
    return null;
  }
};

/**
 * Adds a notification for a specific user.
 * @param {string} username - The username of the user.
 * @param {Notification} notification - The notification to add.
 * @returns {Promise<DatabaseUserNotifications | { error: string }>} - The updated user notifications or an error message.
 */
export const addNotification = async (
  username: string,
  notification: Notification,
): Promise<DatabaseUserNotifications | { error: string }> => {
  try {
    const result = await UserNotificationsModel.findOneAndUpdate(
      { username },
      { $push: { notifications: notification } },
      { new: true, upsert: true },
    );

    if (!result) {
      throw new Error('Failed to add notification for user');
    }

    return result;
  } catch (error) {
    return { error: `Error when adding notification: ${(error as Error).message}` };
  }
};

/**
 * Clears a specific notification for a user.
 * @param {string} username - The username of the user.
 * @param {string} questionId - The ID of the notification to remove.
 * @returns {Promise<DatabaseUserNotifications | { error: string }>} - The updated user notifications or an error message.
 */
export const clearNotification = async (
  username: string,
  questionId: string,
): Promise<DatabaseUserNotifications | { error: string }> => {
  try {
    const result = await UserNotificationsModel.findOneAndUpdate(
      { username },
      { $pull: { notifications: { questionId } } },
      { new: true },
    );

    if (!result) {
      throw new Error('User not found or no matching notification to clear');
    }

    return result;
  } catch (error) {
    return { error: `Error when clearing notification: ${(error as Error).message}` };
  }
};

/**
 * Clears all notifications for a user.
 * @param {string} username - The username of the user.
 * @returns {Promise<DatabaseUserNotifications | { error: string }>} - The updated user notifications or an error message.
 */
export const clearAllNotifications = async (
  username: string,
): Promise<DatabaseUserNotifications | { error: string }> => {
  try {
    const result = await UserNotificationsModel.findOneAndUpdate(
      { username },
      { $set: { notifications: [] } },
      { new: true },
    );

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  } catch (error) {
    return { error: `Error when clearing all notifications: ${(error as Error).message}` };
  }
};
