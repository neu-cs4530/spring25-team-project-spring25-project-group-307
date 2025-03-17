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

export { getCommunities, addCommunity, joinCommunity };
