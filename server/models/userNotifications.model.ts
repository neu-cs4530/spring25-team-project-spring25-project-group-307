import mongoose, { Model } from 'mongoose';
import { DatabaseUserNotifications } from '@fake-stack-overflow/shared';

import userNotificationsSchema from './schema/userNotifications.schema';

/**
 * Mongoose model for the `UserNotifications` collection.
 *
 * This model is created using the `DatabaseUserNotifications` interface and the `userNotificationsSchema`,
 * representing the `UserNotifications` collection in the MongoDB database, and provides an interface
 * for interacting with the stored user notifications.
 *
 * @type {Model<DatabaseUserNotifications>}
 */
const UserNotificationsModel: Model<DatabaseUserNotifications> =
  mongoose.model<DatabaseUserNotifications>('UserNotifications', userNotificationsSchema);

export default UserNotificationsModel;
