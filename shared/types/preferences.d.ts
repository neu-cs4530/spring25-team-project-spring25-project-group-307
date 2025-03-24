/**
 * Interface to represent the Preferences a user has for notification in a community
 */
export interface Preferences {
  user: ObjectId;
  community: ObjectId[];
  userPreferences: UserPreference[];
}
/**
* Interface to represent the DatabasePreferences a user has for notification in a community which has an id field

 */
export interface DatabasePreferences extends Preferences {
  _id: ObjectId;
}
/**
 * User preferences  for a community will be one of the following
 */
// Todo: add more of these
export type UserPreference = 'All Questions';
