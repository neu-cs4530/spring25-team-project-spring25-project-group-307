import {
  Community,
  DatabaseCommunity,
  PopulatedDatabaseCommunity,
  PopulatedDatabaseQuestion,
  SafeDatabaseUser,
} from '../types/types';
import CommunityModel from '../models/communities.model';
import { getUserByUsername } from './user.service';

/**
 * Retrieves all communities from the database.
 * @returns {Promise<DatabaseCommunity[]>} - An array of communities or an empty array if error occurs.
 */
const getCommunities = async (): Promise<DatabaseCommunity[]> => {
  try {
    const communities: DatabaseCommunity[] = await CommunityModel.find({});
    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves all communities that match a search query.
 * @param {string} search - The search query to match communities against
 * @returns {Promise<DatabaseCommunity[]>} - An array of communities or an empty array if error occurs.
 */
const getCommunitiesBySearch = async (search: string): Promise<DatabaseCommunity[]> => {
  try {
    const communities: DatabaseCommunity[] = await CommunityModel.find({
      title: { $regex: search, $options: 'i' },
    });
    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves all communities that a user is a member of.
 * @param {string} username - The username of the user to fetch communities for
 * @returns {Promise<DatabaseCommunity[]>} - An array of communities or an empty array if error occurs.
 */
const getCommunitiesByUser = async (username: string): Promise<DatabaseCommunity[]> => {
  try {
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }
    const communities: DatabaseCommunity[] = await CommunityModel.find({ members: user._id });
    return communities;
  } catch (error) {
    return [];
  }
};

/**
 * Adds a community to the database if it does not already exist.
 *
 * @param {Community} community - The community to add
 * @returns {Promise<Community | null>} - The added or existing community, or `null` if an error occurred
 */
const addCommunity = async (community: Community): Promise<DatabaseCommunity | null> => {
  try {
    // Check if a community with the given name already exists
    const existingCommunity: DatabaseCommunity | null = await CommunityModel.findOne({
      title: community.title,
    });

    if (existingCommunity) {
      return existingCommunity;
    }

    // If the community does not exist, create a new one
    const savedCommunity: DatabaseCommunity = await CommunityModel.create(community);

    return savedCommunity;
  } catch (error) {
    return null;
  }
};

/**
 * Adds a user to a community if they are not already a member.
 * @param title the title of the community to join
 * @param username the username of the user to join the community
 * @returns the community the user joined or null if an error occurred
 */
const joinCommunity = async (
  title: string,
  username: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }
    const filter = {
      title,
    };
    const communityWithUser: DatabaseCommunity | null = await CommunityModel.findOne({
      ...filter,
      members: { $in: user._id },
    });

    if (communityWithUser) {
      throw new Error();
    }

    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      filter,
      {
        $push: { members: user._id },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Removes a user from a community
 * @param title the title of the community to leave
 * @param username the username of the user to leave the community
 * @returns the community the user left or null if an error occurred
 */
const leaveCommunity = async (
  title: string,
  username: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const user = await getUserByUsername(username);
    if ('error' in user) {
      throw new Error(user.error);
    }
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { title },
      {
        $pull: { members: user._id },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Retrieves a community by its ID.
 * @param id the ID of the community to retrieve
 * @returns the community with the given ID or null if an error occurred
 */
const getCommunityById = async (id: string): Promise<PopulatedDatabaseCommunity | null> => {
  try {
    const community: PopulatedDatabaseCommunity | null = await CommunityModel.findOne({
      _id: id,
    }).populate<{
      members: SafeDatabaseUser[];
      questions: PopulatedDatabaseQuestion[];
    }>([
      { path: 'members', model: 'User', select: '-password' },
      {
        path: 'questions',
        model: 'Question',
        populate: [
          { path: 'tags', model: 'Tag' },
          { path: 'answers', model: 'Answer', populate: { path: 'comments', model: 'Comment' } },
          { path: 'comments', model: 'Comment' },
        ],
      },
    ]);

    return community;
  } catch (error) {
    return null;
  }
};

/**
 * Adds a question to a community.
 * @param communityId the ID of the community to add the question to
 * @param questionId the ID of the question to add to the community
 * @returns the community with the added question or null if an error occurred
 */
const addQuestionToCommunity = async (
  communityId: string,
  questionId: string,
): Promise<DatabaseCommunity | null> => {
  try {
    const community: DatabaseCommunity | null = await CommunityModel.findOneAndUpdate(
      { _id: communityId },
      {
        $push: { questions: questionId },
      },
      { new: true },
    );
    return community;
  } catch (error) {
    return null;
  }
};

export {
  getCommunities,
  getCommunitiesBySearch,
  getCommunitiesByUser,
  addCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  addQuestionToCommunity,
};
