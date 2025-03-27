import mongoose, { Model } from 'mongoose';
import { DatabaseAchievement } from '@fake-stack-overflow/shared/types/community';
import achievementSchema from './schema/achievement.schema';

/**
 * Mongoose model for the `Achievement` collection.
 *
 * This model is created using the `DatabaseAchievement` interface and the `achievementSchema`,
 * representing the `Achievement` collection in the MongoDB database. It provides an interface
 * for interacting with stored achievements.
 *
 * @type {Model<DatabaseAchievement>}
 */
const AchievementModel: Model<DatabaseAchievement> = mongoose.model<DatabaseAchievement>(
  'Achievement',
  achievementSchema,
);

export default AchievementModel;
