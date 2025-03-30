import { ObjectId } from 'mongodb';
import { Answer, PopulatedDatabaseAnswer, VoteInterface } from '../types/types';
import api from './config';

const ANSWER_API_URL = `${process.env.REACT_APP_SERVER_URL}/answer`;

/**
 * Adds a new answer to a specific question.
 *
 * @param qid - The ID of the question to which the answer is being added.
 * @param ans - The answer object containing the answer details.
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
const addAnswer = async (qid: string, ans: Answer): Promise<PopulatedDatabaseAnswer> => {
  const data = { qid, ans };

  const res = await api.post(`${ANSWER_API_URL}/addAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while creating a new answer');
  }
  return res.data;
};

const deleteAnswer = async (aid: ObjectId): Promise<PopulatedDatabaseAnswer> => {
  const res = await api.delete(`${ANSWER_API_URL}/deleteAnswer/${aid}`);
  if (res.status !== 200) {
    throw new Error('Error while deleting an answer');
  }
  return res.data;
};

/**
 * Upvotes an answer.
 *
 * @param aid - The answer ID to upvote.
 * @param username - The username of the user performing the upvote.
 * @returns VoteInterface containing updated vote data.
 */
const upvoteAnswer = async (aid: ObjectId, username: string): Promise<VoteInterface> => {
  const data = { aid, username };
  const res = await api.post(`${ANSWER_API_URL}/upvoteAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while upvoting the answer');
  }
  return res.data;
};

/**
 * Downvotes an answer.
 *
 * @param aid - The answer ID to downvote.
 * @param username - The username of the user performing the downvote.
 * @returns VoteInterface containing updated vote data.
 */
const downvoteAnswer = async (aid: ObjectId, username: string): Promise<VoteInterface> => {
  const data = { aid, username };
  const res = await api.post(`${ANSWER_API_URL}/downvoteAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while downvoting the answer');
  }
  return res.data;
};

export { addAnswer, deleteAnswer, upvoteAnswer, downvoteAnswer };
