import api from './config';
import { DatabaseCommunity } from '../types/types';

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

export default getCommunities;
