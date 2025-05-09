import { ObjectId } from 'mongodb';
import {
  DatabaseCommunity,
  PopulatedDatabaseQuestion,
  Question,
  QuestionResponse,
  VoteInterface,
} from '../types/types';
import api from './config';

const QUESTION_API_URL = `${process.env.REACT_APP_SERVER_URL}/question`;

/**
 * Function to get questions by filter.
 *
 * @param order - The order in which to fetch questions. Default is 'newest'.
 * @param search - The search term to filter questions. Default is an empty string.
 * @throws Error if there is an issue fetching or filtering questions.
 */
const getQuestionsByFilter = async (
  order: string = 'newest',
  search: string = '',
): Promise<PopulatedDatabaseQuestion[]> => {
  const res = await api.get(`${QUESTION_API_URL}/getQuestion?order=${order}&search=${search}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching or filtering questions');
  }
  return res.data;
};

/**
 * Function to get a question by its ID.
 *
 * @param qid - The ID of the question to retrieve.
 * @param username - The username of the user requesting the question.
 * @throws Error if there is an issue fetching the question by ID.
 */
const getQuestionById = async (
  qid: string,
  username: string,
): Promise<PopulatedDatabaseQuestion> => {
  const res = await api.get(`${QUESTION_API_URL}/getQuestionById/${qid}?username=${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching question by id');
  }
  return res.data;
};

/**
 * Function to add a new question.
 *
 * @param q - The question object to add.
 * @throws Error if there is an issue creating the new question.
 */
const addQuestion = async (
  q: Question,
): Promise<{ question: PopulatedDatabaseQuestion; unlockedAchievements: string[] }> => {
  const res = await api.post(`${QUESTION_API_URL}/addQuestion`, q);

  if (res.status !== 200) {
    throw new Error('Error while creating a new question');
  }

  return {
    question: res.data.question,
    unlockedAchievements: res.data.unlockedAchievements ?? [],
  };
};

/**
 * Function to delete a question.
 * @param qid - The ID of the question to delete.
 * @throws Error if there is an issue deleting the question.
 */
const deleteQuestion = async (qid: ObjectId): Promise<QuestionResponse> => {
  const res = await api.delete(`${QUESTION_API_URL}/deleteQuestion/${qid}`);
  if (res.status !== 200) {
    throw new Error('Error while deleting the question');
  }
  return res.data;
};

/**
 * Function to upvote a question.
 *
 * @param qid - The ID of the question to upvote.
 * @param username - The username of the person upvoting the question.
 * @throws Error if there is an issue upvoting the question.
 */
const upvoteQuestion = async (
  qid: ObjectId,
  username: string,
): Promise<{ answer: VoteInterface; unlockedAchievements: string[] }> => {
  const data = { qid, username };
  const res = await api.post(`${QUESTION_API_URL}/upvoteQuestion`, data);
  if (res.status !== 200) {
    throw new Error('Error while upvoting the question');
  }
  return {
    answer: res.data.answer,
    unlockedAchievements: res.data.unlockedAchievements ?? [],
  };
};

/**
 * Function to downvote a question.
 *
 * @param qid - The ID of the question to downvote.
 * @param username - The username of the person downvoting the question.
 * @throws Error if there is an issue downvoting the question.
 */
const downvoteQuestion = async (
  qid: ObjectId,
  username: string,
): Promise<{ answer: VoteInterface; unlockedAchievements: string[] }> => {
  const data = { qid, username };
  const res = await api.post(`${QUESTION_API_URL}/downvoteQuestion`, data);
  if (res.status !== 200) {
    throw new Error('Error while downvoting the question');
  }
  return {
    answer: res.data.answer,
    unlockedAchievements: res.data.unlockedAchievements ?? [],
  };
};

/**
 * Function to determine what community a question is in.
 * @param qid - The question to determine the community for.
 * @returns the community the question is in or null if the question is not in a community
 */
const getCommunityQuestion = async (qid: ObjectId): Promise<DatabaseCommunity | null> => {
  const res = await api.get(`${QUESTION_API_URL}/getCommunityQuestion/${qid}`);
  if (res.status !== 200) {
    return null;
  }
  return res.data;
};

const addReportToQuestion = async (qid: string, username: string): Promise<QuestionResponse> => {
  const res = await api.post(`${QUESTION_API_URL}/addReportToQuestion/${qid}`, { username });
  if (res.status !== 200) {
    throw new Error('Error when adding report to question');
  }
  return res.data;
};

const removeReportFromQuestion = async (
  qid: string,
  username: string,
): Promise<QuestionResponse> => {
  const res = await api.post(`${QUESTION_API_URL}/removeReportFromQuestion/${qid}`, { username });
  if (res.status !== 200) {
    throw new Error('Error when removing report from question');
  }
  return res.data;
};

/**
 * Function to determine if the question is a public question.
 * @param qid - The question to determine if it is public.
 * @returns the question if it is public or null if the question is not public
 */
const getPublicQuestion = async (qid: ObjectId): Promise<PopulatedDatabaseQuestion | null> => {
  const res = await api.get(`${QUESTION_API_URL}/getPublicQuestion/${qid}`);
  if (res.status !== 200) {
    return null;
  }
  return res.data;
};

export {
  getQuestionsByFilter,
  getQuestionById,
  addQuestion,
  deleteQuestion,
  upvoteQuestion,
  downvoteQuestion,
  getCommunityQuestion,
  addReportToQuestion,
  removeReportFromQuestion,
  getPublicQuestion,
};
