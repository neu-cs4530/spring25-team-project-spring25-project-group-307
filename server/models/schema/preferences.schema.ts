import { Schema } from 'mongoose';

/**
 * Mongoose schema for the preferences collection.
 *
 * This schema defines the structure for storing questions in the database.
 * Each question includes the following fields:
 * - `userPreferences`: List of preferences for a specific community.
 * - `communityTitle`: title of community
 * - `username` username for the preferences belong to : 

 */
// Todo: delete this for a user when deleting the user
const preferencesSchema: Schema = new Schema(
  {
    userPreferences: {
      type: [String],
      default: [],
    },
    communityTitle: { type: String },
    username: { type: String },
  },
  { collection: 'Preferences' },
);

export default preferencesSchema;
