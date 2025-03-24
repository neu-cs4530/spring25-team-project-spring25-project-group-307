import { Schema } from 'mongoose';
import UserPreference from '@fake-stack-overflow/shared/types/types';

/**
 * Mongoose schema for the preferences collection.
 *
 * This schema defines the structure for storing questions in the database.
 * Each question includes the following fields:
 * - `communityPreferences`: List of preferences for a specific community.
 * - `community`: Id of community
 * - `user` id of the user the preferences belong to : 

 */
// Todo: delete this for a user when deleting the user
const preferencesSchema: Schema = new Schema(
  {
    communityPreferences: {
      type: [UserPreference],
    },
    community: { type: Schema.Types.ObjectId, ref: 'Community' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { collection: 'Preferences' },
);

export default preferencesSchema;
