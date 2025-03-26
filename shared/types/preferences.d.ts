import { ObjectId } from 'mongodb';
import { Request } from 'express';

/**
 * User preferences  for a community will be one of the following
 */
// Todo: add more of these
export type UserPreference = 'All Questions';

/**
 * Interface to represent the Preferences a user has for notification in a community
 */
export interface Preferences {
  username: string;
  communityTitle: string;
  userPreferences: UserPreference[];
}
/**
 * Interface to represent the DatabasePreferences a user has for notification in a community which has an id field
 */
export interface DatabasePreferences extends Preferences {
  _id: ObjectId;
}

export interface PreferenceRequest extends Request {
  body: {
    userPreference: UserPreference;
    username: string;
    communityTitle: string;
  };
}

export type PreferencesResponse = DatabasePreferences | { error: string };
