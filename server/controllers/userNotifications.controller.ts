import express, { Request, Response } from 'express';
import {
  getNotifications,
  clearNotification,
  clearAllNotifications,
} from '../services/userNotifications.service';

const userNotificationsController = () => {
  const router = express.Router();

  /**
   * Route to get all notifications for a specific user.
   * @param req The request object containing the username.
   * @param res The response object to send back the notifications.
   */
  const getNotificationsRoute = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.params;

    if (!username) {
      res.status(400).send('Username is required');
      return;
    }

    const notifications = await getNotifications(username);

    res.json(notifications);
  };

  /**
   * Route to clear a specific notification for a user.
   * @param req The request object containing the username and questionId.
   * @param res The response object to send back the updated notifications.
   */
  const clearNotificationRoute = async (req: Request, res: Response): Promise<void> => {
    const { username, questionId } = req.body;

    if (!username || !questionId) {
      res.status(400).send('Invalid request');
      return;
    }

    const updatedNotifications = await clearNotification(username, questionId);
    if ('error' in updatedNotifications) {
      res.status(500).send('Failed to update');
      return;
    }
    res.json(updatedNotifications);
  };

  const clearAllNotificationsRoute = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.body;

    if (!username) {
      res.status(400).send('Username is required');
      return;
    }

    const result = await clearAllNotifications(username);
    if ('error' in result) {
      res.status(500).send('Failed to clear');
      return;
    }
    res.json(result);
  };

  // Define routes
  router.get('/:username', getNotificationsRoute);
  router.post('/clear', clearNotificationRoute);
  router.post('/clearAll', clearAllNotificationsRoute);

  return router;
};

export default userNotificationsController;
