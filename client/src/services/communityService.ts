import api from './config';
import { Community, DatabaseCommunity } from '../types/types';

const COMMUNITY_API_URL = `${process.env.REACT_APP_SERVER_URL}/community`;

/**
 * Function to fetch all messages in ascending order of their date and time.
 * @param user The user to fetch their chat for
 * @throws Error if there is an issue fetching the list of chats.
 */
const getCommunities = async (): Promise<DatabaseCommunity[]> => {
  const res = await api.get(`${COMMUNITY_API_URL}/getCommunities`);
  if (res.status !== 200) {
    throw new Error('Error when fetching list of communities');
  }
  return res.data;
};

/**
 * Function to add a new community to the database.
 * @param community The community to add
 * @throws Error if there is an issue adding the community.
 */
const addCommunity = async (community: Community): Promise<DatabaseCommunity> => {
  const res = await api.post(`${COMMUNITY_API_URL}/saveCommunity`, community);
  if (res.status !== 200) {
    throw new Error('Error when saving community');
  }
  return res.data;
};

/**
 * Function to join a new community.
 * @param title title of community
 * @param username username of user trying to join
 * @throws Error if there is an issue joining the community.
 */
const joinCommunity = async (title: string, username: string): Promise<DatabaseCommunity> => {
  const res = await api.post(`${COMMUNITY_API_URL}/joinCommunity`, { username, title });
  if (res.status !== 200) {
    throw new Error('Error when saving community');
  }
  return res.data;
};

export { getCommunities, addCommunity, joinCommunity };
