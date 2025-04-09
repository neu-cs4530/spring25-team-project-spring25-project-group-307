import { ObjectId } from 'mongodb';
import api from './config';
import { Comment, DatabaseComment, PopulatedDatabaseComment, VoteInterface } from '../types/types';

const COMMENT_API_URL = `${process.env.REACT_APP_SERVER_URL}/comment`;

/**
 * Interface extending the request body when adding a comment to a question or an answer, which contains:
 * - id - The unique identifier of the question or answer being commented on.
 * - type - The type of the comment, either 'question' or 'answer'.
 * - comment - The comment being added.
 */
interface AddCommentRequestBody {
  id?: string;
  type: 'question' | 'answer' | 'comment';
  comment: Comment;
}

/**
 * Adds a new comment to a specific question.
 *
 * @param id - The ID of the question to which the comment is being added.
 * @param type - The type of the comment, either 'question' or 'answer'.
 * @param comment - The comment object containing the comment details.
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
const addComment = async (
  id: string,
  type: 'question' | 'answer' | 'comment',
  comment: Comment,
): Promise<{ answer: DatabaseComment; unlockedAchievements: string[] }> => {
  const reqBody: AddCommentRequestBody = {
    id,
    type,
    comment,
  };
  const res = await api.post(`${COMMENT_API_URL}/addComment`, reqBody);
  if (res.status !== 200) {
    throw new Error('Error while creating a new comment for the question');
  }
  return {
    answer: res.data.answer,
    unlockedAchievements: res.data.unlockedAchievements ?? [],
  };
};

const deleteComment = async (cid: ObjectId): Promise<DatabaseComment> => {
  const res = await api.delete(`${COMMENT_API_URL}/deleteComment/${cid}`);
  if (res.status !== 200) {
    throw new Error('Error while deleting a comment');
  }
  return res.data;
};

/**
 * Gets the populated replies for a specific comment.
 * @param cid - The ID of the comment for which to fetch replies.
 * @returns The populated replies for the specified comment.
 * @throws Error if the request fails or the response status is not 200.
 */
const getReplies = async (cid: string): Promise<PopulatedDatabaseComment> => {
  const res = await api.get(`${COMMENT_API_URL}/getComment/${cid}`);
  if (res.status !== 200) {
    throw new Error('Error while fetching replies for the comment');
  }
  return res.data;
};

/**
 * Upvotes a comment.
 */
const upvoteComment = async (
  cid: ObjectId,
  username: string,
): Promise<{ answer: VoteInterface; unlockedAchievements: string[] }> => {
  const res = await api.post(`${COMMENT_API_URL}/upvoteComment`, { cid, username });
  if (res.status !== 200) {
    throw new Error('Error while upvoting the comment');
  }
  return {
    answer: res.data,
    unlockedAchievements: res.data.unlockedAchievements ?? [],
  };
};

/**
 * Downvotes a comment.
 */
const downvoteComment = async (
  cid: ObjectId,
  username: string,
): Promise<{ answer: VoteInterface; unlockedAchievements: string[] }> => {
  const res = await api.post(`${COMMENT_API_URL}/downvoteComment`, { cid, username });
  if (res.status !== 200) {
    throw new Error('Error while downvoting the comment');
  }
  return {
    answer: res.data,
    unlockedAchievements: res.data.unlockedAchievements ?? [],
  };
};

export { addComment, deleteComment, getReplies, upvoteComment, downvoteComment };
