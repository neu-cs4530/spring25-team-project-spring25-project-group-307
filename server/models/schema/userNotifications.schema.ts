import { Schema } from 'mongoose';

/**
 * Mongoose schema for the UserNotifications collection.
 *
 * This schema defines the structure of user notifications in the database.
 * Each user notification includes the following fields:
 * - `username`: The username of the user receiving notifications.
 * - `notifications`: An array of notifications, each containing:
 *   - `message`: The text of the notification.
 *   - `questionId`: The ID of the related question.
 */
const userNotificationsSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    notifications: [
      {
        message: {
          type: String,
          required: true,
        },
        questionId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { collection: 'UserNotifications' },
);

export default userNotificationsSchema;
