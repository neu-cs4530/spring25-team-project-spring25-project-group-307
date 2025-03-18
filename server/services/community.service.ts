import { Community, DatabaseCommunity } from '../types/types';
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
 *
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

export { getCommunities, getCommunitiesBySearch, getCommunitiesByUser, addCommunity, joinCommunity, leaveCommunity };
