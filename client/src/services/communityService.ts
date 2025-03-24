import { ObjectId } from 'mongodb';
import api from './config';
import { Community, DatabaseCommunity, PopulatedDatabaseCommunity } from '../types/types';

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

/**
 * Function to retrieve a community by its ID.
 * @param id The ID of the community to retrieve
 * @throws Error if there is an issue fetching the community.
 */
const getCommunityById = async (id: string): Promise<PopulatedDatabaseCommunity> => {
  const res = await api.get(`${COMMUNITY_API_URL}/getCommunityById/${id}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching community');
  }
  return res.data;
};

/**
 * Function to add a new question to the community.
 * @param communityId The ID of the community to add the question to
 * @param questionId The ID of the question to add to the community
 * @throws Error if there is an issue adding the question to the community.
 */
const addQuestionToCommunity = async (
  communityId: string,
  questionId: string,
): Promise<DatabaseCommunity> => {
  const res = await api.post(`${COMMUNITY_API_URL}/addQuestionToCommunity`, {
    communityId,
    questionId,
  });
  if (res.status !== 200) {
    throw new Error('Error when adding question to community');
  }
  return res.data;
};

/**
 * Function to delete a question from a community.
 * @param communityId The ID of the community to delete the question from
 * @param questionId The ID of the question to delete from the community
 * @throws Error if there is an issue deleting the question from the community.
 */
const deleteQuestionFromCommunity = async (
  communityId: ObjectId,
  questionId: ObjectId,
): Promise<DatabaseCommunity> => {
  const res = await api.delete(
    `${COMMUNITY_API_URL}/deleteQuestionFromCommunity/${communityId}/${questionId}`,
  );
  if (res.status !== 200) {
    throw new Error('Error when deleting question from community');
  }
  return res.data;
};

/**
 * Function to update the users role in the community.
 * @param communityId The ID of the community to update the role in
 * @param username The username of the user to update the role for
 * @param role The new role for the user
 */
const updateUserRole = async (
  communityId: ObjectId,
  username: string,
  role: string,
): Promise<DatabaseCommunity> => {
  const res = await api.patch(`${COMMUNITY_API_URL}/updateCommunityRole`, {
    communityId,
    username,
    role,
  });
  if (res.status !== 200) {
    throw new Error('Error when updating community role');
  }
  return res.data;
};

/**
 * Function to add a user to a community.
 * @param communityId The ID of the community to add the user to
 * @param username The username of the user to add to the community
 */
const addUserToCommunity = async (
  communityId: ObjectId,
  username: string,
): Promise<DatabaseCommunity> => {
  const res = await api.patch(`${COMMUNITY_API_URL}/addUserToCommunity`, {
    communityId,
    username,
  });
  if (res.status !== 200) {
    throw new Error('Error when adding user to community');
  }
  return res.data;
};

/**
 * Function to pin a question to a community.
 * @param communityId The ID of the community to pin the question in
 * @param questionId The ID of the question to pin in the community
 */
const pinQuestion = async (
  communityId: ObjectId,
  questionId: ObjectId,
): Promise<DatabaseCommunity> => {
  const res = await api.patch(`${COMMUNITY_API_URL}/pinQuestion`, {
    communityId,
    questionId,
  });
  if (res.status !== 200) {
    throw new Error('Error when pinning question in community');
  }
  return res.data;
};

/**
 * Function to unpin a question from a community.
 * @param communityId The ID of the community to unpin the question in
 * @param questionId The ID of the question to unpin in the community
 */
const unpinQuestion = async (
  communityId: ObjectId,
  questionId: ObjectId,
): Promise<DatabaseCommunity> => {
  const res = await api.patch(`${COMMUNITY_API_URL}/unpinQuestion`, {
    communityId,
    questionId,
  });
  if (res.status !== 200) {
    throw new Error('Error when unpinning question in community');
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
  getCommunityById,
  addQuestionToCommunity,
  deleteQuestionFromCommunity,
  updateUserRole,
  addUserToCommunity,
  pinQuestion,
  unpinQuestion,
};
