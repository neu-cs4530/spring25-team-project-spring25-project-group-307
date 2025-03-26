import { PreferencesResponse, UserPreference } from '@fake-stack-overflow/shared';
import PreferencesModel from '../models/preferences.model';
import { getUserByUsername } from './user.service';
import { error } from 'console';
import { getCommunitiesByUser } from './community.service';
// TODO : add tests
/**
 * adds a userPreference to an existing Preferences for a community,
 * otherwise creates a new Preferences and adds the userPreference
 *
 * @param userPreference the user preference to add
 * @param username username of the user
 * @param communityTitle title of the community
 * @returns
 */
export const addUserPreferenceToCommunity = async (
  userPreference: UserPreference,
  username: string,
  communityTitle: string,
): Promise<PreferencesResponse> => {
  try {
    const preferences = await PreferencesModel.findOneAndUpdate(
      { username, communityTitle },
      { $addToSet: { userPreferences: userPreference } },
      { new: true },
    );

    if (preferences) {
      return preferences;
    }
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error as string);
    }

    const createdPreferences = PreferencesModel.create({
      userPreferences: [userPreference],
      username,
      communityTitle,
    });
    return createdPreferences;
  } catch (error) {
    return { error: 'Error when saving a preference' };
  }
};
/**
 * removes the given userPreference from the given community for the given user
 * @param userPreference
 * @param username
 * @param communityTitle
 * @returns
 */
export const removeUserPreferenceFromCommunity = async (
  userPreference: UserPreference,
  username: string,
  communityTitle: string,
): Promise<PreferencesResponse> => {
  try {
    const preferences = await PreferencesModel.findOneAndUpdate(
      { username, communityTitle },
      { $pull: { userPreferences: userPreference } },
      { new: true },
    );

    if (preferences) {
      return preferences;
    }

    throw new Error('preferences not found for community and user');
  } catch (error) {
    return { error: 'Error when saving a preference' };
  }
};

/**
 * Retrieves the preferences for a given user and community.
 *
 * @param username username of the user
 * @param communityTitle title of the community
 * @returns PreferencesResponse containing the user's preferences for the community
 */
export const getPreferencesForCommunity = async (
  username: string,
  communityTitle: string,
): Promise<PreferencesResponse> => {
  try {
    const preferences = await PreferencesModel.findOne({ username, communityTitle });

    if (!preferences) {
      throw new Error('Preferences not found for the given user and community');
    }

    return preferences;
  } catch (error) {
    return { error: 'Error retrieving preferences' };
  }
};
