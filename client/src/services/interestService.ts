import { ObjectId } from 'mongodb';
import { Interest } from '../types/types';
import api from './config';

const INTEREST_API_URL = `${process.env.REACT_APP_SERVER_URL}/interest`;

const getInterestsByUser = async (userId: ObjectId): Promise<Interest[]> => {
  const res = await api.get(`${INTEREST_API_URL}/getInterestsByUser/${userId}`);
  return res.data;
};

const getInterestsByTags = async (tagIds: ObjectId[]): Promise<Interest[]> => {
  const res = await api.post(`${INTEREST_API_URL}/getInterestsByTags`, { tagIds });
  return res.data;
};

const getInterestsByUserAndTags = async (
  userId: ObjectId,
  tagIds: ObjectId[],
): Promise<Interest[]> => {
  const res = await api.post(`${INTEREST_API_URL}/getInterestsByUserAndTags`, { userId, tagIds });
  return res.data;
};

const updateInterests = async (username: string, interests: Interest[]): Promise<void> => {
  await api.post(`${INTEREST_API_URL}/updateInterests`, { username, interests });
};

export { getInterestsByUser, getInterestsByTags, getInterestsByUserAndTags, updateInterests };
