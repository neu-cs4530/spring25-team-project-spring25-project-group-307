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

  const res = await api.post(`${PREFERENCES_API_URL}/addPreference`, data);
  if (res.status !== 200) {
    throw new Error('Error when adding preference');
  }
  return res.data;
};

const removePreference = async (
  userPreference: UserPreference,
  username: string,
  communityTitle: string,
) => {
  const data = {
    userPreference,
    username,
    communityTitle,
  };

  const res = await api.post(`${PREFERENCES_API_URL}/removePreference`, data);
  if (res.status !== 200) {
    throw new Error('Error when removing preference');
  }
  return res.data;
};

const getPreferences = async (
  username: string,
  communityTitle: string,
): Promise<DatabasePreferences> => {
  const res = await api.get(
    `${PREFERENCES_API_URL}/getPreferences?username=${username}&communityTitle=${communityTitle}`,
  );
  if (res.status !== 200) {
    throw new Error('Error when removing preference');
  }
  return res.data;
};

export { addPreference, removePreference, getPreferences };
