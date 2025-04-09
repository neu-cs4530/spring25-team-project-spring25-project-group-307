import mongoose, { Model } from 'mongoose';
import { DatabasePreferences } from '../types/types';
import preferencesSchema from './schema/preferences.schema';

/**
 * Mongoose model for the `Comment` collection.
 *
 * This model is created using the `Comment` interface and the `commentSchema`, representing the
 * `Comment` collection in the MongoDB database, and provides an interface for interacting with
 * the stored comments.
 *
 * @type {Model<DatabasePreferences>}
 */
const PreferencesModel: Model<DatabasePreferences> = mongoose.model<DatabasePreferences>(
  'Preferences',
  preferencesSchema,
);

export default PreferencesModel;
