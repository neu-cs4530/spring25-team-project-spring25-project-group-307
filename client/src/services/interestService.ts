import { ObjectId } from 'mongodb';
import { Interest } from '../types/types';
import api from './config';

const INTEREST_API_URL = `${process.env.REACT_APP_SERVER_URL}/interest`;

/**
 * Function to get interests by user
 * @param userId - The user ID to retrieve interests from
 * @returns {Promise<Interest[]>} - The list of interests
 */
const getInterestsByUser = async (userId: ObjectId): Promise<Interest[]> => {
  const res = await api.get(`${INTEREST_API_URL}/getInterestsByUser/${userId}`);
  return res.data;
};

const resetInterestsWeightsByUser = async (userId: ObjectId): Promise<void> => {
  await api.post(`${INTEREST_API_URL}/resetInterestsWeightsByUser`, { userId });
};

/**
 * Function to get interests by tags
 * @param tagIds - The tag IDs to retrieve interests from
 * @returns {Promise<Interest[]>} - The list of interests
 */
const getInterestsByTags = async (tagIds: ObjectId[]): Promise<Interest[]> => {
  const res = await api.post(`${INTEREST_API_URL}/getInterestsByTags`, { tagIds });
  return res.data;
};

/**
 * Function to get interests by user and tags
 * @param userId - The user ID to retrieve interests from
 * @param tagIds - The tag IDs to retrieve interests from
 * @returns {Promise<Interest[]>} - The list of interests
 */
const getInterestsByUserAndTags = async (
  userId: ObjectId,
  tagIds: ObjectId[],
): Promise<Interest[]> => {
  const res = await api.post(`${INTEREST_API_URL}/getInterestsByUserAndTags`, { userId, tagIds });
  return res.data;
};

/**
 * Function to update interests
 * @param username - The username to update interests for
 * @param interests - The interests to update
 */
const updateInterests = async (username: string, interests: Interest[]): Promise<void> => {
  await api.post(`${INTEREST_API_URL}/updateInterests`, { username, interests });
};

const updateInterestsWeights = async (
  userId: ObjectId,
  tagIds: ObjectId[],
  isInterested: boolean,
): Promise<void> => {
  await api.post(`${INTEREST_API_URL}/updateInterestsWeights`, { userId, tagIds, isInterested });
};

export {
  getInterestsByUser,
  getInterestsByTags,
  getInterestsByUserAndTags,
  updateInterests,
  updateInterestsWeights,
  resetInterestsWeightsByUser,
};
