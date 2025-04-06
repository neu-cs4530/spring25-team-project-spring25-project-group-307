import { ObjectId } from 'mongodb';
import { DatabaseQuestion, FeedItem } from '../types/types';
import api from './config';

const FEED_API_URL = `${process.env.REACT_APP_SERVER_URL}/feed`;

/**
 * Function to refresh feed
 * @param userId - The user ID to refresh feed for
 * @returns {Promise<Feed>} - The refreshed feed
 */
const refresh = async (userId: ObjectId): Promise<DatabaseQuestion[]> => {
  const res = await api.post(`${FEED_API_URL}/refresh`, { userId });
  return res.data;
};

/**
 * Function to get next feed items
 * @param userId - The user ID to get feed items for
 * @param limit - The number of feed items to get
 * @returns {Promise<Feed>} - The next feed items
 */
const getNext = async (userId: ObjectId, limit: number): Promise<FeedItem[]> => {
  const res = await api.post(`${FEED_API_URL}/next`, { userId, limit });
  return res.data;
};

const getHistory = async (
  userId: ObjectId,
  numFeedQuestionsBeforeNav: number,
): Promise<FeedItem[]> => {
  const res = await api.post(`${FEED_API_URL}/history`, { userId, numFeedQuestionsBeforeNav });
  return res.data;
};

export { refresh, getNext, getHistory };
