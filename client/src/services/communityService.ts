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
 * Function to fetch all communities that match a search query.
 * @param search The search query to match communities against
 * @throws Error if there is an issue fetching the list of communities.
 */
const getCommunitiesBySearch = async (search: string): Promise<DatabaseCommunity[]> => {
  const res = await api.get(`${COMMUNITY_API_URL}/getCommunitiesBySearch/${search}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching list of communities');
  }
  return res.data;
};

/**
 * Function to fetch all communities that a user is a member of.
 * @param username The user to fetch their communities for
 * @throws Error if there is an issue fetching the list of communities.
 */
const getCommunitiesByUser = async (username: string): Promise<DatabaseCommunity[]> => {
  const res = await api.get(`${COMMUNITY_API_URL}/getCommunitiesByUser/${username}`);
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

/**
 * Function to leave a community.
 * @param title title of community
 * @param username username of user trying to leave
 * @throws Error if there is an issue leaving the community.
 */
const leaveCommunity = async (title: string, username: string): Promise<DatabaseCommunity> => {
  const res = await api.post(`${COMMUNITY_API_URL}/leaveCommunity`, { username, title });
  if (res.status !== 200) {
    throw new Error('Error when saving community');
  }
  return res.data;
};

export {
  getCommunities,
  addCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunitiesByUser,
  getCommunitiesBySearch,
};
