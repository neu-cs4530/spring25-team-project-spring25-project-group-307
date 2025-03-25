import { DatabasePreferences, UserPreference } from '@fake-stack-overflow/shared';
import api from './config';

const PREFERENCES_API_URL = `${process.env.REACT_APP_SERVER_URL}/preferences`;
/**
 * adds a notification preference for a user and specific community
 * @param userPreference
 * @param username
 * @param communityTitle
 * @returns
 */
const addPreference = async (
  userPreference: UserPreference,
  username: string,
  communityTitle: string,
): Promise<DatabasePreferences[]> => {
  const data = {
    userPreference,
    username,
    communityTitle,
  };
  console.log('here');
  const res = await api.post(`${PREFERENCES_API_URL}/addPreference`, data);
  if (res.status !== 200) {
    throw new Error('Error when adding preference');
  }
  return res.data;
};

export default addPreference;
